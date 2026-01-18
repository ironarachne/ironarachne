import { describe, it, expect } from 'vitest';
import { filterRelationshipTypes, generateRelationshipDescription, getInverseRelationshipType, relationshipTypes } from './relationships';
import type { RNG } from "@ironarachne/rng";

describe('Relationships Library', () => {

    describe('filterRelationshipTypes', () => {
        it('should return all types when no filters are provided', () => {
            const result = filterRelationshipTypes([], []);
            expect(result.length).toBe(relationshipTypes.length);
        });

        it('should filter by allowed tags (positive)', () => {
            const allowedTags = ['positive'];
            const result = filterRelationshipTypes(allowedTags, []);
            expect(result.length).toBeGreaterThan(0);
            result.forEach(type => {
              expect(type.tags).toContain('positive');
            });
        });

        it('should return empty array if allowed tags do not match any type', () => {
             const allowedTags = ['nonexistent_tag'];
             const result = filterRelationshipTypes(allowedTags, []);
             expect(result.length).toBe(0);
        });

         it('should filter by allowed tags (negative)', () => {
            const allowedTags = ['negative'];
            const result = filterRelationshipTypes(allowedTags, []);
            expect(result.length).toBeGreaterThan(0);
            result.forEach(type => {
              expect(type.tags).toContain('negative');
            });
        });

        it('should filter by including all allowed tags', () => {
            const allowedTags = ['positive', 'social'];
            const result = filterRelationshipTypes(allowedTags, []);
            expect(result.length).toBeGreaterThan(0);
            result.forEach(type => {
                expect(type.tags).toContain('positive');
                expect(type.tags).toContain('social');
            });
        });

        it('should exclude disallowed tags', () => {
             const disallowedTags = ['social'];
             const result = filterRelationshipTypes([], disallowedTags);
             expect(result.length).toBeGreaterThan(0);
             result.forEach(type => {
                 expect(type.tags).not.toContain('social');
             });
        });

        it('should handle allowed and disallowed tags together', () => {
            const allowedTags = ['positive'];
            const disallowedTags = ['familial'];
            const result = filterRelationshipTypes(allowedTags, disallowedTags);
            expect(result.length).toBeGreaterThan(0);
             result.forEach(type => {
                expect(type.tags).toContain('positive');
                expect(type.tags).not.toContain('familial');
            });
        });
    });

    describe('generateRelationshipDescription', () => {
        it('should generate a description based on template', () => {
            const mockRng = {
                item: (arr: any[]) => arr[0]
            } as RNG;

            const type = relationshipTypes.find(t => t.name === 'friend');
            if (!type) throw new Error("Friend type not found");

            const description = generateRelationshipDescription(mockRng, 'Alice', 'Bob', type);
            // Default friend template: "{originator} is friends with {recipient}"
            expect(description).toBe('Alice is friends with Bob');
        });
    });

    describe('getInverseRelationshipType', () => {
        it('should return the correct reciprocal type for friend', () => {
            const friendType = relationshipTypes.find(t => t.name === 'friend');
            if (!friendType) throw new Error("Friend type not found");

            const inverse = getInverseRelationshipType(friendType);
            expect(inverse).not.toBeNull();
            expect(inverse?.name).toBe('friend');
        });

        it('should return the correct reciprocal type for commander', () => {
            const commanderType = relationshipTypes.find(t => t.name === 'commander');
             if (!commanderType) throw new Error("Commander type not found");

            const inverse = getInverseRelationshipType(commanderType);
            expect(inverse).not.toBeNull();
            expect(inverse?.name).toBe('subordinate');
        });
        
        it('should return null if reciprocal type does not exist', () => {
             // 'desire' has reciprocalName: "", so it might fail or return null depending on logic
             const desireType = relationshipTypes.find(t => t.name === 'desire');
             if (!desireType) throw new Error("Desire type not found");
             
             const inverse = getInverseRelationshipType(desireType);
             // Logic: relationships.find(t => t.name === type.reciprocalName)
             // reciprocalName is "" for desire. likely no type with name "".
             expect(inverse).toBeNull();
        });
    });
});
