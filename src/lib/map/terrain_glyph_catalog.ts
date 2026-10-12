import type { Vertex } from '$lib/geometry';
import type {
  GlyphInkStroke,
  SketchPoint,
  TerrainGlyphDefinition,
  TerrainGlyphFamily,
  TerrainGlyphVariant,
} from './terrain_glyph_types';

/** Coordinates below are authored pen sketches; convert them once to local map-symbol units. */
const point = ([x, y]: SketchPoint): Vertex => ({ x: x * 0.032, y: y * 0.032 });

function pen(points: readonly SketchPoint[], width = 1.3): GlyphInkStroke {
  const p = points.map(point);
  return {
    peakWidth: width * 0.032,
    taperPower: 0.65,
    segments: p.slice(0, -1).map((start, i) => {
      const before = p[Math.max(0, i - 1)];
      const end = p[i + 1];
      const after = p[Math.min(p.length - 1, i + 2)];
      return {
        start,
        control1: { x: start.x + (end.x - before.x) / 6, y: start.y + (end.y - before.y) / 6 },
        control2: { x: end.x - (after.x - start.x) / 6, y: end.y - (after.y - start.y) / 6 },
        end,
      };
    }),
  };
}

function bodyPath(stroke: GlyphInkStroke): string {
  const coordinate = (p: Vertex): string => `${Number(p.x.toFixed(3))} ${Number(p.y.toFixed(3))}`;
  const start = stroke.segments[0].start;
  return `M ${coordinate(start)} ${stroke.segments
    .map(
      ({ control1: a, control2: b, end: c }) =>
        `C ${coordinate(a)} ${coordinate(b)} ${coordinate(c)}`,
    )
    .join(' ')} Z`;
}

function crossHatch(x: number, y: number, count = 4): GlyphInkStroke[] {
  return [
    ...Array.from({ length: count }, (_, i) =>
      pen(
        [
          [x + i * 3, y + i * 2],
          [x + 5 + i * 3, y + 7 + i * 2],
        ],
        0.55,
      ),
    ),
    ...Array.from({ length: count - 1 }, (_, i) =>
      pen(
        [
          [x + 2 + i * 3, y + 8 + i * 2],
          [x + 10 + i * 3, y + 5 + i * 2],
        ],
        0.45,
      ),
    ),
  ];
}

/** Convex control hull plus ribbon padding bounds the curves, body fills, and every ink edge. */
function footprint(strokes: GlyphInkStroke[]): Vertex[] {
  const points = strokes.flatMap((stroke) =>
    stroke.segments.flatMap((segment) =>
      [segment.start, segment.control1, segment.control2, segment.end].flatMap((p) => {
        const pad = stroke.peakWidth / 2 + 0.003;
        return [-pad, pad].flatMap((dx) => [-pad, pad].map((dy) => ({ x: p.x + dx, y: p.y + dy })));
      }),
    ),
  );
  const sorted = points.sort((a, b) => a.x - b.x || a.y - b.y);
  const turn = (a: Vertex, b: Vertex, c: Vertex) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const chain = (vertices: Vertex[]) => {
    const hull: Vertex[] = [];
    for (const p of vertices) {
      while (hull.length > 1 && turn(hull[hull.length - 2], hull[hull.length - 1], p) <= 0)
        hull.pop();
      hull.push(p);
    }
    return hull.slice(0, -1);
  };
  return [...chain(sorted), ...chain([...sorted].reverse())];
}

function variant(
  id: string,
  strokes: GlyphInkStroke[],
  bodies: GlyphInkStroke[] = [],
): TerrainGlyphVariant {
  return {
    id,
    strokes,
    bodyPaths: bodies.map(bodyPath),
    footprint: footprint([...strokes, ...bodies]),
  };
}

const mountainContours: readonly (readonly SketchPoint[])[] = [
  [
    [-42, 0],
    [-29, -17],
    [-21, -39],
    [-12, -68],
    [-2, -45],
    [13, -26],
    [25, -17],
    [42, 0],
  ],
  [
    [-40, 0],
    [-26, -23],
    [-11, -43],
    [4, -72],
    [14, -47],
    [23, -30],
    [31, -12],
    [41, 0],
  ],
  [
    [-43, 0],
    [-32, -12],
    [-20, -30],
    [-5, -61],
    [6, -40],
    [19, -51],
    [29, -24],
    [43, 0],
  ],
  [
    [-41, 0],
    [-31, -21],
    [-20, -48],
    [-9, -38],
    [3, -69],
    [13, -44],
    [26, -18],
    [42, 0],
  ],
];
function mountains(high: boolean): TerrainGlyphVariant[] {
  return mountainContours.map((raw, i) => {
    const height = high ? 1 : 0.7;
    const contour = raw.map(([x, y]) => [x, y * height] as SketchPoint);
    const summit = contour.reduce((a, b) => (a[1] < b[1] ? a : b));
    const outline = pen(contour, 1.65);
    const ridge = pen(
      [summit, [summit[0] + 2, summit[1] * 0.68], [10, -19 * height], [12, -5]],
      1.05,
    );
    return variant(
      `mountain-${high ? 'high' : 'low'}-${i}`,
      [
        outline,
        ridge,
        pen(
          [
            [-31, -6],
            [-22, -12],
            [-14, -8],
          ],
          0.65,
        ),
        ...crossHatch(summit[0] + 7, summit[1] * 0.53, high ? 5 : 4),
      ],
      [outline],
    );
  });
}

