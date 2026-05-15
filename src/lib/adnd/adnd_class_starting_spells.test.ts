import { describe, expect, it } from 'vitest';
import {
  getStartingSpellChoiceGroups,
  starterSpellSelectionIsComplete,
  startingSpellsFromPicks,
} from './adnd_class_starting_spells.js';
import illusionist from './classes/illusionist.js';
import mage from './classes/mage.js';

describe('getStartingSpellChoiceGroups', () => {
  it('mage has one level-1 spell slot', () => {
    const groups = getStartingSpellChoiceGroups(mage);
    expect(groups.length).toBe(1);
    expect(groups[0].count).toBe(1);
    expect(groups[0].candidates.length).toBeGreaterThan(0);
  });

  it('illusionist has two spell groups', () => {
    const groups = getStartingSpellChoiceGroups(illusionist);
    expect(groups.length).toBe(2);
    expect(groups.every((g) => g.count === 1)).toBe(true);
  });
});

describe('starterSpellSelectionIsComplete', () => {
  it('is false until each slot is filled', () => {
    expect(starterSpellSelectionIsComplete(mage, [[]])).toBe(false);
    expect(starterSpellSelectionIsComplete(mage, [['']])).toBe(false);
    const first = getStartingSpellChoiceGroups(mage)[0].candidates[0].name;
    expect(starterSpellSelectionIsComplete(mage, [[first]])).toBe(true);
  });

  it('requires both illusionist groups', () => {
    const groups = getStartingSpellChoiceGroups(illusionist);
    expect(starterSpellSelectionIsComplete(illusionist, [[groups[0].candidates[0].name]])).toBe(
      false,
    );
    expect(
      starterSpellSelectionIsComplete(illusionist, [
        [groups[0].candidates[0].name],
        [groups[1].candidates[0].name],
      ]),
    ).toBe(true);
  });
});

describe('startingSpellsFromPicks', () => {
  it('returns chosen spells for mage', () => {
    const name = getStartingSpellChoiceGroups(mage)[0].candidates[3].name;
    const spells = startingSpellsFromPicks(mage, [[name]]);
    expect(spells.map((s) => s.name)).toEqual([name]);
  });
});
