import { describe, expect, it } from 'vitest';
import { animism, shamanism } from './categories';
import { generateNonTheisticReligionDetail } from './non_theistic_religion_generation';

describe('generateNonTheisticReligionDetail', () => {
  it('throws for theistic categories', () => {
    expect(() =>
      generateNonTheisticReligionDetail('x', { ...animism, hasDeities: true, minDeities: 1, maxDeities: 3 }),
    ).toThrow();
  });

  it('produces structured animism detail', () => {
    const d = generateNonTheisticReligionDetail('a1', animism);
    expect(d.categoryName).toBe('animism');
    expect(d.spiritDomains.length).toBeGreaterThanOrEqual(3);
    expect(d.obligationCycles.length).toBeGreaterThanOrEqual(2);
    expect(d.narrativeSummary.length).toBeGreaterThan(80);
    expect(d.narrativeSummary).not.toMatch(/[a-z]+_[a-z]+/);
    expect(d.pollutionOrPurityNotes).not.toMatch(/[a-z]+_[a-z]+/);
  });

  it('is deterministic for fixed seed', () => {
    const d1 = generateNonTheisticReligionDetail('fix', shamanism);
    const d2 = generateNonTheisticReligionDetail('fix', shamanism);
    expect(d1).toEqual(d2);
  });
});