const hillContours: readonly (readonly SketchPoint[])[] = [
  [
    [-39, 0],
    [-27, -13],
    [-12, -28],
    [5, -25],
    [23, -11],
    [40, 0],
  ],
  [
    [-41, 0],
    [-25, -9],
    [-3, -31],
    [12, -26],
    [24, -13],
    [39, 0],
  ],
  [
    [-40, 0],
    [-30, -15],
    [-16, -25],
    [-3, -17],
    [15, -20],
    [30, -8],
    [42, 0],
  ],
  [
    [-42, 0],
    [-29, -8],
    [-8, -21],
    [8, -29],
    [24, -17],
    [41, 0],
  ],
];
function hills(): TerrainGlyphVariant[] {
  return hillContours.map((contour, i) => {
    const outline = pen(contour, 1.45);
    return variant(
      `hill-${i}`,
      [
        outline,
        pen(
          [
            [-18, -6],
            [-4, -13],
            [10, -9],
          ],
          0.65,
        ),
        ...crossHatch(14, -14, 3),
      ],
      [outline],
    );
  });
}

const deciduousCrowns: SketchPoint[][] = [
  [
    [-5, -10],
    [-16, -12],
    [-23, -19],
    [-22, -25],
    [-26, -30],
    [-20, -38],
    [-12, -37],
    [-10, -45],
    [-1, -48],
    [8, -43],
    [15, -44],
    [21, -37],
    [19, -32],
    [25, -27],
    [22, -18],
    [13, -12],
    [5, -10],
  ],
  [
    [-5, -12],
    [-18, -13],
    [-24, -22],
    [-20, -29],
    [-23, -35],
    [-15, -41],
    [-8, -40],
    [-5, -48],
    [5, -50],
    [12, -43],
    [19, -39],
    [18, -32],
    [25, -26],
    [20, -17],
    [10, -12],
    [5, -12],
  ],
  [
    [-6, -11],
    [-19, -13],
    [-25, -20],
    [-23, -29],
    [-17, -32],
    [-19, -38],
    [-10, -45],
    [-2, -43],
    [5, -49],
    [14, -45],
    [16, -37],
    [23, -34],
    [22, -27],
    [26, -22],
    [19, -14],
    [6, -11],
  ],
  [
    [-5, -10],
    [-15, -12],
    [-21, -18],
    [-19, -24],
    [-24, -30],
    [-21, -37],
    [-14, -39],
    [-12, -46],
    [-2, -47],
    [4, -42],
    [13, -44],
    [20, -38],
    [18, -31],
    [24, -26],
    [21, -19],
    [14, -13],
    [5, -10],
  ],
];
function oak(crownPoints: SketchPoint[], i: number): TerrainGlyphVariant {
  const crown = pen(crownPoints, 2.1);
  const trunk = pen(
    [
      [-4, 0],
      [-3, -13],
      [-6, -22],
      [0, -17],
      [5, -25],
      [3, -12],
      [4, 0],
    ],
    2,
  );
  return variant(
    `tree-oak-${i}`,
    [
      trunk,
      crown,
      pen(
        [
          [-17, -28],
          [-12, -32],
          [-7, -30],
        ],
        0.7,
      ),
      pen(
        [
          [2, -37],
          [8, -39],
          [13, -35],
        ],
        0.65,
      ),
      pen(
        [
          [12, -24],
          [16, -21],
          [15, -17],
        ],
        0.6,
      ),
      pen(
        [
          [0, -4],
          [0, -12],
          [3, -17],
        ],
        0.6,
      ),
    ],
    [trunk, crown],
  );
}
const pineContours: SketchPoint[][] = [
  [
    [-3, 0],
    [-3, -8],
    [-21, -9],
    [-13, -18],
    [-19, -18],
    [-10, -29],
    [-14, -29],
    [-6, -40],
    [-8, -40],
    [0, -53],
    [7, -41],
    [5, -41],
    [13, -30],
    [9, -30],
    [18, -19],
    [12, -19],
    [22, -10],
    [3, -8],
    [3, 0],
  ],
  [
    [-3, 0],
    [-3, -9],
    [-20, -10],
    [-12, -21],
    [-17, -21],
    [-7, -32],
    [-12, -32],
    [-3, -43],
    [-5, -43],
    [2, -55],
    [9, -41],
    [6, -41],
    [15, -29],
    [10, -29],
    [20, -17],
    [14, -17],
    [23, -9],
    [4, -8],
    [4, 0],
  ],
  [
    [-4, 0],
    [-4, -9],
    [-23, -10],
    [-16, -19],
    [-19, -21],
    [-10, -31],
    [-14, -31],
    [-5, -41],
    [-8, -41],
    [-1, -51],
    [5, -40],
    [3, -38],
    [12, -29],
    [7, -29],
    [17, -20],
    [11, -19],
    [20, -10],
    [3, -8],
    [3, 0],
  ],
  [
    [-3, 0],
    [-3, -8],
    [-22, -10],
    [-14, -19],
    [-17, -19],
    [-8, -31],
    [-12, -31],
    [-4, -41],
    [-6, -41],
    [1, -54],
    [8, -42],
    [5, -42],
    [14, -32],
    [9, -31],
    [18, -21],
    [13, -20],
    [23, -11],
    [4, -9],
    [4, 0],
  ],
];
function pine(contourPoints: SketchPoint[], i: number): TerrainGlyphVariant {
  // Break the outline at the trunk base, leaving a tapered ground contact at each side.
  const outline = pen(contourPoints, 2.1);
  return variant(
    `tree-pine-${i}`,
    [
      outline,
      pen(
        [
          [0, -39],
          [2, -34],
          [7, -30],
        ],
        0.65,
      ),
      pen(
        [
          [-7, -26],
          [-3, -22],
          [3, -19],
        ],
        0.7,
      ),
      pen(
        [
          [6, -17],
          [10, -13],
          [14, -12],
        ],
        0.6,
      ),
      pen(
        [
          [0, -10],
          [0, -3],
        ],
        0.65,
      ),
    ],
    [outline],
  );
}
function palm(i: number): TerrainGlyphVariant {
  const lean = [-5, 1, 5, -2][i];
  const crownY = [-32, -35, -33, -34][i];
  const trunk = pen(
    [
      [-3, 0],
      [-5, -12],
      [lean - 1, crownY],
      [lean + 3, crownY],
      [-1, -12],
      [3, 0],
    ],
    2,
  );
  const strokes = [trunk];
  const bodies = [trunk];
  const frondVariants: SketchPoint[][] = [
    [
      [-22, 13],
      [-21, -1],
      [-8, -13],
      [11, -11],
      [23, 1],
      [21, 14],
    ],
    [
      [-24, 8],
      [-18, -6],
      [-4, -15],
      [13, -8],
      [24, 4],
      [15, 18],
    ],
    [
      [-18, 18],
      [-24, 3],
      [-12, -10],
      [5, -16],
      [21, -2],
      [24, 12],
    ],
    [
      [-24, 15],
      [-23, -3],
      [-7, -14],
      [15, -12],
      [25, 2],
      [18, 20],
    ],
  ];
  const fronds = frondVariants[i];
  for (const [index, [dx, dy]] of fronds.entries()) {
    const x = lean,
      y = crownY;
    const bend = (index < 3 ? -1 : 1) * (3 + (i % 2));
    const leaf = pen(
      [
        [x, y],
        [x + dx * 0.42, y + dy * 0.18 - 5],
        [x + dx * 0.8, y + dy * 0.64 - 3],
        [x + dx, y + dy],
        [x + dx * 0.66 + bend, y + dy * 0.58 + 2],
        [x + dx * 0.3 + bend, y + dy * 0.2 + 1],
        [x, y],
      ],
      2,
    );
    bodies.push(leaf);
    strokes.push(leaf);
    strokes.push(
      pen(
        [
          [x + dx * 0.18, y + dy * 0.08 - 1],
          [x + dx * 0.55, y + dy * 0.4 - 1],
          [x + dx * 0.87, y + dy * 0.8],
        ],
        0.6,
      ),
    );
  }
  strokes.push(
    pen(
      [
        [-2, -9],
        [1, -10],
      ],
      0.6,
    ),
    pen(
      [
        [-2, -17],
        [1, -18],
      ],
      0.6,
    ),
  );
  return variant(`tree-palm-${i}`, strokes, bodies);
}

