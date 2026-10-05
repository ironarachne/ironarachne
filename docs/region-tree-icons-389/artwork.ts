/** Artwork proposal only; no runtime catalog changes. Run with vite-node. */
import { writeFileSync } from 'node:fs';
import { TERRAIN_GLYPHS, inkStrokePath } from '../../src/lib/map';
import { CARTOGRAPHY } from '../../src/lib/cartography';
type TerrainGlyphVariant = (typeof TERRAIN_GLYPHS)['hill']['variants'][number];
type GlyphInkStroke = TerrainGlyphVariant['strokes'][number];
type Vertex = TerrainGlyphVariant['footprint'][number];
type SketchPoint = readonly [number, number];

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
export const proposedTrees = {
  treeDeciduous: deciduousCrowns.map(oak),
  treeConifer: pineContours.map(pine),
  treePalm: [0, 1, 2, 3].map(palm),
};

// Check the actual serialized ribbons against the proposed conservative footprints.
for (const v of Object.values(proposedTrees).flat()) {
  for (const stroke of v.strokes) {
    const coordinates =
      inkStrokePath(stroke)
        .match(/-?\d+(?:\.\d+)?/g)
        ?.map(Number) ?? [];
    for (let i = 0; i < coordinates.length; i += 2) {
      const x = coordinates[i],
        y = coordinates[i + 1];
      const inside =
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        v.footprint.every((a, j) => {
          const b = v.footprint[(j + 1) % v.footprint.length];
          return (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) >= -0.00001;
        });
      if (!inside) throw new Error(`Ink escapes footprint: ${v.id}`);
    }
  }
}
const paper = CARTOGRAPHY.ground.fill,
  ink = CARTOGRAPHY.palette.body.color;
const artwork = (v: TerrainGlyphVariant) =>
  `<path d="${v.bodyPaths.join(' ')}" fill="${paper}"/><path d="${v.strokes.map(inkStrokePath).join(' ')}" fill="${ink}"/>`;
const heightOf = (v: TerrainGlyphVariant) =>
  Math.max(...v.footprint.map((p) => p.y)) - Math.min(...v.footprint.map((p) => p.y));
const widthOf = (v: TerrainGlyphVariant) =>
  Math.max(...v.footprint.map((p) => p.x)) - Math.min(...v.footprint.map((p) => p.x));
function draw(v: TerrainGlyphVariant, x: number, y: number, scale: number): string {
  return `<use href="#review-${v.id}" transform="translate(${x} ${y}) scale(${scale})"/>`;
}
function treeScale(v: TerrainGlyphVariant, height: number) {
  return Math.min(height / heightOf(v), (height * 1.2) / widthOf(v));
}
const parts = [`<rect width="1280" height="1090" fill="${paper}"/>`];
const drawings = [
  ...Object.values(proposedTrees).flat(),
  ...['hill', 'mountain', 'mountainHigh'].map(
    (family) => TERRAIN_GLYPHS[family as 'hill'].variants[0],
  ),
];
parts.push(
  `<defs>${drawings.map((v) => `<g id="review-${v.id}">${artwork(v)}</g>`).join('')}</defs>`,
);
const label = (x: number, y: number, s: string, size = 18) =>
  parts.push(
    `<text x="${x}" y="${y}" font-size="${size}" fill="${ink}" font-family="Georgia,serif">${s}</text>`,
  );
label(40, 45, 'Tree artwork · proposal for #389', 28);
label(40, 75, 'Four vector variants per family · heavier contours, lighter interior brushwork', 17);
label(
  40,
  104,
  'Enlarged drawings for approval; size comparisons below are illustrative, not renderer output.',
  15,
);
for (const [row, [family, variants]] of Object.entries(proposedTrees).entries()) {
  const y = 140 + row * 175;
  label(40, y + 24, ['Deciduous', 'Coniferous', 'Palm'][row], 21);
  for (const [i, v] of variants.entries()) {
    parts.push(draw(v, 330 + i * 225, y + 130, treeScale(v, 105)));
    label(308 + i * 225, y + 155, `${i + 1}`, 14);
  }
  parts.push(`<path d="M40 ${y + 165} H1240" stroke="${ink}" opacity=".15"/>`);
  // Keep the family key visible in the file without exposing it in the artwork labels.
  parts.push(`<!-- ${family} -->`);
}
label(40, 718, 'Relative size · on the same baseline', 22);
const baseline = 815;
for (const [i, family] of ['hill', 'mountain', 'mountainHigh'].entries()) {
  const v = TERRAIN_GLYPHS[family as 'hill'].variants[0];
  parts.push(draw(v, 160 + i * 200, baseline, 46 / heightOf(TERRAIN_GLYPHS.hill.variants[0])));
  label(125 + i * 200, 840, ['Hill', 'Mountain', 'High mountain'][i], 15);
}
for (const [i, variants] of Object.values(proposedTrees).entries()) {
  parts.push(draw(variants[0], 790 + i * 155, baseline, treeScale(variants[0], 28)));
  label(750 + i * 155, 840, ['Deciduous', 'Coniferous', 'Palm'][i], 15);
}
label(40, 900, 'Forest rhythm · compact trees, with room for the paper to breathe', 22);
for (const [column, variants] of Object.values(proposedTrees).entries()) {
  for (let row = 0; row < 3; row++)
    for (let j = 0; j < 9; j++) {
      const v = variants[(row * 3 + j) % 4];
      parts.push(
        draw(v, 70 + column * 407 + j * 39 + (row % 2) * 9, 950 + row * 40, treeScale(v, 27)),
      );
    }
}
writeFileSync(
  'docs/region-tree-icons-389/specimens.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1090" viewBox="0 0 1280 1090">${parts.join('\n')}</svg>`,
);
console.log('Wrote docs/region-tree-icons-389/specimens.svg');
