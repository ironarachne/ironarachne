import { describe, expect, it } from 'vitest';
import { getCategoryFromAge } from './age_categories';
import {
  beastLifespanCat,
  beastLifespanFourStage,
  beastLifespanHatchlingAdultFromFive,
  beastLifespanHatchlingAdultFromTwo,
} from './beast_life_stages';

describe('beastLifespanFourStage', () => {
  it('returns four bands with default elderly commonality 3', () => {
    const c = beastLifespanFourStage();
    expect(c).toHaveLength(4);
    expect(c[0].name).toBe('infant');
    expect(c[3].name).toBe('elderly');
    expect(c[3].commonality).toBe(3);
  });

  it('honors elderlyCommonality 1', () => {
    const c = beastLifespanFourStage({ elderlyCommonality: 1 });
    expect(c[3].commonality).toBe(1);
  });

  it('renames the first stage when firstStageName is set', () => {
    const puppy = beastLifespanFourStage({ firstStageName: 'puppy' });
    expect(puppy[0].name).toBe('puppy');
    const hatch = beastLifespanFourStage({ firstStageName: 'hatchling' });
    expect(hatch[0].name).toBe('hatchling');
  });

  it('returns a fresh array each call', () => {
    const a = beastLifespanFourStage();
    const b = beastLifespanFourStage();
    expect(a).not.toBe(b);
  });

  it('resolves a representative in-range age with getCategoryFromAge', () => {
    const ages = beastLifespanFourStage();
    expect(getCategoryFromAge(0, ages).name).toBe('infant');
    expect(getCategoryFromAge(3, ages).name).toBe('child');
    expect(getCategoryFromAge(20, ages).name).toBe('adult');
  });
});

describe('beastLifespanCat', () => {
  it('uses three custom bands as in species cat', () => {
    const c = beastLifespanCat();
    expect(c).toHaveLength(3);
    expect(c[0].name).toBe('kitten');
    expect(getCategoryFromAge(0, c).noun).toBe('kitten');
    expect(getCategoryFromAge(5, c).name).toBe('adult');
  });
});

describe('beastLifespanHatchlingAdultFromTwo', () => {
  it('omits a juvenile row and uses adult from 2', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(c).toHaveLength(3);
    expect(c[0].name).toBe('hatchling');
    expect(c[1].minAge).toBe(2);
    expect(getCategoryFromAge(2, c).name).toBe('adult');
  });
});

describe('beastLifespanHatchlingAdultFromFive', () => {
  it('keeps a gap for ages 2-4 (legacy behavior)', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(c).toHaveLength(3);
    expect(c[1].minAge).toBe(5);
    expect(getCategoryFromAge(0, c).name).toBe('hatchling');
  });

  it('throws for age 3 when no row covers that age', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(() => getCategoryFromAge(3, c)).toThrow();
  });
});
