import { describe, expect, it } from 'vitest';
import { TERRAIN_GLYPHS } from './terrain_glyph_catalog';
import { cappedTreeScale, isTreeGlyph, treeSizeCeiling } from './terrain_glyph_sizing';

function spanAt(footprint: { x: number; y: number }[], angle: number, scale: number) {
  const r = (angle * Math.PI) / 180;
  const points = footprint.map(({ x, y }) => ({
    x: (x * Math.cos(r) - y * Math.sin(r)) * scale,
    y: (x * Math.sin(r) + y * Math.cos(r)) * scale,
  }));
  return {
    x: Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)),
    y: Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y)),
  };
}

describe('tree size hierarchy', () => {
  it('caps every rotated tree below every nominal relief glyph, including serialized scales', () => {
    for (const [symbolSize, mapScale] of [
      [0.35, 0.1],
      [0.35, 1],
      [2.8, 1],
      [2.8, 10],
    ]) {
      const ceiling = treeSizeCeiling(symbolSize, mapScale);
      expect(ceiling.x).toBeGreaterThan(0);
      expect(ceiling.y).toBeGreaterThan(0);
      for (const definition of Object.values(TERRAIN_GLYPHS).filter((d) => isTreeGlyph(d.family))) {
        for (const v of definition.variants) {
          for (const angle of [-5, -2.3, 0, 1.8, 5]) {
            const scale = cappedTreeScale(v, angle, 100, ceiling);
            const tree = spanAt(v.footprint, angle, Number(scale.toFixed(3)));
            expect(tree.x).toBeLessThanOrEqual(ceiling.x);
            expect(tree.y).toBeLessThanOrEqual(ceiling.y);
            for (const family of ['hill', 'mountain', 'mountainHigh'] as const) {
              const relief = TERRAIN_GLYPHS[family];
              const desired = Math.max(
                symbolSize * relief.scaleFactor,
                mapScale * (family === 'hill' ? 0.5 : 0.65),
              );
              const minimum = Number(desired.toFixed(3));
              for (const variant of relief.variants) {
                for (const rotation of [
                  -relief.rotationLimitDegrees,
                  0,
                  relief.rotationLimitDegrees,
                ]) {
                  const size = spanAt(variant.footprint, rotation, minimum);
                  expect(Math.max(tree.x, tree.y)).toBeLessThan(Math.max(size.x, size.y) * 0.75);
                }
              }
            }
          }
        }
      }
    }
  });

  it('preserves already-small scales and declines a zero-sized ceiling', () => {
    const variant = TERRAIN_GLYPHS.treePalm.variants[0];
    expect(cappedTreeScale(variant, 0, 0.01, { x: 100, y: 100 })).toBe(0.01);
    expect(cappedTreeScale(variant, 0, 100, { x: 0, y: 0 })).toBe(0);
    expect(treeSizeCeiling(0, 0)).toEqual({ x: 0, y: 0 });
    expect(isTreeGlyph('desertOasis')).toBe(false);
  });
});