function marshes(): TerrainGlyphVariant[] {
  const heights = [
    [34, 25, 43, 31, 38],
    [27, 42, 32, 46],
    [39, 29, 45, 34, 24, 37],
    [30, 44, 25, 40, 33],
  ];
  return heights.map((hs, v) => {
    const strokes: GlyphInkStroke[] = [];
    hs.forEach((h, i) => {
      const x = -22 + (i * 44) / (hs.length - 1);
      const lean = [-2, 3, -4, 1][v];
      strokes.push(
        pen(
          [
            [x, 0],
            [x + lean * 0.6, -h * 0.6],
            [x + lean, -h],
          ],
          1,
        ),
        pen(
          [
            [x, -4],
            [x - 7, -18],
            [x - 9, -24],
          ],
          0.7,
        ),
      );
      if (i % 2 === v % 2)
        strokes.push(
          pen(
            [
              [x + lean, -h + 7],
              [x + lean, -h - 1],
            ],
            2.7,
          ),
        );
    });
    for (const [x, y] of [
      [-34, 4],
      [-15, 10],
      [15, 14],
    ])
      strokes.push(
        pen(
          [
            [x, y],
            [x + 10, y - 1],
            [x + 23, y],
          ],
          0.8,
        ),
      );
    return variant(`marsh-${v}`, strokes);
  });
}
function prairies(): TerrainGlyphVariant[] {
  const heights = [
    [18, 29, 22, 36, 24, 30, 19],
    [27, 20, 33, 24, 18, 29],
    [23, 34, 19, 28, 38, 23, 17, 26],
    [30, 18, 26, 35, 21, 28, 20],
  ];
  return heights.map((hs, v) => {
    const strokes = hs.map((h, i) => {
      const x = -22 + (i * 44) / (hs.length - 1);
      return pen(
        [
          [x, 0],
          [x + 2, -h * 0.5],
          [x + 8 + v, -h],
        ],
        0.95,
      );
    });
    strokes.push(
      pen(
        [
          [-8, 0],
          [-9, -22],
          [v * 2, -44],
        ],
        0.9,
      ),
    );
    for (const y of [-29, -34, -39])
      strokes.push(
        pen(
          [
            [-4 + (y + 29) * -0.3, y + 3],
            [1 + (y + 29) * -0.3, y],
          ],
          1.6,
        ),
      );
    strokes.push(
      pen(
        [
          [-29, 2],
          [-11, 0],
          [12, 2],
        ],
        0.6,
      ),
    );
    return variant(`prairie-${v}`, strokes);
  });
}

