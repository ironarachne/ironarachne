import { describe, expect, it } from 'vitest';
import { getMaxAge } from '$lib/age/age_categories';
import { dragonLifespanTrueWyrm } from '$lib/age/dragon_life_stages';

describe('dragonLifespanTrueWyrm', () => {
  it('has five contiguous non-overlapping bands', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats).toHaveLength(5);

    const names = cats.map((c) => c.name);
    expect(new Set(names).size).toBe(5);

    for (let i = 0; i < cats.length; i++) {
      expect(cats[i].maxAge).toBeGreaterThanOrEqual(cats[i].minAge);
      if (i > 0) {
        expect(cats[i].minAge).toBe(cats[i - 1].maxAge + 1);
      }
    }
  });

  it('has a reasonable fantasy lifespan cap', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getMaxAge(cats)).toBe(5000);
  });

  it('weights adults most heavily', () => {
    const cats = dragonLifespanTrueWyrm();
    const adult = cats.find((c) => c.name === 'adult');
    const great = cats.find((c) => c.name === 'great_wyrm');
    expect(adult).toBeDefined();
    expect(great).toBeDefined();
    expect(adult!.commonality).toBeGreaterThan(great!.commonality);
  });
});
