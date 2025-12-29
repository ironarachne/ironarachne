import { describe, it, expect } from 'vitest';
import { generateArtObject, getArtObjectOfMaxValue, getArtObjectsForValue, artObjectTypes } from './art_objects';

describe('art_objects', () => {
  describe('generateArtObject', () => {
    it('should create an art object with default values', () => {
      const type = artObjectTypes[0];
      const art = generateArtObject('test-id', type);

      expect(art.id).toBe('test-id');
      expect(art.name).toBe(type.name);
      expect(art.value).toBe(type.baseValue);
      expect(art.artist).toBe('Unknown Artist');
      expect(art.description).toContain(type.name.toLowerCase());
    });

    it('should create an art object with custom values', () => {
      const type = artObjectTypes[0];
      const art = generateArtObject('test-id', type, 'Famous Artist', 'A masterpiece');

      expect(art.artist).toBe('Famous Artist');
      expect(art.description).toBe('A masterpiece');
    });
  });

  describe('getArtObjectOfMaxValue', () => {
    it('should return an art object within the max value', () => {
      const maxValue = 2000;
      const art = getArtObjectOfMaxValue(maxValue);

      expect(art.value).toBeLessThanOrEqual(maxValue);
    });

    it('should throw an error if no art object is available within the max value', () => {
      const maxValue = 100; // Assuming no art object is this cheap
      expect(() => getArtObjectOfMaxValue(maxValue)).toThrow();
    });
  });

  describe('getArtObjectsForValue', () => {
    it('should return a list of art objects summing up to the total value', () => {
      const totalValue = 3000;
      const artObjects = getArtObjectsForValue(totalValue);
      const sum = artObjects.reduce((acc, art) => acc + art.value, 0);

      expect(sum).toBeLessThanOrEqual(totalValue);
      // It might not be exactly equal if the greedy algorithm can't fill it perfectly,
      // but based on the implementation it tries to fill as much as possible.
      // Given the base values (1500, 2000, 2500, 3000, 4000), 3000 can be exactly filled.
      expect(sum).toBe(totalValue);
    });

    it('should return empty list if total value is too low', () => {
      const totalValue = 10;
      const artObjects = getArtObjectsForValue(totalValue);
      expect(artObjects).toHaveLength(0);
    });
  });
});