function desertDunes(): TerrainGlyphVariant[] {
  const crests: SketchPoint[][] = [
    [
      [-38, 0],
      [-19, -8],
      [3, -20],
      [18, -15],
      [38, 0],
    ],
    [
      [-39, 0],
      [-26, -14],
      [-10, -19],
      [15, -7],
      [36, 0],
    ],
    [
      [-36, 0],
      [-16, -5],
      [12, -23],
      [24, -14],
      [40, 0],
    ],
    [
      [-40, 0],
      [-22, -9],
      [-2, -17],
      [23, -12],
      [37, 0],
    ],
  ];
  return crests.map((crest, v) =>
    variant(`desert-dune-${v}`, [
      pen(crest, 1.15),
      pen(
        [
          [crest[2][0], crest[2][1]],
          [crest[2][0] + 7, -7],
          [30, 1],
        ],
        0.7,
      ),
      pen(
        [
          [-28, 9],
          [-9 + v * 3, 3],
          [15, 9],
        ],
        0.65,
      ),
    ]),
  );
}

function desertRocks(): TerrainGlyphVariant[] {
  const tops: SketchPoint[][] = [
    [
      [-26, 0],
      [-22, -25],
      [-9, -32],
      [-2, -23],
      [11, -28],
      [24, 0],
    ],
    [
      [-25, 0],
      [-20, -18],
      [-7, -18],
      [-3, -35],
      [15, -29],
      [25, 0],
    ],
    [
      [-27, 0],
      [-17, -30],
      [-4, -24],
      [4, -31],
      [21, -21],
      [27, 0],
    ],
    [
      [-24, 0],
      [-23, -22],
      [-8, -28],
      [3, -20],
      [16, -34],
      [26, 0],
    ],
  ];
  return tops.map((top, v) => {
    // Split at corners rather than bending a continuous ribbon around a sharp cusp.
    const strokes = top.slice(0, -1).map((p, i) => pen([p, top[i + 1]], 1.2));
    strokes.push(
      pen([top[3], [9 + v, -12], [12 + v, -2]], 0.8),
      ...crossHatch(10, -17, 3),
      pen(
        [
          [-28, 3],
          [-13, 1],
          [-4, 3],
        ],
        0.6,
      ),
    );
    return variant(`desert-rock-${v}`, strokes, [pen(top)]);
  });
}

function desertCacti(): TerrainGlyphVariant[] {
  const outlines: SketchPoint[][] = [
    [
      [-4, 0],
      [-4, -15],
      [-16, -19],
      [-17, -34],
      [-11, -35],
      [-10, -24],
      [-4, -22],
      [-4, -45],
      [0, -48],
      [4, -44],
      [4, -27],
      [12, -30],
      [12, -39],
      [18, -38],
      [18, -25],
      [4, -20],
      [4, 0],
    ],
    [
      [-4, 0],
      [-4, -25],
      [-14, -29],
      [-14, -40],
      [-9, -41],
      [-9, -33],
      [-4, -31],
      [-4, -48],
      [0, -51],
      [4, -47],
      [4, -19],
      [13, -22],
      [13, -32],
      [19, -31],
      [19, -17],
      [4, -12],
      [4, 0],
    ],
    [
      [-4, 0],
      [-4, -16],
      [-17, -20],
      [-17, -29],
      [-12, -30],
      [-11, -24],
      [-4, -22],
      [-4, -42],
      [0, -46],
      [4, -42],
      [4, 0],
    ],
    [
      [-4, 0],
      [-4, -43],
      [0, -47],
      [4, -42],
      [4, -28],
      [14, -32],
      [14, -43],
      [20, -42],
      [20, -27],
      [4, -21],
      [4, 0],
    ],
  ];
  return outlines.map((outline, v) => {
    const contour = pen(outline, 1.1);
    return variant(
      `desert-cactus-${v}`,
      [
        contour,
        pen(
          [
            [0, -5],
            [0, -19],
            [v % 2, -37],
          ],
          0.45,
        ),
        pen(
          [
            [-17, 3],
            [-7, 1],
            [12, 3],
          ],
          0.6,
        ),
      ],
      [contour],
    );
  });
}

function desertOases(): TerrainGlyphVariant[] {
  const crowns: SketchPoint[] = [
    [-7, -42],
    [4, -46],
    [-2, -39],
    [9, -43],
  ];
  return crowns.map(([x, y], v) => {
    const strokes = [
      pen(
        [
          [-8, 0],
          [-6 + v, -21],
          [x, y],
        ],
        1.5,
      ),
    ];
    for (const [dx, dy] of [
      [-24, 13],
      [-18, 0],
      [-8, -10],
      [12, -9],
      [24, 2],
      [28, 17],
    ]) {
      strokes.push(
        pen(
          [
            [x, y],
            [x + dx * 0.65, y + dy * 0.3 - 5],
            [x + dx, y + dy],
          ],
          1.1,
        ),
      );
    }
    for (let i = 0; i < 3; i++)
      strokes.push(
        pen(
          [
            [15 + i * 3, 0],
            [16 + i * 4, -8],
            [12 + i * 6 + v, -15 - i * 2],
          ],
          0.75,
        ),
      );
    return variant(`desert-oasis-${v}`, strokes);
  });
}

