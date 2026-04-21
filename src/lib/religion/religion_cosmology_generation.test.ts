import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateReligionCosmology } from './religion_cosmology_generation';

describe('generateReligionCosmology', () => {
  it('returns null when depth is none', () => {
    const c = generateReligionCosmology('cos-none', 'none', new RNG('r1'));
    expect(c).toBeNull();
  });

  it('returns echelons for shallow depth', () => {
    const c = generateReligionCosmology('cos-shallow', 'shallow', new RNG('r2'));
    expect(c).not.toBeNull();
    expect(c!.echelons.length).toBeGreaterThanOrEqual(1);
    expect(c!.echelons.length).toBeLessThanOrEqual(2);
    expect(c!.summary.length).toBeGreaterThan(20);
  });

  it('is deterministic for a fixed seed and mode', () => {
    const a = generateReligionCosmology('seed-a', 'moderate', new RNG('x'));
    const b = generateReligionCosmology('seed-a', 'moderate', new RNG('x'));
    expect(a).toEqual(b);
  });
});
