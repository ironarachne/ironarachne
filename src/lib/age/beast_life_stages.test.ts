import { describe, expect, it } from 'vitest';
import { getCategoryFromAge, getMaxAge } from './age_categories';
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

  it('resolves representative ages with getCategoryFromAge', () => {
    const ages = beastLifespanFourStage();
    expect(getCategoryFromAge(0, ages).name).toBe('infant');
    expect(getCategoryFromAge(2, ages).name).toBe('child');
    expect(getCategoryFromAge(5, ages).name).toBe('adult');
    expect(getCategoryFromAge(31, ages).name).toBe('elderly');
  });

  it('has correct commonality values for all stages', () => {
    const c = beastLifespanFourStage();
    expect(c[0].commonality).toBe(1);
    expect(c[1].commonality).toBe(2);
    expect(c[2].commonality).toBe(20);
    expect(c[3].commonality).toBe(3);
  });

  it('throws for age above maximum', () => {
    const c = beastLifespanFourStage();
    expect(() => getCategoryFromAge(46, c)).toThrow();
  });

  it('has correct maximum age', () => {
    const c = beastLifespanFourStage();
    expect(getMaxAge(c)).toBe(45);
  });

  it('handles both options together', () => {
    const c = beastLifespanFourStage({ elderlyCommonality: 1, firstStageName: 'puppy' });
    expect(c[0].name).toBe('puppy');
    expect(c[3].commonality).toBe(1);
  });

  it('has correct noun values for all stages', () => {
    const c = beastLifespanFourStage();
    expect(c[0].noun).toBe('baby');
    expect(c[1].noun).toBe('child');
    expect(c[2].noun).toBe('adult');
    expect(c[3].noun).toBe('elder');
  });

  it('has correct genderedNoun values for all stages', () => {
    const c = beastLifespanFourStage();
    expect(c[0].genderedNoun).toEqual(['baby', 'baby', 'baby']);
    expect(c[1].genderedNoun).toEqual(['adolescent', 'adolescent', 'adolescent']);
    expect(c[2].genderedNoun).toEqual(['adult', 'adult', 'adult']);
    expect(c[3].genderedNoun).toEqual(['elder', 'elder', 'elder']);
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

  it('has correct commonality values', () => {
    const c = beastLifespanCat();
    expect(c[0].commonality).toBe(2);
    expect(c[1].commonality).toBe(20);
    expect(c[2].commonality).toBe(3);
  });

  it('resolves representative ages with getCategoryFromAge', () => {
    const c = beastLifespanCat();
    expect(getCategoryFromAge(0, c).name).toBe('kitten');
    expect(getCategoryFromAge(2, c).name).toBe('adult');
    expect(getCategoryFromAge(11, c).name).toBe('elderly');
  });

  it('throws for age above maximum', () => {
    const c = beastLifespanCat();
    expect(() => getCategoryFromAge(31, c)).toThrow();
  });

  it('has correct maximum age', () => {
    const c = beastLifespanCat();
    expect(getMaxAge(c)).toBe(30);
  });

  it('has correct noun values for all stages', () => {
    const c = beastLifespanCat();
    expect(c[0].noun).toBe('kitten');
    expect(c[1].noun).toBe('adult');
    expect(c[2].noun).toBe('elder');
  });

  it('has correct genderedNoun values for all stages', () => {
    const c = beastLifespanCat();
    expect(c[0].genderedNoun).toEqual(['kitten', 'kitten', 'kitten']);
    expect(c[1].genderedNoun).toEqual(['adult', 'adult', 'adult']);
    expect(c[2].genderedNoun).toEqual(['elder', 'elder', 'elder']);
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

  it('has correct commonality values', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(c[0].commonality).toBe(1);
    expect(c[1].commonality).toBe(20);
    expect(c[2].commonality).toBe(3);
  });

  it('resolves representative ages with getCategoryFromAge', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(getCategoryFromAge(0, c).name).toBe('hatchling');
    expect(getCategoryFromAge(2, c).name).toBe('adult');
    expect(getCategoryFromAge(31, c).name).toBe('elderly');
  });

  it('throws for age above maximum', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(() => getCategoryFromAge(46, c)).toThrow();
  });

  it('has correct maximum age', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(getMaxAge(c)).toBe(45);
  });

  it('has correct noun values for all stages', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(c[0].noun).toBe('baby');
    expect(c[1].noun).toBe('adult');
    expect(c[2].noun).toBe('elder');
  });

  it('has correct genderedNoun values for all stages', () => {
    const c = beastLifespanHatchlingAdultFromTwo();
    expect(c[0].genderedNoun).toEqual(['baby', 'baby', 'baby']);
    expect(c[1].genderedNoun).toEqual(['adult', 'adult', 'adult']);
    expect(c[2].genderedNoun).toEqual(['elder', 'elder', 'elder']);
  });
});

describe('beastLifespanHatchlingAdultFromFive', () => {
  it('keeps a gap for ages 2-4 (legacy behavior)', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(c).toHaveLength(3);
    expect(c[1].minAge).toBe(5);
    expect(getCategoryFromAge(0, c).name).toBe('hatchling');
  });

  it('throws for ages in the gap', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(() => getCategoryFromAge(2, c)).toThrow();
    expect(() => getCategoryFromAge(3, c)).toThrow();
    expect(() => getCategoryFromAge(4, c)).toThrow();
  });

  it('has correct commonality values', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(c[0].commonality).toBe(1);
    expect(c[1].commonality).toBe(20);
    expect(c[2].commonality).toBe(3);
  });

  it('resolves representative ages with getCategoryFromAge', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(getCategoryFromAge(0, c).name).toBe('hatchling');
    expect(getCategoryFromAge(5, c).name).toBe('adult');
    expect(getCategoryFromAge(31, c).name).toBe('elderly');
  });

  it('throws for age above maximum', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(() => getCategoryFromAge(46, c)).toThrow();
  });

  it('has correct maximum age', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(getMaxAge(c)).toBe(45);
  });

  it('has correct noun values for all stages', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(c[0].noun).toBe('baby');
    expect(c[1].noun).toBe('adult');
    expect(c[2].noun).toBe('elder');
  });

  it('has correct genderedNoun values for all stages', () => {
    const c = beastLifespanHatchlingAdultFromFive();
    expect(c[0].genderedNoun).toEqual(['baby', 'baby', 'baby']);
    expect(c[1].genderedNoun).toEqual(['adult', 'adult', 'adult']);
    expect(c[2].genderedNoun).toEqual(['elder', 'elder', 'elder']);
  });
});