/** Low snow shoulders and branching scrub; cartographic motifs rather than seasonal facts. */
function tundras(): TerrainGlyphVariant[] {
  const sketches: readonly (readonly (readonly SketchPoint[])[])[] = [
    [
      [
        [-38, -3],
        [-25, -8],
        [-10, -9],
        [6, -5],
        [22, -4],
        [36, -7],
      ],
      [
        [-23, 2],
        [-7, 0],
        [8, 2],
      ],
      [
        [17, -5],
        [16, -14],
        [10, -18],
      ],
      [
        [16, -12],
        [23, -18],
        [27, -17],
      ],
      [
        [16, -10],
        [9, -12],
      ],
      [
        [-7, -9],
        [-8, -15],
        [-13, -18],
      ],
      [
        [-8, -13],
        [-3, -18],
      ],
    ],
    [
      [
        [-39, -2],
        [-23, -6],
        [-9, -4],
        [7, -7],
        [25, -9],
        [39, -5],
      ],
      [
        [4, 2],
        [20, 0],
        [31, 1],
      ],
      [
        [-21, -5],
        [-22, -15],
        [-27, -19],
      ],
      [
        [-22, -12],
        [-16, -18],
      ],
      [
        [-22, -9],
        [-29, -12],
      ],
      [
        [18, -9],
        [19, -14],
        [24, -17],
      ],
      [
        [19, -13],
        [15, -18],
      ],
    ],
    [
      [
        [-35, -4],
        [-23, -10],
        [-9, -11],
        [5, -7],
        [20, -6],
      ],
      [
        [-18, 1],
        [-3, -1],
        [13, 1],
        [31, -2],
      ],
      [
        [26, -3],
        [25, -13],
        [20, -16],
      ],
      [
        [25, -11],
        [31, -16],
        [34, -15],
      ],
      [
        [25, -8],
        [19, -10],
      ],
      [
        [-17, -10],
        [-17, -15],
        [-21, -18],
      ],
      [
        [-17, -13],
        [-12, -17],
      ],
    ],
    [
      [
        [-38, -5],
        [-20, -7],
        [-2, -4],
        [14, -9],
        [30, -10],
        [39, -7],
      ],
      [
        [-29, 1],
        [-13, 0],
        [-1, 2],
      ],
      [
        [-26, -7],
        [-25, -15],
        [-29, -19],
      ],
      [
        [-25, -13],
        [-20, -18],
      ],
      [
        [6, -6],
        [5, -14],
        [0, -18],
      ],
      [
        [5, -12],
        [11, -17],
        [15, -16],
      ],
      [
        [5, -9],
        [-1, -12],
      ],
    ],
  ];
  return sketches.map((sketch, i) =>
    variant(
      `tundra-${i}`,
      sketch.map((points, index) => pen(points, index < 2 ? 1.25 : 1.05)),
    ),
  );
}

// Open savanna crowns are broad and flat; the fourth drawing is a stout baobab.
const savannaCrowns: SketchPoint[][] = [
  [
    [-8, -21],
    [-24, -24],
    [-32, -30],
    [-29, -36],
    [-18, -39],
    [-8, -38],
    [1, -41],
    [13, -40],
    [25, -37],
    [30, -32],
    [25, -27],
    [11, -25],
    [5, -23],
  ],
  [
    [-6, -22],
    [-22, -25],
    [-30, -31],
    [-25, -35],
    [-12, -35],
    [-3, -39],
    [10, -38],
    [22, -41],
    [31, -35],
    [27, -30],
    [16, -27],
    [7, -26],
  ],
  [
    [-9, -19],
    [-26, -22],
    [-33, -29],
    [-27, -35],
    [-15, -36],
    [-8, -40],
    [2, -38],
    [15, -40],
    [26, -36],
    [30, -31],
    [22, -25],
    [9, -23],
  ],
  [
    [-11, -29],
    [-24, -32],
    [-29, -41],
    [-24, -49],
    [-13, -47],
    [-7, -54],
    [4, -52],
    [12, -55],
    [23, -48],
    [27, -40],
    [22, -34],
    [10, -29],
  ],
];
function savannaTree(crownPoints: SketchPoint[], i: number): TerrainGlyphVariant {
  const crown = pen(crownPoints, 2.1);
  const trunk = pen(
    i === 3
      ? [
          [-10, 0],
          [-7, -10],
          [-8, -23],
          [-11, -34],
          [-3, -29],
          [2, -35],
          [8, -28],
          [7, -16],
          [10, -2],
          [13, 0],
        ]
      : [
          [-4, 0],
          [-2, -12],
          [-8, -24],
          [-17, -29],
          [-7, -26],
          [1, -21],
          [12, -29],
          [6, -21],
          [3, -11],
          [4, 0],
        ],
    2,
  );
  return variant(
    `tree-savanna-${i}`,
    [
      trunk,
      crown,
      pen(
        [
          [-21, -31],
          [-11, -33],
          [-3, -31],
        ],
        0.7,
      ),
      pen(
        [
          [7, -33],
          [16, -34],
          [22, -32],
        ],
        0.7,
      ),
      pen(
        i === 3
          ? [
              [-3, -5],
              [-2, -17],
              [-4, -25],
            ]
          : [
              [0, -3],
              [0, -12],
              [3, -19],
            ],
        0.7,
      ),
      pen(
        [
          [-19, 0],
          [-21, -6],
          [-25, -10],
        ],
        0.85,
      ),
      pen(
        [
          [-19, 0],
          [-16, -8],
          [-12, -11],
        ],
        0.85,
      ),
      pen(
        [
          [18, 1],
          [19, -5],
          [23, -8],
        ],
        0.85,
      ),
    ],
    [trunk, crown],
  );
}

