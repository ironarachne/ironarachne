import type { Vertex } from '$lib/geometry';
import type { GlyphInkStroke, TerrainGlyphVariant } from './terrain_glyph_types';
import type {
  SettlementBuildingKind,
  SettlementBuildingVariant,
  SettlementIconCategory,
  SettlementIconProfile,
} from './settlement_icon_types';

/** Open tapered contours, with straight legs expressed as cubic segments. */
function stroke(points: Vertex[], width = 0.1): GlyphInkStroke {
  return {
    peakWidth: width,
    taperPower: 0.55,
    segments: points.slice(1).map((end, i) => {
      const start = points[i];
      return {
        start,
        end,
        control1: { x: start.x + (end.x - start.x) / 3, y: start.y + (end.y - start.y) / 3 },
        control2: {
          x: start.x + ((end.x - start.x) * 2) / 3,
          y: start.y + ((end.y - start.y) * 2) / 3,
        },
      };
    }),
  };
}
const point = (x: number, y: number): Vertex => ({ x, y });

/** Ground axes project at ±30 degrees; height stays vertical. */
export function projectSettlementGround(u: number, v: number): Vertex {
  return { x: ((u - v) * Math.sqrt(3)) / 2, y: (u + v) / 2 };
}

function building(kind: SettlementBuildingKind, variant: number): SettlementBuildingVariant {
  const id = `settlement-building-${kind}-${variant + 1}`;
  const u = (kind === 'hall' ? 0.65 : kind === 'tower' ? 0.24 : 0.42) + variant * 0.015;
  const v = (kind === 'hall' ? 0.5 : kind === 'tower' ? 0.24 : 0.32) + variant * 0.02;
  const wall = (kind === 'tower' ? 1.25 : kind === 'hall' ? 0.68 : 0.44) + variant * 0.035;
  const rise = 0.24 + variant * 0.025;
  const front = point(0, 0);
  const left = projectSettlementGround(-u, 0);
  const right = projectSettlementGround(0, -v);
  const lift = (p: Vertex, height: number) => point(p.x, p.y - height);
  const leftEave = lift(left, wall),
    frontEave = lift(front, wall),
    rightEave = lift(right, wall);
  const ridgeFront = lift(projectSettlementGround(-u / 2, 0), wall + rise);
  const ridgeBack = lift(projectSettlementGround(-u / 2, -v), wall + rise);
  const outline = [left, front, right, rightEave, ridgeBack, ridgeFront, leftEave, left];
  const doorBase = projectSettlementGround(-u * 0.48, 0);
  const doorLeft = projectSettlementGround(-u * 0.62, 0);
  const doorRight = projectSettlementGround(-u * 0.34, 0);
  const strokes = [
    stroke(outline),
    stroke([leftEave, frontEave, rightEave]),
    stroke([ridgeFront, frontEave, front]),
    stroke([doorLeft, lift(doorLeft, wall * 0.48), lift(doorRight, wall * 0.48), doorRight], 0.045),
    // The door's threshold follows the same ground axis as its front wall.
    stroke([doorLeft, doorBase, doorRight], 0.035),
  ];
  for (let i = 0; i < 3; i++) {
    const start = lift(projectSettlementGround(0, -v * 0.25), wall * 0.3 + i * 0.075);
    const end = lift(projectSettlementGround(0, -v * 0.85), wall * 0.3 + i * 0.075);
    strokes.push(stroke([start, end], 0.025));
  }
  if (kind === 'tower') {
    const windowLeft = lift(projectSettlementGround(-u * 0.58, 0), wall * 0.78);
    const windowRight = lift(projectSettlementGround(-u * 0.38, 0), wall * 0.78);
    strokes.push(
      stroke([windowLeft, lift(windowLeft, 0.12), lift(windowRight, 0.12), windowRight], 0.035),
    );
  }
  const minX = Math.min(...outline.map((p) => p.x)) - 0.06;
  const maxX = Math.max(...outline.map((p) => p.x)) + 0.06;
  const minY = Math.min(...outline.map((p) => p.y)) - 0.06;
  return {
    id,
    kind,
    artwork: {
      id,
      bodyPaths: [`M ${outline.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`],
      strokes,
      footprint: [point(minX, minY), point(maxX, minY), point(maxX, 0.06), point(minX, 0.06)],
    },
  };
}

export const SETTLEMENT_BUILDING_VARIANTS: SettlementBuildingVariant[] = (
  ['cottage', 'hall', 'tower'] as const
).flatMap((kind) => [0, 1, 2].map((i) => building(kind, i)));

export const CAPITAL_PENNANT: TerrainGlyphVariant = {
  id: 'settlement-capital-pennant',
  bodyPaths: ['M 0 -2.45 L 0.66 -2.32 L 0.42 -2.12 L 0.66 -1.93 L 0 -2.06 Z'],
  strokes: [
    stroke([point(0, -1.0), point(0, -2.5)], 0.1),
    stroke(
      [
        point(0, -2.45),
        point(0.66, -2.32),
        point(0.42, -2.12),
        point(0.66, -1.93),
        point(0, -2.06),
      ],
      0.09,
    ),
  ],
  footprint: [point(-0.06, -2.56), point(0.72, -2.56), point(0.72, -0.94), point(-0.06, -0.94)],
};

function profile(
  category: SettlementIconCategory,
  counts: [number, number, number],
  factor: number,
): SettlementIconProfile {
  const buildingKinds: SettlementBuildingKind[] = counts.flatMap((count, i) =>
    Array<SettlementBuildingKind>(count).fill((['cottage', 'hall', 'tower'] as const)[i]),
  );
  // Staggered ground rows share the buildings' actual isometric projection.
  const columns =
    buildingKinds.length <= 2 ? buildingKinds.length : Math.ceil(buildingKinds.length / 2);
  const positions = buildingKinds.map((_, i) =>
    projectSettlementGround(
      (i % columns) * 0.34,
      i < columns && buildingKinds.length > columns ? -0.8 : 0,
    ),
  );
  const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
  const frontY = Math.max(...positions.map((p) => p.y));
  const slots = positions.map((p) => ({ x: p.x - centerX, y: p.y - frontY }));
  return { category, buildingKinds, targetHalfWidthFactor: factor, slots };
}
export const SETTLEMENT_ICON_PROFILES: SettlementIconProfile[] = [
  profile('hamlet', [2, 0, 0], 2.0),
  profile('village', [3, 1, 0], 2.3),
  profile('town', [4, 1, 0], 2.6),
  profile('borough', [4, 2, 1], 2.9),
  profile('city', [5, 2, 2], 3.2),
  profile('metropolis', [6, 3, 3], 3.5),
];
