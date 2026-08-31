import { describe, expect, it } from 'vitest';

import {
  addCharacterCarried,
  addCharacterDescribedEntry,
  addCharacterPersonalityTrait,
  addCharacterTitle,
  removeCharacterCarried,
  removeCharacterDescribedEntry,
  removeCharacterPersonalityTrait,
  removeCharacterTitle,
  setCharacterAge,
  setCharacterAgeCategory,
  setCharacterArchetypeName,
  setCharacterCarriedName,
  setCharacterDescribedEntry,
  setCharacterGender,
  setCharacterHeraldry,
  setCharacterMeasurement,
  setCharacterNamePart,
  setCharacterPersonalityTrait,
  setCharacterText,
  setCharacterTitleField,
} from './character_editing.js';
import { validateCharacterSnapshot } from './character_artifact_kind.js';
import { rollCharacter } from './character_roll.js';
import { toCharacterSnapshot, type CharacterSnapshot } from './character_snapshot.js';

function noble(): CharacterSnapshot {
  for (let seed = 0; seed < 200; seed += 1) {
    const { character } = rollCharacter(`editing-${seed}`, { archetypeName: 'noble' });
    if (character.archetype !== undefined && (character.titles?.length ?? 0) > 0) {
      return toCharacterSnapshot(character);
    }
  }
  throw new Error('no seed in the sweep produced a titled noble');
}

const fixture = noble();

describe('editing a character', () => {
  it('rederives the display name when a half of it changes', () => {
    const after = setCharacterNamePart(
      setCharacterNamePart(fixture, 'firstName', 'Maren'),
      'lastName',
      'Voss',
    );

    expect(after.firstName).toBe('Maren');
    expect(after.lastName).toBe('Voss');
    expect(after.name).toBe('Maren Voss');
  });

  /** Requirement 4.4: one field at a time, and nothing else disturbed. */
  it('leaves everything else alone', () => {
    const after = setCharacterText(fixture, 'description', 'Rewritten by hand.');

    expect(after.description).toBe('Rewritten by hand.');
    expect({ ...after, description: fixture.description }).toEqual(fixture);
  });

  it('changes nothing in place', () => {
    const before = structuredClone(fixture);
    setCharacterNamePart(fixture, 'firstName', 'Someone');
    addCharacterPersonalityTrait(fixture, 'restless');

    expect(fixture).toEqual(before);
  });

  it('takes a gender whole, so the pronouns follow the label', () => {
    const after = setCharacterGender(fixture, 'female');

    expect(after.gender.name).toBe('female');
    expect(after.gender.pronouns.subjective).toBe('she');
  });

  it('ignores a gender the build does not offer, rather than storing a name with no pronouns', () => {
    expect(setCharacterGender(fixture, 'a-gender-nobody-has')).toBe(fixture);
  });

  it('takes an age category whole, and refuses one it does not have', () => {
    expect(setCharacterAgeCategory(fixture, 'elderly').ageCategory.name).toBe('elderly');
    expect(setCharacterAgeCategory(fixture, 'ancient-and-terrible')).toBe(fixture);
  });

  /**
   * An emptied number field arrives as `NaN`. Stored, it is a payload that fails its own kind's
   * validation, which the user meets as a broken artifact rather than as a rejected keystroke.
   */
  it('refuses a measurement that is not a number', () => {
    expect(setCharacterMeasurement(fixture, 'height', Number.NaN)).toBe(fixture);
    expect(setCharacterAge(fixture, Number.NaN)).toBe(fixture);
    expect(setCharacterMeasurement(fixture, 'height', 168).height).toBe(168);
    expect(setCharacterAge(fixture, 41).age).toBe(41);
  });

  it('renames an archetype without inventing one for a character who has none', () => {
    expect(setCharacterArchetypeName(fixture, 'harbourmaster').archetype?.name).toBe(
      'harbourmaster',
    );

    const { archetype: _none, ...unemployed } = fixture;
    expect(setCharacterArchetypeName(unemployed, 'harbourmaster')).toBe(unemployed);
  });
});

describe('editing a character’s lists', () => {
  it('rewrites, adds and removes a personality trait', () => {
    const rewritten = setCharacterPersonalityTrait(fixture, 0, 'brooding');
    expect(rewritten.personalityTraits[0]).toBe('brooding');
    expect(rewritten.personalityTraits.slice(1)).toEqual(fixture.personalityTraits.slice(1));

    const added = addCharacterPersonalityTrait(fixture, 'restless');
    expect(added.personalityTraits.at(-1)).toBe('restless');

    expect(removeCharacterPersonalityTrait(added, added.personalityTraits.length - 1)).toEqual(
      fixture,
    );
  });

  it('does nothing at an index nothing lives at', () => {
    expect(setCharacterPersonalityTrait(fixture, 99, 'nowhere')).toBe(fixture);
    expect(removeCharacterPersonalityTrait(fixture, -1)).toBe(fixture);
    expect(setCharacterCarriedName(fixture, 99, 'nowhere')).toBe(fixture);
    expect(setCharacterTitleField(fixture, 99, 'landName', 'nowhere')).toBe(fixture);
  });

  it('edits physical traits and abilities through the one pair of functions', () => {
    for (const list of ['physicalTraits', 'abilities'] as const) {
      const added = addCharacterDescribedEntry(fixture, list);
      const index = added[list].length - 1;
      const named = setCharacterDescribedEntry(added, list, index, 'name', 'A scar');
      const described = setCharacterDescribedEntry(named, list, index, 'description', 'Old.');

      expect(described[list][index]?.name).toBe('A scar');
      expect(described[list][index]?.description).toBe('Old.');
      expect(removeCharacterDescribedEntry(described, list, index)).toEqual(fixture);
    }
  });

  it('adds, renames and removes a carried item, and the result still validates', () => {
    const added = addCharacterCarried(fixture);
    const named = setCharacterCarriedName(added, added.carried.length - 1, 'A bent key');

    expect(named.carried.at(-1)?.name).toBe('A bent key');
    expect(validateCharacterSnapshot(named).ok).toBe(true);
    expect(removeCharacterCarried(named, named.carried.length - 1)).toEqual(fixture);
  });

  it('rewrites one part of one title', () => {
    const after = setCharacterTitleField(fixture, 0, 'landName', 'Ashmere');

    expect(after.titles?.[0]?.landName).toBe('Ashmere');
    expect(after.titles?.[0]?.maleTitle).toBe(fixture.titles?.[0]?.maleTitle);
  });

  it('adds and removes a title, and the result still validates', () => {
    const added = addCharacterTitle(fixture);

    expect(added.titles).toHaveLength((fixture.titles?.length ?? 0) + 1);
    expect(validateCharacterSnapshot(added).ok).toBe(true);
    expect(removeCharacterTitle(added, added.titles!.length - 1)).toEqual(fixture);
  });
});

describe('a character’s coat of arms', () => {
  it('is removed by dropping the field entirely, not by storing null', () => {
    const after = setCharacterHeraldry(fixture, undefined);

    expect(after).not.toHaveProperty('heraldry');
    expect(validateCharacterSnapshot(after).ok).toBe(true);
  });

  /** `null` says the arms are a record of their own; see requirement 5.2. */
  it('is stored as null when a saved coat of arms supplies it', () => {
    expect(setCharacterHeraldry(fixture, null).heraldry).toBeNull();
  });

  it('is replaced whole', () => {
    const replacement = { device: fixture.heraldry!.device, blazon: 'Party per pale, a new thing' };

    expect(setCharacterHeraldry(fixture, replacement).heraldry?.blazon).toBe(
      'Party per pale, a new thing',
    );
  });
});
