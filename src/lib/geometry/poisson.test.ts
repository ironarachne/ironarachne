import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generatePoissonDisk } from './poisson';

function sample(options = {}) {
  return generatePoissonDisk(20, 10, 1, new RNG('poisson-test'), 30, options);
}

describe('generatePoissonDisk', () => {
  it('fills a bounded rectangle with reproducible, separated points', () => {
    const points = sample();
    expect(points).toEqual(sample());
    expect(points.length).toBeGreaterThan(100);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThan(20);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThan(10);
      for (const other of points.slice(i + 1))
        expect(Math.hypot(point.x - other.x, point.y - other.y)).toBeGreaterThanOrEqual(1);
    }
  });

  it('filters the returned set without stranding disconnected accepted areas', () => {
    const accept = (point: { x: number }) => point.x < 3 || point.x > 17;
    const points = sample({ accept });
    expect(points).toEqual(sample().filter(accept));
    expect(points.some((point) => point.x < 3)).toBe(true);
    expect(points.some((point) => point.x > 17)).toBe(true);
  });

  it('counts only accepted points against the budget', () => {
    const accept = (point: { x: number }) => point.x > 17;
    expect(sample({ accept, maxPoints: 5 })).toEqual(sample({ accept }).slice(0, 5));
    expect(sample({ maxPoints: 1 })).toHaveLength(1);
    expect(sample({ maxPoints: 3.9 })).toHaveLength(3);
  });

  it('finishes with empty output when no point is accepted', () => {
    expect(sample({ accept: () => false })).toEqual([]);
  });

  it.each([0, -1, NaN, Infinity])('rejects an invalid sample dimension or radius: %s', (value) => {
    expect(generatePoissonDisk(value, 10, 1, new RNG('bad'))).toEqual([]);
    expect(generatePoissonDisk(10, value, 1, new RNG('bad'))).toEqual([]);
    expect(generatePoissonDisk(10, 10, value, new RNG('bad'))).toEqual([]);
  });

  it('handles empty budgets and invalid attempt limits', () => {
    for (const maxPoints of [0, -1, NaN, 0.5]) expect(sample({ maxPoints })).toEqual([]);
    for (const k of [0, -1, NaN, Infinity])
      expect(generatePoissonDisk(10, 10, 1, new RNG('bad'), k)).toEqual([]);
  });
});
