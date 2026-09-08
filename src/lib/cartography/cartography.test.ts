import { describe, expect, it } from 'vitest';
import {
  CARTOGRAPHY,
  STROKE_WIDTHS,
  INK_WASH,
  cartographyFilterDefs,
  parchmentRect,
  hash01,
  toBipolar,
} from './index';

describe('cartographic ink vocabulary', () => {
  it('uses sepia for every visible paint and orders stroke weights by emphasis', () => {
    for (const color of [
      CARTOGRAPHY.ground.fill,
      INK_WASH,
      ...Object.values(CARTOGRAPHY.palette).map((ink) => ink.color),
    ]) {
      const [r, g, b] = color
        .slice(1)
        .match(/../g)!
        .map((c) => parseInt(c, 16));
      expect(r).toBeGreaterThan(g);
      expect(g).toBeGreaterThan(b);
    }
    expect(STROKE_WIDTHS.hairline).toBeGreaterThan(0);
    expect(STROKE_WIDTHS.hairline).toBeLessThan(STROKE_WIDTHS.fine);
    expect(STROKE_WIDTHS.fine).toBeLessThan(STROKE_WIDTHS.medium);
    expect(STROKE_WIDTHS.medium).toBeLessThan(STROKE_WIDTHS.heavy);
  });

  it('keeps grain and displacement in shared filters sized to the drawing', () => {
    const defs = cartographyFilterDefs(60, 35);
    expect(defs).toContain('id="paperGrain"');
    expect(defs).toContain('0 0 0 0.12 0');
    expect(defs).toContain('baseFrequency="0.9" numOctaves="1"');
    expect(defs).toContain('filterUnits="userSpaceOnUse" x="-1" y="-1" width="62" height="37"');
    expect(defs).toContain('scale="0.28"');
    expect(parchmentRect(60, 35)).toBe(
      '<rect width="60" height="35" fill="#ede4d3" filter="url(#paperGrain)"/>',
    );
  });
});

describe('deterministic edge treatment', () => {
  it('maps hash samples into the expected intervals without a seed', () => {
    expect(hash01(0, 0, 0)).toBe(0);
    expect(hash01(1, 2, 3)).toBeCloseTo(0.020161161391115456, 10);
    for (let i = -20; i < 20; i++) {
      expect(hash01(i, 7, 11)).toBeGreaterThanOrEqual(0);
      expect(hash01(i, 7, 11)).toBeLessThan(1);
    }
    expect(toBipolar(0)).toBe(-1);
    expect(toBipolar(0.5)).toBe(0);
    expect(toBipolar(1)).toBe(1);
  });

  it('preserves legacy chord subdivision, graph salts, and input coordinates', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    const original = structuredClone(points);
    const displaced = CARTOGRAPHY.edges.displace(points, [8, 13, 21]);
    expect(displaced).toHaveLength(13);
    expect(displaced[0]).toEqual(points[0]);
    expect(displaced.slice(1, 5).map((p) => p.x)).toEqual([2, 4, 6, 8]);
    expect(displaced.slice(1, 5).every((p) => Math.abs(p.y) <= 0.3)).toBe(true);
    expect(CARTOGRAPHY.edges.displace(points, [8, 13, 21])).toEqual(displaced);
    expect(CARTOGRAPHY.edges.displace(points)).not.toEqual(displaced);
    expect(points).toEqual(original);
  });

  it('handles short, degenerate, and mismatched loops', () => {
    expect(CARTOGRAPHY.edges.displace([])).toEqual([]);
    expect(CARTOGRAPHY.edges.displace([{ x: 0, y: 0 }])).toEqual([]);
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    expect(CARTOGRAPHY.edges.displace(points, [1])).toEqual([]);
    expect(CARTOGRAPHY.edges.displace(points)).toHaveLength(3);
  });
});
