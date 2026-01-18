import { describe, it, expect } from 'vitest';
import * as CharacterGen from './character_generation';
import * as RNG from '@ironarachne/rng';
import type { Character } from './character_types';

describe('Character Generation', () => {
    describe('describe', () => {
        const mockCharacter = {
            firstName: 'John',
            lastName: 'Doe',
            gender: { 
                name: 'male', 
                pronouns: { subjective: 'he', objective: 'him', possessive: 'his' } 
            },
            ageCategory: { noun: 'man' },
            age: 30,
            height: 183, // ~6ft
            weight: 80, // ~176lb
            species: { adjective: 'human' },
            physicalTraits: [
                { description: 'blue eyes' },
                { description: 'short hair' }
            ],
            personalityTraits: ['brave', 'kind']
        } as unknown as Character;

        it('should return a description string', () => {
            const rng = new RNG.RNG('test-seed');
            const description = CharacterGen.describe(mockCharacter, rng);
            
            expect(description).toContain('John Doe');
            expect(description).toContain('human');
            expect(description).toContain('man');
            expect(description).toContain('blue eyes');
            expect(description).toContain('short hair');
            expect(description).toContain('brave');
            expect(description).toContain('kind');
            // Check formatted height roughly
            expect(description).toContain('183 cm');
            // Weight description is optional in one of the templates
        });
    });

    describe('describePersonality', () => {
        const mockCharacter = {
            gender: { 
                pronouns: { subjective: 'he' } 
            },
            personalityTraits: ['brave', 'kind', 'stoic']
        } as unknown as Character;

        it('should return a personality description', () => {
            const desc = CharacterGen.describePersonality(mockCharacter);
            expect(desc).toBe('He is brave, kind, and stoic'); // Assuming @ironarachne/words arrayToPhrase does oxford comma or similar
        });
    });

    describe('describeTraits', () => {
         const mockCharacter = {
            physicalTraits: [
                { description: 'blue eyes' },
                { description: 'short hair' }
            ]
        } as unknown as Character;

        it('should return a list of trait descriptions', () => {
            const traits = CharacterGen.describeTraits(mockCharacter);
            expect(traits).toEqual(['blue eyes', 'short hair']);
        });
    });

    describe('getDefaultCharacterGenerationConfig', () => {
        it('should return a valid config', () => {
            const config = CharacterGen.getDefaultCharacterGenerationConfig('test-seed');
            expect(config).toBeDefined();
            expect(config.species).toBeDefined();
            expect(config.species.name).toBe('human');
            expect(config.maleFirstNameGenerator).toBeDefined();
            expect(config.femaleFirstNameGenerator).toBeDefined();
            expect(config.familyNameGenerator).toBeDefined();
        });
    });

    describe('generate', () => {
        it('should generate a character from config', () => {
            const config = CharacterGen.getDefaultCharacterGenerationConfig('test-gen-seed');
            const character = CharacterGen.generate('char-seed', config);

            expect(character).toBeDefined();
            expect(character.firstName).toBeDefined();
            expect(character.lastName).toBeDefined();
            expect(character.species).toBeDefined();
            
            // Check seeded consistency - need fresh config because generators are stateful
            const config2 = CharacterGen.getDefaultCharacterGenerationConfig('test-gen-seed');
            const character2 = CharacterGen.generate('char-seed', config2);
            expect(character2.firstName).toBe(character.firstName);
            expect(character2.lastName).toBe(character.lastName);
            expect(character2.height).toBe(character.height);
            expect(character2.weight).toBe(character.weight);
        });

        it('should generate different characters with different seeds', () => {
            const config = CharacterGen.getDefaultCharacterGenerationConfig('test-gen-seed');
            const character1 = CharacterGen.generate('seed-1', config);
            const character2 = CharacterGen.generate('seed-2', config);

            // It's possible names align but unlikely everything aligns
            const distinct = (character1.firstName !== character2.firstName) || 
                           (character1.lastName !== character2.lastName) ||
                           (character1.height !== character2.height);
            
            expect(distinct).toBe(true);
        });
    });
});
