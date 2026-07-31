import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getAllChargeGlyphs, getChargeGlyphByName } from './charge-data.js';
import {
  all,
  allChargeTags,
  matchingAnyTags,
  matchingTag,
  random,
  randomWithTag,
} from './charge-selectors.js';

const charges = getAllChargeGlyphs();

describe('all', () => {
  it('returns the whole charge table', () => {
    expect(all()).toEqual(charges);
  });

  it('returns a non-empty table', () => {
    expect(all().length).toBeGreaterThan(0);
  });
});

describe('getChargeGlyphByName', () => {
  it('finds a charge by name', () => {
    const target = charges[0];

    expect(getChargeGlyphByName(target.name)).toEqual(target);
  });

  it('returns undefined for a name that does not exist', () => {
    expect(getChargeGlyphByName('no-such-charge')).toBeUndefined();
  });

  it('finds every charge in the table by its own name', () => {
    for (const charge of charges) {
      expect(getChargeGlyphByName(charge.name)).toBeDefined();
    }
  });
});

describe('allChargeTags', () => {
  it('returns every distinct tag exactly once', () => {
    const tags = allChargeTags();

    expect(tags.length).toBeGreaterThan(0);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('includes every tag that appears on a charge', () => {
    const tags = new Set(allChargeTags());

    for (const charge of charges) {
      for (const tag of charge.tags) {
        expect(tags.has(tag)).toBe(true);
      }
    }
  });
});

describe('matchingTag', () => {
  it('returns only charges carrying the tag', () => {
    const tag = allChargeTags()[0];
    const result = matchingTag(tag, charges);

    expect(result.length).toBeGreaterThan(0);
    for (const charge of result) {
      expect(charge.tags).toContain(tag);
    }
  });

  it('returns nothing for a tag no charge carries', () => {
    expect(matchingTag('no-such-tag', charges)).toEqual([]);
  });

  it('lists a charge once even if the tag repeats', () => {
    const tag = allChargeTags()[0];
    const result = matchingTag(tag, charges);

    expect(new Set(result.map((charge) => charge.name)).size).toBe(result.length);
  });
});

describe('matchingAnyTags', () => {
  it('returns charges carrying at least one of the tags', () => {
    const tags = allChargeTags().slice(0, 2);
    const result = matchingAnyTags(tags, charges);

    expect(result.length).toBeGreaterThan(0);
    for (const charge of result) {
      expect(charge.tags.some((tag) => tags.includes(tag))).toBe(true);
    }
  });

  it('returns nothing for an empty tag list', () => {
    expect(matchingAnyTags([], charges)).toEqual([]);
  });

  it('returns nothing when no tag matches', () => {
    expect(matchingAnyTags(['no-such-tag'], charges)).toEqual([]);
  });

  it('is at least as broad as matching a single tag', () => {
    const tag = allChargeTags()[0];

    expect(matchingAnyTags([tag], charges)).toEqual(matchingTag(tag, charges));
  });

  it('lists a charge once even when it carries several of the tags', () => {
    const tags = allChargeTags();
    const result = matchingAnyTags(tags, charges);

    expect(new Set(result.map((charge) => charge.name)).size).toBe(result.length);
  });
});

describe('random', () => {
  it('returns a charge from the list it is given', () => {
    expect(charges).toContainEqual(random(charges, new RNG('seed-a')));
  });

  it('is reproducible from a seed', () => {
    expect(random(charges, new RNG('seed-a'))).toEqual(random(charges, new RNG('seed-a')));
  });

  it('varies with the seed', () => {
    const names = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((seed) => random(charges, new RNG(seed)).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });
});

describe('randomWithTag', () => {
  it('returns a charge carrying the tag', () => {
    const tag = allChargeTags()[0];

    for (const seed of ['a', 'b', 'c', 'd']) {
      expect(randomWithTag(tag, charges, new RNG(seed)).tags).toContain(tag);
    }
  });

  it('is reproducible from a seed', () => {
    const tag = allChargeTags()[0];

    expect(randomWithTag(tag, charges, new RNG('seed-a'))).toEqual(
      randomWithTag(tag, charges, new RNG('seed-a')),
    );
  });
});
