import { describe, expect, it } from 'vitest';
import type { GlyphInkStroke } from './terrain_glyph_types';
import { expandInkStroke, inkStrokePath } from './terrain_glyph_ink';
import { TERRAIN_GLYPHS, TERRAIN_GLYPH_VARIANTS } from './terrain_glyph_catalog';

const straight: GlyphInkStroke = {
  peakWidth: 0.2,
  taperPower: 1,
  segments: [
    {
      start: { x: 0, y: 0 },
      control1: { x: 1 / 3, y: 0 },
      control2: { x: 2 / 3, y: 0 },
      end: { x: 1, y: 0 },
    },
  ],
};

it('tapers to exact endpoints with the requested width at the middle', () => {
  const ribbon = expandInkStroke(straight);
  expect(ribbon[0]).toEqual({ x: 0, y: 0 });
  expect(ribbon[ribbon.length - 1]).toEqual({ x: 0, y: 0 });
  const tip = ribbon.findIndex((p) => p.x === 1);
  expect(ribbon[tip]).toEqual({ x: 1, y: 0 });
  expect(ribbon[tip + 1]).toEqual({ x: 1, y: 0 });
  expect(Math.max(...ribbon.map((p) => p.y))).toBeCloseTo(0.1, 4);
  expect(Math.min(...ribbon.map((p) => p.y))).toBeCloseTo(-0.1, 4);
  expect(ribbon.filter((p) => p.x > 0 && p.x < 1).every((p) => p.y !== 0)).toBe(true);
});

it('keeps a multisegment joint inked instead of tapering each segment separately', () => {
  const stroke = {
    ...straight,
    segments: [
      ...straight.segments,
      {
        start: { x: 1, y: 0 },
        control1: { x: 4 / 3, y: 0 },
        control2: { x: 5 / 3, y: 0 },
        end: { x: 2, y: 0 },
      },
    ],
  };
  const ribbon = expandInkStroke(stroke);
  expect(ribbon).toContainEqual({ x: 1, y: 0.1 });
  expect(ribbon).toContainEqual({ x: 1, y: -0.1 });
  expect(inkStrokePath(stroke)).toMatch(/^M .* Z$/);
});

it('handles stationary curves, duplicate joints, reversing tangents and invalid widths', () => {
  const p = { x: 0, y: 0 };
  const stationary = { start: p, control1: p, control2: p, end: p };
  expect(expandInkStroke({ ...straight, segments: [stationary] })).toEqual([]);
  expect(inkStrokePath({ ...straight, segments: [] })).toBe('');
  expect(expandInkStroke({ ...straight, peakWidth: 0 })).toEqual([]);
  expect(expandInkStroke({ ...straight, taperPower: 0 })).toEqual([]);
  const segment = straight.segments[0];
  const reverse = {
    start: segment.end,
    control1: segment.control2,
    control2: segment.control1,
    end: segment.start,
  };
  const result = expandInkStroke({ ...straight, segments: [stationary, segment, reverse] });
  expect(result.length).toBeGreaterThan(2);
  expect(result.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
});

function insideConvex(p: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  return polygon.every((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= -1e-8;
  });
}

describe('authored terrain catalog', () => {
  it('has four unique drawings in each of twelve families with positive placement profiles', () => {
    expect(Object.keys(TERRAIN_GLYPHS)).toHaveLength(12);
    expect(new Set(TERRAIN_GLYPH_VARIANTS.map((v) => v.id)).size).toBe(48);
    for (const definition of Object.values(TERRAIN_GLYPHS)) {
      expect(definition.variants).toHaveLength(4);
      expect(new Set(definition.variants.map((v) => JSON.stringify(v.strokes))).size).toBe(4);
      expect(definition.scaleFactor).toBeGreaterThan(0);
      expect(definition.minimumScaleRatio).toBeGreaterThan(0);
      expect(definition.minimumScaleRatio).toBeLessThan(1);
      expect(definition.densityRatio).toBeGreaterThan(0);
      expect(definition.densityRatio).toBeLessThanOrEqual(1);
      expect(definition.candidateSpacingFactor).toBeGreaterThan(0);
    }
  });
  it('shares a denser candidate spacing across all three forest families', () => {
    const trees = [
      TERRAIN_GLYPHS.treeDeciduous,
      TERRAIN_GLYPHS.treeConifer,
      TERRAIN_GLYPHS.treePalm,
    ];
    expect(new Set(trees.map((tree) => tree.candidateSpacingFactor)).size).toBe(1);
    for (const tree of trees) {
      expect(tree.candidateSpacingFactor).toBeLessThan(TERRAIN_GLYPHS.hill.candidateSpacingFactor);
      expect(tree.densityRatio).toBe(1);
    }
  });
  it('bounds all ink ribbons, body controls and ground marks with each variant footprint', () => {
    for (const variant of TERRAIN_GLYPH_VARIANTS) {
      expect(variant.footprint.length).toBeGreaterThanOrEqual(3);
      for (const stroke of variant.strokes) {
        for (const p of expandInkStroke(stroke))
          expect(insideConvex(p, variant.footprint), variant.id).toBe(true);
        const d = inkStrokePath(stroke);
        expect(d).not.toMatch(/NaN|Infinity|undefined/);
        // Quantized geometry must also remain in the conservative control hull.
        const values = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
        for (let i = 0; i < values.length; i += 2)
          expect(
            insideConvex({ x: values[i], y: values[i + 1] }, variant.footprint),
            variant.id,
          ).toBe(true);
      }
      for (const path of variant.bodyPaths) {
        const values = [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
        for (let i = 0; i < values.length; i += 2)
          expect(
            insideConvex({ x: values[i], y: values[i + 1] }, variant.footprint),
            variant.id,
          ).toBe(true);
      }
    }
  });
});
