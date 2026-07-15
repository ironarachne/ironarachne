import { describe, expect, it } from 'vitest';
import { getCategoryFromAge, getMaxAge } from '$lib/age/age_categories';
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

  it('has correct commonality values for all stages', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[0].commonality).toBe(2);
    expect(cats[1].commonality).toBe(8);
    expect(cats[2].commonality).toBe(20);
    expect(cats[3].commonality).toBe(5);
    expect(cats[4].commonality).toBe(1);
  });

  it('has correct genderedNoun arrays', () => {
    const cats = dragonLifespanTrueWyrm();
    cats.forEach((cat) => {
      expect(cat.genderedNoun).toHaveLength(3);
      cat.genderedNoun.forEach((noun) => {
        expect(typeof noun).toBe('string');
      });
    });
  });

  it('resolves wyrmling at age 0', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(0, cats).name).toBe('wyrmling');
  });

  it('resolves wyrmling at age 8 (max boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(8, cats).name).toBe('wyrmling');
  });

  it('resolves young at age 9 (min boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(9, cats).name).toBe('young');
  });

  it('resolves young at age 99 (max boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(99, cats).name).toBe('young');
  });

  it('resolves adult at age 100 (min boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(100, cats).name).toBe('adult');
  });

  it('resolves adult at age 799 (max boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(799, cats).name).toBe('adult');
  });

  it('resolves ancient at age 800 (min boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(800, cats).name).toBe('ancient');
  });

  it('resolves ancient at age 1999 (max boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(1999, cats).name).toBe('ancient');
  });

  it('resolves great_wyrm at age 2000 (min boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(2000, cats).name).toBe('great_wyrm');
  });

  it('resolves great_wyrm at age 5000 (max boundary)', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(getCategoryFromAge(5000, cats).name).toBe('great_wyrm');
  });

  it('throws for age above maximum', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(() => getCategoryFromAge(5001, cats)).toThrow();
  });

  it('has correct noun values', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[0].noun).toBe('wyrmling');
    expect(cats[1].noun).toBe('young dragon');
    expect(cats[2].noun).toBe('adult dragon');
    expect(cats[3].noun).toBe('ancient dragon');
    expect(cats[4].noun).toBe('great wyrm');
  });

  it('has correct genderedNoun values for wyrmling', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[0].genderedNoun).toEqual(['wyrmling', 'wyrmling', 'wyrmling']);
  });

  it('has correct genderedNoun values for young', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[1].genderedNoun).toEqual(['young dragon', 'young dragon', 'young dragon']);
  });

  it('has correct genderedNoun values for adult', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[2].genderedNoun).toEqual(['dragon', 'dragon', 'dragon']);
  });

  it('has correct genderedNoun values for ancient', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[3].genderedNoun).toEqual(['ancient dragon', 'ancient dragon', 'ancient dragon']);
  });

  it('has correct genderedNoun values for great_wyrm', () => {
    const cats = dragonLifespanTrueWyrm();
    expect(cats[4].genderedNoun).toEqual(['great wyrm', 'great wyrm', 'great wyrm']);
  });
});
