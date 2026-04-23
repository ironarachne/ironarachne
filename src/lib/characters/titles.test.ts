import { describe, it, expect } from 'vitest';
import * as Titles from './titles';
import type { Title, Character } from './character_types';

describe('Titles', () => {
  const kingTitle: Title = Titles.getNobleTitleByName('king');
  const dukeTitle: Title = Titles.getNobleTitleByName('duke');
  const knightTitle: Title = Titles.getNobleTitleByName('knight');

  describe('getTitleForGender', () => {
    it('should return female title for female gender', () => {
      expect(Titles.getTitleForGender('female', kingTitle)).toBe('Queen');
    });

    it('should return male title for male gender', () => {
      expect(Titles.getTitleForGender('male', kingTitle)).toBe('King');
    });

    it('should return male title for other genders', () => {
      expect(Titles.getTitleForGender('non-binary', kingTitle)).toBe('King');
    });
  });

  describe('getHonorific', () => {
    it('should return female honorific for female gender', () => {
      expect(Titles.getHonorific('female', knightTitle)).toBe('Dame');
    });

    it('should return male honorific for male gender', () => {
      expect(Titles.getHonorific('male', knightTitle)).toBe('Sir');
    });

    it('replaces {pronoun} with possessive in royal honorifics', () => {
      const kingTitle = Titles.getNobleTitleByName('king');
      expect(Titles.getHonorific('male', kingTitle)).toBe('His Majesty');
      expect(Titles.getHonorific('female', kingTitle)).toBe('Her Majesty');
    });

    it('uses explicit possessive when provided (non-default gender names)', () => {
      const kingTitle = Titles.getNobleTitleByName('king');
      expect(Titles.getHonorific('non-binary', kingTitle, { possessive: 'their' })).toBe('Their Majesty');
    });

    it('defaults non-binary honorific to their when no pronouns passed', () => {
      const kingTitle = Titles.getNobleTitleByName('king');
      expect(Titles.getHonorific('non-binary', kingTitle)).toBe('Their Majesty');
    });
  });

  describe('Precedence', () => {
    it('should correctly identify higher precedence', () => {
      expect(Titles.hasHigherPrecedenceThan(dukeTitle, kingTitle)).toBe(true);
      expect(Titles.hasHigherPrecedenceThan(kingTitle, dukeTitle)).toBe(false);
    });

    it('should correctly identify lower precedence', () => {
      expect(Titles.hasLowerPrecedenceThan(kingTitle, dukeTitle)).toBe(true);
      expect(Titles.hasLowerPrecedenceThan(dukeTitle, kingTitle)).toBe(false);
    });

    it('should get highest precedence title', () => {
      const titles = [dukeTitle, kingTitle, knightTitle];
      expect(Titles.getHighestPrecedenceTitle(titles)).toEqual(kingTitle);
    });
  });

  describe('getTitle', () => {
    it('should return the correct string for a character', () => {
      const character = {
        gender: { name: 'male' },
        titles: [dukeTitle, kingTitle],
      } as unknown as Character;

      expect(Titles.getTitle(character)).toBe('King');
    });

    it('should return empty string if no titles', () => {
      const character = {
        gender: { name: 'male' },
        titles: [],
      } as unknown as Character;

      expect(Titles.getTitle(character)).toBe('');
    });
  });

  describe('createTitleFromCore', () => {
    it('fills tags and rank flags with defaults', () => {
      const title = Titles.createTitleFromCore({
        femaleTitle: 'Captain',
        maleTitle: 'Captain',
        femaleHonorific: 'Captain',
        maleHonorific: 'Captain',
        hasLands: false,
        landName: '',
        precedence: 0,
      });
      expect(title.tags).toEqual([]);
      expect(title.isHereditary).toBe(false);
      expect(title.isNoble).toBe(false);
      expect(title.isRoyal).toBe(false);
    });

    it('applies optional rank flags', () => {
      const title = Titles.createTitleFromCore(
        {
          femaleTitle: 'Queen',
          maleTitle: 'King',
          femaleHonorific: 'Majesty',
          maleHonorific: 'Majesty',
          hasLands: true,
          landName: 'Kingdom of',
          precedence: 1,
        },
        { isHereditary: true, isNoble: true, isRoyal: true },
      );
      expect(title.isRoyal).toBe(true);
      expect(title.isNoble).toBe(true);
    });
  });
});
