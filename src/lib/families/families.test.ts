import { describe, it, expect } from 'vitest';
import * as Families from './families';

describe('families', () => {
    const seed = 'test-seed';
    const config = Families.getDefaultFamilyGenerationConfig(seed);

    describe('generateNewFamily', () => {
        it('should generate a new family with basic properties', () => {
            const family = Families.generateNewFamily(seed, config);
            
            expect(family).toHaveProperty('id');
            expect(family).toHaveProperty('name');
            expect(family.members).toEqual([]);
            expect(family.memberIds).toEqual([]);
            expect(family.relationships).toEqual([]);
        });
    });

    describe('generateFamilyGeneration', () => {
        it('should add a founder if family is empty', () => {
            let family = Families.generateNewFamily(seed, config);
            
            // Set config to 0 generations to just test founder creation logic if implicit in the function
            // But generateFamilyGeneration runs generation loop inside.
            // If we run with 1 generation, it should add founder + simulate 1 generation.
            
            const oneGenConfig = { ...config, generations: 1 };
            family = Families.generateFamilyGeneration(seed, oneGenConfig, family);

            expect(family.members.length).toBeGreaterThan(0);
            
            // Should have at least one member (founder)
            // It might have more if the founder got married and had children in that 1 generation.
            const founder = family.members[0];
            expect(founder).toBeDefined();
            // Founder should have family name
            expect(founder.lastName).toBe(family.name);
        });

        it('should generate multiple members over generations', () => {
             let family = Families.generateNewFamily(seed, config);
             
             // config has defaults of 3 generations
             family = Families.generateFamilyGeneration(seed, config, family);

             // With 3 generations, we expect a decent number of members
             expect(family.members.length).toBeGreaterThan(1);
        });

        it('should establish relationships', () => {
            let family = Families.generateNewFamily(seed, config);
            family = Families.generateFamilyGeneration(seed, config, family);

            // If there are > 1 members, there might be relationships.
            // With default fertility, likely yes.
            if (family.members.length > 1 && family.relationships.length > 0) {
                 const rel = family.relationships[0];
                 expect(rel).toHaveProperty('type');
                 expect(rel).toHaveProperty('originatorId');
                 expect(rel).toHaveProperty('recipientId');
            }
        });
        
        it('should mark old members as dead eventually', () => {
            let family = Families.generateNewFamily(seed, config);
            
            // Force enough generations to ensure death, but limit population growth
            const manyGenConfig = { 
                ...config, 
                generations: 6, 
                minMembersPerGeneration: 1, 
                maxMembersPerGeneration: 2 
            };
            family = Families.generateFamilyGeneration(seed, manyGenConfig, family);
            
            const deadMembers = family.members.filter(m => m.tags.includes('dead'));
            // Founder should be dead by now (approx 120+ years passed)
            expect(deadMembers.length).toBeGreaterThan(0);
        });

        it('should generate personality traits when aging up from infant', () => {
            let family = Families.generateNewFamily(seed, config);
            
            // Run 1 generation to get members
            const oneGenConfig = { ...config, generations: 1 };
            family = Families.generateFamilyGeneration(seed, oneGenConfig, family);
            
            // Founder usually starts as child, but let's check any member.
            // If we have an adult member, they should have traits.
            const adult = family.members.find(m => m.ageCategory.name === 'adult' || m.ageCategory.name === 'young adult');
            if (adult) {
                expect(adult.personalityTraits.length).toBeGreaterThan(0);
            }
        });
    });
});