const mangroveCrowns: SketchPoint[][] = [
  [
    [-9, -19],
    [-20, -22],
    [-25, -30],
    [-23, -39],
    [-14, -40],
    [-11, -48],
    [-2, -50],
    [5, -45],
    [14, -48],
    [22, -41],
    [20, -34],
    [26, -29],
    [22, -23],
    [10, -20],
  ],
  [
    [-10, -20],
    [-25, -24],
    [-29, -33],
    [-22, -37],
    [-24, -43],
    [-13, -49],
    [-4, -44],
    [4, -51],
    [15, -47],
    [19, -39],
    [27, -36],
    [23, -27],
    [13, -21],
  ],
  [
    [-12, -18],
    [-23, -23],
    [-21, -31],
    [-28, -38],
    [-19, -46],
    [-10, -43],
    [-2, -49],
    [8, -47],
    [10, -40],
    [22, -42],
    [29, -34],
    [23, -25],
    [12, -20],
  ],
  [
    [-7, -23],
    [-18, -24],
    [-25, -31],
    [-21, -39],
    [-14, -40],
    [-12, -49],
    [-1, -53],
    [7, -46],
    [17, -49],
    [25, -42],
    [21, -36],
    [28, -29],
    [20, -23],
    [9, -22],
  ],
];
function mangroveTree(crownPoints: SketchPoint[], i: number): TerrainGlyphVariant {
  const lean = [-3, 3, -5, 2][i];
  const crown = pen(crownPoints, 2.1);
  const trunk = pen(
    [
      [-4, -8],
      [-3 + lean, -19],
      [-10, -29],
      [-2, -23],
      [5, -30],
      [4 + lean, -18],
      [5, -8],
    ],
    2,
  );
  const roots = [
    pen(
      [
        [-3 + lean, -18],
        [-9, -11],
        [-13, -3],
        [-20, 0],
      ],
      1.6,
    ),
    pen(
      [
        [-3, -13],
        [-4, -6],
        [-7, 0],
      ],
      1.7,
    ),
    pen(
      [
        [2, -14],
        [7, -7],
        [9, 1],
      ],
      1.7,
    ),
    pen(
      [
        [4 + lean, -20],
        [13, -12],
        [16, -3],
        [23, 0],
      ],
      1.6,
    ),
    pen(
      [
        [0, -11],
        [0, -5],
        [2, -1],
      ],
      1,
    ),
  ];
  return variant(
    `tree-mangrove-${i}`,
    [
      trunk,
      crown,
      ...roots,
      pen(
        [
          [-17, -32],
          [-12, -35],
          [-6, -32],
        ],
        0.7,
      ),
      pen(
        [
          [4, -39],
          [11, -40],
          [16, -36],
        ],
        0.7,
      ),
      pen(
        [
          [13, -28],
          [16, -26],
          [14, -23],
        ],
        0.65,
      ),
    ],
    [trunk, crown],
  );
}

const mediterraneanCrowns: SketchPoint[][] = [
  [
    [-10, -15],
    [-22, -18],
    [-27, -26],
    [-22, -32],
    [-14, -30],
    [-10, -37],
    [-2, -39],
    [4, -34],
    [12, -36],
    [23, -31],
    [26, -24],
    [20, -18],
    [9, -15],
  ],
  [
    [-7, -15],
    [-22, -19],
    [-25, -27],
    [-19, -33],
    [-11, -31],
    [-3, -37],
    [6, -33],
    [15, -36],
    [24, -29],
    [21, -22],
    [26, -18],
    [13, -14],
  ],
  [
    [-13, -14],
    [-25, -18],
    [-30, -25],
    [-23, -31],
    [-15, -28],
    [-8, -35],
    [0, -34],
    [5, -28],
    [17, -31],
    [25, -25],
    [22, -18],
    [10, -14],
  ],
  [
    [-8, -17],
    [-19, -18],
    [-24, -24],
    [-20, -32],
    [-12, -31],
    [-7, -39],
    [1, -40],
    [9, -33],
    [18, -34],
    [26, -27],
    [22, -21],
    [13, -16],
  ],
];
function mediterraneanTree(crownPoints: SketchPoint[], i: number): TerrainGlyphVariant {
  const crown = pen(crownPoints, 2.1);
  const fork = [-5, 3, -7, 1][i];
  const trunk = pen(
    [
      [-5, 0],
      [fork, -7],
      [fork - 2, -16],
      [-14, -23],
      [-4, -18],
      [1, -13],
      [11, -22],
      [6, -12],
      [3, -7],
      [5, 0],
    ],
    2,
  );
  return variant(
    `tree-mediterranean-${i}`,
    [
      trunk,
      crown,
      pen(
        [
          [-17, -24],
          [-11, -26],
          [-6, -24],
        ],
        0.7,
      ),
      pen(
        [
          [5, -28],
          [11, -29],
          [18, -26],
        ],
        0.7,
      ),
      pen(
        [
          [fork, -2],
          [fork + 1, -8],
          [1, -12],
        ],
        0.7,
      ),
      pen(
        [
          [17, 0],
          [19, -6],
          [23, -9],
        ],
        0.9,
      ),
      pen(
        [
          [19, -4],
          [25, -6],
          [28, -5],
        ],
        0.8,
      ),
    ],
    [trunk, crown],
  );
}

