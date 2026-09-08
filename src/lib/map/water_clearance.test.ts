import { describe, expect, it } from 'vitest';
import { makeWaterClearanceTest } from './water_clearance';

const box = (x: number, y: number, width: number, height = width) => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
];

describe('glyph clearance against drawn water', () => {
  it('accepts land but rejects glyphs inside, touching, or close to water', () => {
    const clear = makeWaterClearanceTest([box(10, 10, 10)], 0.4);
    expect(clear(box(1, 12, 3))).toBe(true);
    expect(clear(box(22, 12, 3))).toBe(true);
    expect(clear(box(12, 1, 3))).toBe(true);
    expect(clear(box(12, 22, 3))).toBe(true);
    expect(clear(box(12, 12, 3))).toBe(false);
    expect(clear(box(8, 12, 2))).toBe(false);
    expect(clear(box(8, 12, 1.8))).toBe(false);
    expect(clear(box(8, 12, 1.5))).toBe(true);
    expect(clear(box(12, 20.2, 1))).toBe(false);
  });

  it('rejects long glyph edges spanning a narrow inlet even when all vertices are on land', () => {
    const clear = makeWaterClearanceTest([box(10, -10, 0.2, 40)], 0.1);
    expect(clear(box(9, 12, 2))).toBe(false);
  });

  it('rejects a glyph surrounding a small lake', () => {
    const clear = makeWaterClearanceTest([box(10, 10, 0.1)], 0.1);
    expect(clear(box(9, 9, 2))).toBe(false);
  });

  it('handles reversed loops, negative coordinates, multiple waters, and absent outlines', () => {
    const clear = makeWaterClearanceTest([box(-10, -10, 2).reverse(), box(10, 10, 2), []], 0.4);
    expect(clear(box(-9.5, -9.5, 0.5))).toBe(false);
    expect(clear(box(10.5, 10.5, 0.5))).toBe(false);
    expect(clear(box(0, 0, 1))).toBe(true);
    expect(clear([])).toBe(true);
    expect(makeWaterClearanceTest([], 0.4)(box(0, 0, 1))).toBe(true);
  });
});
