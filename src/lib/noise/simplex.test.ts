import { expect, describe, it } from 'vitest';
import { createSimplexNoise2D } from './simplex';

describe('createSimplexNoise2D', () => {
  it('returns a function of two coordinates', () => {
    const noise = createSimplexNoise2D('seed');

    expect(typeof noise).toBe('function');
    expect(noise).toHaveLength(2);
  });

  it('is deterministic for a given seed and coordinate', () => {
    expect(createSimplexNoise2D('terrain')(3.5, -2.25)).toBe(
      createSimplexNoise2D('terrain')(3.5, -2.25),
    );
  });

  it('returns the same value when the same function is called twice', () => {
    const noise = createSimplexNoise2D('terrain');

    expect(noise(1.5, 1.5)).toBe(noise(1.5, 1.5));
  });

  it('produces a different field for a different seed', () => {
    const first = createSimplexNoise2D('one');
    const second = createSimplexNoise2D('two');
    const differences = Array.from({ length: 50 }, (_, index) => {
      const coordinate = index * 0.37;
      return first(coordinate, coordinate) !== second(coordinate, coordinate);
    });

    expect(differences.some(Boolean)).toBe(true);
  });

  it('stays within [-1, 1] across a wide sample', () => {
    const noise = createSimplexNoise2D('range');

    for (let x = -20; x <= 20; x += 0.7) {
      for (let y = -20; y <= 20; y += 0.7) {
        const value = noise(x, y);

        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it('returns a finite number for every sampled coordinate', () => {
    const noise = createSimplexNoise2D('finite');

    for (let index = 0; index < 200; index++) {
      expect(Number.isFinite(noise(index * 1.3, index * -0.9))).toBe(true);
    }
  });

  it('returns zero at the origin, where every corner gradient cancels', () => {
    expect(createSimplexNoise2D('origin')(0, 0)).toBe(0);
  });

  it('varies smoothly rather than jumping between neighbouring points', () => {
    const noise = createSimplexNoise2D('smooth');
    const step = 0.01;

    for (let index = 0; index < 100; index++) {
      const x = index * 0.31;
      const delta = Math.abs(noise(x, 0) - noise(x + step, 0));

      expect(delta).toBeLessThan(0.2);
    }
  });

  it('produces a range of values rather than a constant', () => {
    const noise = createSimplexNoise2D('variety');
    const samples = Array.from({ length: 400 }, (_, index) => noise(index * 0.13, index * 0.29));

    expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(0.5);
  });

  it('covers both simplex triangles, above and below the x equals y diagonal', () => {
    const noise = createSimplexNoise2D('triangles');

    expect(Number.isFinite(noise(0.8, 0.2))).toBe(true);
    expect(Number.isFinite(noise(0.2, 0.8))).toBe(true);
    expect(noise(0.8, 0.2)).not.toBe(noise(0.2, 0.8));
  });

  it('handles negative and fractional coordinates', () => {
    const noise = createSimplexNoise2D('negative');

    expect(Number.isFinite(noise(-12.75, -3.125))).toBe(true);
    expect(Number.isFinite(noise(-0.5, 0.5))).toBe(true);
  });

  it('averages near zero over a large sample, as noise should', () => {
    const noise = createSimplexNoise2D('mean');
    const samples: number[] = [];

    for (let x = 0; x < 40; x += 0.5) {
      for (let y = 0; y < 40; y += 0.5) {
        samples.push(noise(x, y));
      }
    }

    const mean = samples.reduce((total, value) => total + value, 0) / samples.length;

    expect(Math.abs(mean)).toBeLessThan(0.1);
  });
});