// Tall broken branch tiers distinguish wet temperate giants from the squat boreal pines.
const rainforestContours: SketchPoint[][] = [
  [
    [-4, -9],
    [-12, -13],
    [-19, -16],
    [-14, -23],
    [-22, -27],
    [-14, -32],
    [-18, -38],
    [-11, -42],
    [-14, -48],
    [-7, -52],
    [-9, -60],
    [-3, -65],
    [-1, -77],
    [4, -68],
    [9, -62],
    [6, -57],
    [14, -52],
    [11, -46],
    [19, -40],
    [14, -34],
    [23, -27],
    [15, -22],
    [20, -17],
    [10, -13],
    [4, -10],
  ],
  [
    [-6, -10],
    [-17, -14],
    [-21, -21],
    [-13, -24],
    [-18, -31],
    [-12, -36],
    [-15, -42],
    [-7, -47],
    [-10, -54],
    [-3, -60],
    [2, -79],
    [7, -69],
    [6, -63],
    [13, -57],
    [9, -51],
    [18, -46],
    [13, -39],
    [23, -32],
    [17, -26],
    [25, -20],
    [16, -15],
    [5, -11],
  ],
  [
    [-5, -10],
    [-15, -14],
    [-23, -18],
    [-16, -25],
    [-24, -30],
    [-14, -36],
    [-19, -42],
    [-11, -46],
    [-14, -52],
    [-6, -57],
    [-7, -63],
    [-2, -75],
    [3, -64],
    [9, -60],
    [7, -54],
    [15, -50],
    [12, -44],
    [20, -38],
    [15, -32],
    [22, -26],
    [14, -21],
    [18, -16],
    [6, -11],
  ],
  [
    [-4, -11],
    [-15, -15],
    [-18, -20],
    [-12, -25],
    [-21, -30],
    [-13, -35],
    [-17, -40],
    [-9, -46],
    [-12, -51],
    [-5, -58],
    [-6, -66],
    [1, -81],
    [5, -69],
    [10, -63],
    [7, -57],
    [16, -52],
    [12, -46],
    [20, -41],
    [14, -35],
    [24, -29],
    [16, -24],
    [22, -18],
    [12, -14],
    [4, -11],
  ],
];
function rainforestTree(contourPoints: SketchPoint[], i: number): TerrainGlyphVariant {
  const contour = pen(contourPoints, 2.1);
  const trunk = pen(
    [
      [-5, 0],
      [-3, -12],
      [-2, -30],
      [0, -52],
      [2, -31],
      [3, -13],
      [6, 0],
    ],
    2,
  );
  return variant(
    `tree-rainforest-${i}`,
    [
      trunk,
      contour,
      pen(
        [
          [-15, -21],
          [-8, -20],
          [-1, -23],
        ],
        0.75,
      ),
      pen(
        [
          [2, -30],
          [9, -28],
          [16, -30],
        ],
        0.75,
      ),
      pen(
        [
          [-13, -39],
          [-6, -38],
          [0, -41],
        ],
        0.7,
      ),
      pen(
        [
          [2, -48],
          [8, -47],
          [12, -49],
        ],
        0.65,
      ),
      pen(
        [
          [0, -3],
          [0, -16],
          [1, -25],
        ],
        0.65,
      ),
    ],
    [trunk, contour],
  );
}

function montaneGrasses(): TerrainGlyphVariant[] {
  // Each clump specifies ground position and six uneven, mostly upright blade tips.
  const clumps: readonly (readonly (readonly [number, number, readonly SketchPoint[]])[])[] = [
    [
      [
        -16,
        0,
        [
          [-27, -8],
          [-24, -16],
          [-18, -20],
          [-14, -17],
          [-10, -11],
          [-5, -7],
        ],
      ],
      [
        13,
        -2,
        [
          [3, -11],
          [8, -19],
          [13, -23],
          [16, -18],
          [22, -14],
          [25, -7],
        ],
      ],
    ],
    [
      [
        -12,
        -1,
        [
          [-24, -7],
          [-19, -15],
          [-15, -23],
          [-10, -18],
          [-5, -14],
          [0, -5],
        ],
      ],
      [
        18,
        0,
        [
          [8, -8],
          [12, -14],
          [18, -18],
          [22, -15],
          [27, -10],
          [30, -4],
        ],
      ],
    ],
    [
      [
        -19,
        -1,
        [
          [-30, -8],
          [-26, -13],
          [-21, -19],
          [-16, -16],
          [-11, -12],
          [-6, -6],
        ],
      ],
      [
        9,
        0,
        [
          [-4, -7],
          [2, -16],
          [7, -25],
          [12, -22],
          [18, -17],
          [24, -8],
        ],
      ],
    ],
    [
      [
        -10,
        0,
        [
          [-25, -7],
          [-19, -14],
          [-14, -21],
          [-8, -25],
          [-4, -18],
          [2, -9],
        ],
      ],
      [
        20,
        -3,
        [
          [10, -10],
          [15, -17],
          [20, -21],
          [24, -18],
          [29, -12],
          [32, -7],
        ],
      ],
    ],
  ];
  return clumps.map((groups, i) =>
    variant(
      `montane-grass-${i}`,
      groups.flatMap(([x, y, tips]) => [
        ...tips.map(([tx, ty]) =>
          pen(
            [
              [x, y],
              [(x + tx) / 2, ty * 0.55],
              [tx, ty],
            ],
            1.15,
          ),
        ),
        pen(
          [
            [x - 6, y + 1],
            [x, y + 2],
            [x + 6, y + 1],
          ],
          0.6,
        ),
        pen(
          [
            [x + 7, y],
            [x + 8, y - 5],
            [x + 13, y - 8],
          ],
          0.85,
        ),
        pen(
          [
            [x + 8, y - 4],
            [x + 5, y - 8],
            [x + 4, y - 10],
          ],
          0.75,
        ),
      ]),
    ),
  );
}

