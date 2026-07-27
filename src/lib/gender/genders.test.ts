import { expect, describe, it } from 'vitest';
import { getGenderFromSet, traditional } from './genders';
import type { Gender } from './gender_types';

describe('traditional', () => {
  it('returns the female and male genders', () => {
    expect(traditional().map((gender) => gender.name)).toEqual(['female', 'male']);
  });

  it('gives each gender a complete pronoun set', () => {
    for (const gender of traditional()) {
      expect(gender.pronouns.subjective).toBeTruthy();
      expect(gender.pronouns.objective).toBeTruthy();
      expect(gender.pronouns.possessive).toBeTruthy();
      expect(gender.pronouns.reflexive).toBeTruthy();
    }
  });

  it('returns a fresh array each call so callers cannot mutate the source', () => {
    const first = traditional();
    first[0].name = 'mutated';

    expect(traditional()[0].name).toBe('female');
  });
});

describe('getGenderFromSet', () => {
  const genderSet = traditional();

  it('returns the gender matching the name', () => {
    expect(getGenderFromSet('male', genderSet).pronouns.subjective).toBe('he');
  });

  it('matches names case-sensitively', () => {
    expect(() => getGenderFromSet('Male', genderSet)).toThrow(
      'Gender "Male" not found in provided gender set.',
    );
  });

  it('throws when the gender is absent', () => {
    expect(() => getGenderFromSet('agender', genderSet)).toThrow(
      'Gender "agender" not found in provided gender set.',
    );
  });

  it('throws when the gender set is empty', () => {
    expect(() => getGenderFromSet('female', [])).toThrow(
      'Gender "female" not found in provided gender set.',
    );
  });

  it('works with a custom gender set', () => {
    const custom: Gender[] = [
      {
        name: 'neutral',
        pronouns: {
          subjective: 'they',
          objective: 'them',
          possessive: 'their',
          reflexive: 'themselves',
        },
      },
    ];

    expect(getGenderFromSet('neutral', custom).pronouns.objective).toBe('them');
  });
});
