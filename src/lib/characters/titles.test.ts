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
                 titles: [dukeTitle, kingTitle]
             } as unknown as Character;

             expect(Titles.getTitle(character)).toBe('King');
        });

        it('should return empty string if no titles', () => {
             const character = {
                 gender: { name: 'male' },
                 titles: []
             } as unknown as Character;

             expect(Titles.getTitle(character)).toBe('');
        });
    });
});