function iceCaps(): TerrainGlyphVariant[] {
  const shoulders: SketchPoint[][] = [
    [
      [-32, 0],
      [-27, -7],
      [-20, -12],
      [-7, -12],
      [-2, -17],
      [12, -16],
      [25, -10],
      [31, 0],
    ],
    [
      [-31, 0],
      [-25, -11],
      [-15, -15],
      [-4, -13],
      [3, -18],
      [16, -15],
      [23, -7],
      [33, 0],
    ],
    [
      [-34, 0],
      [-24, -9],
      [-13, -10],
      [-6, -16],
      [7, -17],
      [13, -12],
      [25, -12],
      [32, 0],
    ],
    [
      [-33, 0],
      [-27, -8],
      [-16, -17],
      [-5, -16],
      [2, -20],
      [15, -18],
      [21, -11],
      [34, 0],
    ],
  ];
  const cracks: SketchPoint[][][] = [
    [
      [
        [-16, -11],
        [-12, -7],
        [-15, -4],
      ],
      [
        [-2, -16],
        [3, -11],
        [0, -7],
        [5, -3],
      ],
      [
        [14, -14],
        [18, -8],
        [15, -5],
      ],
    ],
    [
      [
        [-16, -14],
        [-11, -8],
        [-14, -3],
      ],
      [
        [3, -17],
        [8, -12],
        [5, -6],
      ],
      [
        [16, -13],
        [19, -7],
        [24, -3],
      ],
    ],
    [
      [
        [-12, -11],
        [-8, -6],
        [-11, -2],
      ],
      [
        [5, -16],
        [8, -11],
        [4, -7],
        [7, -2],
      ],
      [
        [22, -11],
        [19, -7],
        [23, -4],
      ],
    ],
    [
      [
        [-15, -16],
        [-10, -11],
        [-12, -6],
        [-8, -2],
      ],
      [
        [2, -19],
        [7, -14],
        [5, -9],
      ],
      [
        [15, -16],
        [18, -10],
        [15, -6],
        [20, -2],
      ],
    ],
  ];
  return shoulders.map((points, i) => {
    const shoulder = pen(points, 1.7);
    return variant(
      `ice-cap-${i}`,
      [
        shoulder,
        ...cracks[i].map((p) => pen(p, 0.9)),
        pen(
          [
            [-27, 2],
            [-17, 1],
            [-10, 2],
          ],
          0.6,
        ),
        pen(
          [
            [8, 2],
            [18, 1],
            [28, 2],
          ],
          0.6,
        ),
      ],
      [shoulder],
    );
  });
}

function definition(
  family: TerrainGlyphFamily,
  variants: TerrainGlyphVariant[],
  scaleFactor: number,
  densityRatio = 1,
): TerrainGlyphDefinition {
  const mountain = family === 'mountain' || family === 'mountainHigh';
  return {
    family,
    variants,
    scaleFactor,
    densityRatio,
    candidateSpacingFactor: family.startsWith('tree') ? 0.55 : 1.1,
    minimumScaleRatio: mountain ? 0.4 : 0.45,
    rotationLimitDegrees: mountain ? 3 : 5,
  };
}

export const TERRAIN_GLYPHS: Record<TerrainGlyphFamily, TerrainGlyphDefinition> = {
  mountainHigh: definition('mountainHigh', mountains(true), 0.9),
  mountain: definition('mountain', mountains(false), 0.9),
  hill: definition('hill', hills(), 0.75, 0.65),
  treeDeciduous: definition('treeDeciduous', deciduousCrowns.map(oak), 0.25),
  treeConifer: definition('treeConifer', pineContours.map(pine), 0.25),
  treePalm: definition('treePalm', [0, 1, 2, 3].map(palm), 0.25),
  marsh: definition('marsh', marshes(), 0.3, 0.5),
  prairie: definition('prairie', prairies(), 0.3, 0.35),
  desertDune: definition('desertDune', desertDunes(), 0.65, 0.35),
  desertRock: definition('desertRock', desertRocks(), 0.7, 0.45),
  desertCactus: definition('desertCactus', desertCacti(), 0.6, 0.25),
  desertOasis: definition('desertOasis', desertOases(), 0.6, 1),
  tundra: { ...definition('tundra', tundras(), 0.4, 0.3), minimumScaleRatio: 0.55 },
  treeSavanna: {
    ...definition('treeSavanna', savannaCrowns.map(savannaTree), 0.25, 0.25),
    minimumScaleRatio: 0.55,
  },
  montaneGrass: {
    ...definition('montaneGrass', montaneGrasses(), 0.4, 0.35),
    minimumScaleRatio: 0.55,
  },
  iceCap: { ...definition('iceCap', iceCaps(), 0.4, 0.3), minimumScaleRatio: 0.55 },
  treeMangrove: {
    ...definition('treeMangrove', mangroveCrowns.map(mangroveTree), 0.25, 0.8),
    minimumScaleRatio: 0.55,
  },
  treeMediterranean: {
    ...definition('treeMediterranean', mediterraneanCrowns.map(mediterraneanTree), 0.25, 0.45),
    minimumScaleRatio: 0.55,
  },
  treeRainforest: {
    ...definition('treeRainforest', rainforestContours.map(rainforestTree), 0.25, 1),
    minimumScaleRatio: 0.55,
  },
};

export const TERRAIN_GLYPH_VARIANTS = Object.values(TERRAIN_GLYPHS).flatMap((d) => d.variants);
