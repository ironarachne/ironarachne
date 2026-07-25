import { describe, it, expect } from 'vitest';
import {
  generateRelationshipDescription,
  generateRelationships,
  getInverseRelationshipType,
  relationshipTypes,
} from './relationships';
import type { RNG } from '@ironarachne/rng';
import type { Character } from '$lib/characters';
import type { RelationshipGenerationConfig } from './relationship_types';

const config: RelationshipGenerationConfig = {};

describe('Relationships Library', () => {
  describe('generateRelationshipDescription', () => {
    it('should generate a description based on template', () => {
      const mockRng = {
        item: <T>(arr: T[]) => arr[0],
      } as RNG;

      const type = relationshipTypes.find((t) => t.name === 'friend');
      if (!type) throw new Error('Friend type not found');

      const description = generateRelationshipDescription(mockRng, 'Alice', 'Bob', type);
      // Default friend template: "{originator} is friends with {recipient}"
      expect(description).toBe('Alice is friends with Bob');
    });
  });

  describe('getInverseRelationshipType', () => {
    it('should return the correct reciprocal type for friend', () => {
      const friendType = relationshipTypes.find((t) => t.name === 'friend');
      if (!friendType) throw new Error('Friend type not found');

      const inverse = getInverseRelationshipType(friendType);
      expect(inverse).not.toBeNull();
      expect(inverse?.name).toBe('friend');
    });

    it('should return the correct reciprocal type for commander', () => {
      const commanderType = relationshipTypes.find((t) => t.name === 'commander');
      if (!commanderType) throw new Error('Commander type not found');

      const inverse = getInverseRelationshipType(commanderType);
      expect(inverse).not.toBeNull();
      expect(inverse?.name).toBe('subordinate');
    });

    it('should return null if reciprocal type does not exist', () => {
      // 'desire' has reciprocalName: "", so it might fail or return null depending on logic
      const desireType = relationshipTypes.find((t) => t.name === 'desire');
      if (!desireType) throw new Error('Desire type not found');

      const inverse = getInverseRelationshipType(desireType);
      // Logic: relationships.find(t => t.name === type.reciprocalName)
      // reciprocalName is "" for desire. likely no type with name "".
      expect(inverse).toBeNull();
    });
  });

  describe('generateRelationships', () => {
    it('should return an empty array if less than 2 characters are provided', () => {
      const result0 = generateRelationships('seed', [], config);
      expect(result0).toEqual([]);

      const result1 = generateRelationships(
        'seed',
        [{ id: '1', name: 'Alice' } as Character],
        config,
      );
      expect(result1).toEqual([]);
    });

    it('should generate relationships for a group of characters', () => {
      const characters = [
        { id: '1', name: 'Alice' } as Character,
        { id: '2', name: 'Bob' } as Character,
        { id: '3', name: 'Charlie' } as Character,
        { id: '4', name: 'Diana' } as Character,
      ];

      const relationships = generateRelationships('test-seed', characters, config);

      expect(relationships.length).toBeGreaterThan(0);

      // Check that relationships have valid properties
      relationships.forEach((rel) => {
        expect(rel.id).toBeDefined();
        expect(rel.originatorId).toBeDefined();
        expect(rel.recipientId).toBeDefined();
        expect(rel.type).toBeDefined();
        expect(rel.description).toBeDefined();

        // Originator and recipient should not be the same
        expect(rel.originatorId).not.toBe(rel.recipientId);
      });
    });

    it('should generate reciprocal relationships for non-one-sided types', () => {
      const characters = [
        { id: '1', name: 'Alice' } as Character,
        { id: '2', name: 'Bob' } as Character,
      ];

      const relationships = generateRelationships('reciprocal-seed', characters, config);

      relationships.forEach((rel) => {
        if (!rel.type.isOneSided) {
          const reciprocal = relationships.find(
            (r) =>
              r.originatorId === rel.recipientId &&
              r.recipientId === rel.originatorId &&
              r.type.name === rel.type.reciprocalName,
          );
          expect(reciprocal).toBeDefined();
        }
      });
    });

    it('should not generate incompatible relationships', () => {
      const characters = [
        { id: '1', name: 'Alice' } as Character,
        { id: '2', name: 'Bob' } as Character,
        { id: '3', name: 'Charlie' } as Character,
      ];

      const relationships = generateRelationships('incompatible-seed', characters, config);

      // Group relationships by originator
      const byOriginator = new Map<string, typeof relationships>();
      relationships.forEach((rel) => {
        if (!byOriginator.has(rel.originatorId)) {
          byOriginator.set(rel.originatorId, []);
        }
        byOriginator.get(rel.originatorId)!.push(rel);
      });

      // Check for incompatibilities
      byOriginator.forEach((rels) => {
        rels.forEach((rel) => {
          const incompatibleTypes = rel.type.incompatibleWithTypes;
          const hasIncompatible = rels.some((r) => incompatibleTypes.includes(r.type.name));
          expect(hasIncompatible).toBe(false);
        });
      });
    });

    it('should generate deterministic results for the same seed', () => {
      const characters = [
        { id: '1', name: 'Alice' } as Character,
        { id: '2', name: 'Bob' } as Character,
        { id: '3', name: 'Charlie' } as Character,
      ];

      const relationships1 = generateRelationships('deterministic-seed', characters, config);
      const relationships2 = generateRelationships('deterministic-seed', characters, config);

      // We can't use toEqual directly because the IDs are randomly generated using the RNG,
      // but since the RNG is seeded, the IDs should also be identical.
      expect(relationships1).toEqual(relationships2);
    });
  });
});
