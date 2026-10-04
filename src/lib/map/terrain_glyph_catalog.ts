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

const crowns: readonly (readonly SketchPoint[])[] = [
  [
    [-10, -17],
    [-25, -22],
    [-28, -34],
    [-23, -39],
    [-28, -46],
    [-18, -53],
    [-12, -51],
    [-7, -65],
    [6, -64],
    [14, -56],
    [24, -55],
    [30, -44],
    [26, -35],
    [30, -28],
    [20, -18],
    [8, -17],
  ],
  [
    [-9, -18],
    [-21, -19],
    [-30, -29],
    [-26, -38],
    [-30, -45],
    [-19, -52],
    [-12, -61],
    [1, -66],
    [11, -59],
    [17, -60],
    [27, -49],
    [24, -41],
    [31, -34],
    [24, -23],
    [9, -17],
  ],
  [
    [-11, -16],
    [-24, -21],
    [-23, -31],
    [-32, -35],
    [-29, -46],
    [-20, -49],
    [-16, -62],
    [-4, -58],
    [5, -68],
    [17, -60],
    [20, -52],
    [30, -45],
    [25, -37],
    [31, -25],
    [18, -19],
    [8, -17],
  ],
  [
    [-8, -19],
    [-19, -18],
    [-29, -29],
    [-23, -37],
    [-28, -48],
    [-17, -57],
    [-7, -55],
    [0, -64],
    [12, -61],
    [16, -51],
    [28, -52],
    [33, -39],
    [26, -31],
    [27, -24],
    [15, -18],
    [7, -19],
  ],
];
function deciduous(): TerrainGlyphVariant[] {
  return crowns.map((c, i) => {
    const crown = pen(c, 1.4);
    return variant(
      `tree-oak-${i}`,
      [
        crown,
        pen(
          [
            [-4, 0],
            [-3, -17],
            [-10 - i, -27],
          ],
          1.4,
        ),
        pen(
          [
            [5, 0],
            [3, -19],
            [12 + i, -30],
          ],
          1.1,
        ),
        pen(
          [
            [-20, -37],
            [-14, -43],
            [-4, -39],
          ],
          0.7,
        ),
        pen(
          [
            [0, -50],
            [8, -53],
            [16, -48],
          ],
          0.7,
        ),
        ...crossHatch(12, -33, 4),
      ],
      [crown],
    );
  });
}

const branchTiers = [
  [
    [-7, 8, -63],
    [-12, 11, -52],
    [-16, 20, -40],
    [-25, 22, -28],
    [-29, 31, -15],
  ],
  [
    [-8, 6, -69],
    [-10, 15, -57],
    [-19, 16, -43],
    [-21, 25, -30],
    [-33, 27, -16],
  ],
  [
    [-5, 8, -60],
    [-13, 10, -48],
    [-17, 21, -36],
    [-27, 24, -25],
    [-26, 34, -13],
  ],
  [
    [-8, 7, -66],
    [-14, 15, -54],
    [-15, 23, -41],
    [-26, 23, -27],
    [-32, 30, -15],
  ],
] as const;
function conifers(): TerrainGlyphVariant[] {
  return branchTiers.map((tiers, i) => {
    const lean = [-3, 2, 4, -1][i];
    const strokes = [
      pen(
        [
          [lean, 0],
          [lean * 0.4, -35],
          [0, tiers[0][2] - 8],
        ],
        1.4,
      ),
    ];
    for (const [left, right, y] of tiers)
      strokes.push(
        pen(
          [
            [left, y + 9],
            [left * 0.55, y + 5],
            [lean * 0.2, y - 3],
            [right * 0.55, y + 5],
            [right, y + 10],
          ],
          1.2,
        ),
      );
    const silhouette: SketchPoint[] = [
      [lean, 0],
      ...[...tiers].reverse().map(([l, _r, y]) => [l, y + 9] as SketchPoint),
      [0, tiers[0][2] - 8],
      ...tiers.map(([_l, r, y]) => [r, y + 10] as SketchPoint),
      [lean, 0],
    ];
    const body = pen(silhouette, 0.1);
    return variant(`tree-pine-${i}`, [...strokes, ...crossHatch(8, -26, 3)], [body]);
  });
}

function palms(): TerrainGlyphVariant[] {
  const crowns: readonly (readonly SketchPoint[])[] = [
    [
      [-33, 9],
      [-25, -7],
      [-10, -16],
      [17, -13],
      [32, 1],
      [23, 16],
    ],
    [
      [-28, 15],
      [-29, -4],
      [-14, -19],
      [10, -17],
      [31, -1],
      [29, 12],
      [16, 20],
    ],
    [
      [-35, 5],
      [-22, -10],
      [-3, -21],
      [23, -13],
      [34, 8],
      [17, 18],
    ],
    [
      [-31, 13],
      [-20, -5],
      [-12, -19],
      [15, -20],
      [29, -6],
      [35, 12],
      [21, 23],
    ],
  ];
  return crowns.map((fronds, i) => {
    const lean = [-8, 0, 7, 12][i];
    const trunk = pen(
      [
        [-5, 0],
        [-8, -20],
        [lean, -52],
        [lean + 3, -52],
        [-2, -23],
        [1, 0],
      ],
      0.9,
    );
    const strokes = [
      pen(
        [
          [-5, 0],
          [-8, -20],
          [lean, -52],
        ],
        1.6,
      ),
      pen(
        [
          [1, 0],
          [-2, -23],
          [lean + 3, -52],
        ],
        0.8,
      ),
    ];
    for (const [dx, dy] of fronds)
      strokes.push(
        pen(
          [
            [lean, -52],
            [lean + dx * 0.65, -60 + dy],
            [lean + dx, -52 + dy],
          ],
          1.1,
        ),
      );
    strokes.push(
      pen(
        [
          [-15, 0],
          [-3, -2],
          [13, 0],
        ],
        0.65,
      ),
    );
    return variant(`tree-palm-${i}`, strokes, [trunk]);
  });
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
    minimumScaleRatio: mountain ? 0.4 : 0.45,
    rotationLimitDegrees: mountain ? 3 : 5,
  };
}

export const TERRAIN_GLYPHS: Record<TerrainGlyphFamily, TerrainGlyphDefinition> = {
  mountainHigh: definition('mountainHigh', mountains(true), 0.9),
  mountain: definition('mountain', mountains(false), 0.9),
  hill: definition('hill', hills(), 0.75, 0.65),
  treeDeciduous: definition('treeDeciduous', deciduous(), 0.6),
  treeConifer: definition('treeConifer', conifers(), 0.6),
  treePalm: definition('treePalm', palms(), 0.6),
  marsh: definition('marsh', marshes(), 0.6, 0.5),
  prairie: definition('prairie', prairies(), 0.6, 0.35),
  desertDune: definition('desertDune', desertDunes(), 0.65, 0.35),
  desertRock: definition('desertRock', desertRocks(), 0.7, 0.45),
  desertCactus: definition('desertCactus', desertCacti(), 0.6, 0.25),
  desertOasis: definition('desertOasis', desertOases(), 0.6, 1),
};

export const TERRAIN_GLYPH_VARIANTS = Object.values(TERRAIN_GLYPHS).flatMap((d) => d.variants);
