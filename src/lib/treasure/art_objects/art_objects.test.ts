import { describe, it, expect } from 'vitest';
import { generateArtObject, getArtObjectOfMaxValue, getArtObjectsForValue, artObjectTypes, generateRandomArtObject, getDefaultArtObjectGeneratorConfig, getRandomArtObjectsForValue } from './art_objects';

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
      const maxValue = 1; // Assuming no art object is this cheap
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

  describe('generateRandomArtObject', () => {
    it('should generate a random art object', () => {
      const art = generateRandomArtObject('test-seed');
      expect(art).toBeDefined();
      expect(art.itemMajorType).toBe('treasure');
      expect(art.itemMinorType).toBe('art object');
    });

    it('should respect minimum value config', () => {
      const config = getDefaultArtObjectGeneratorConfig();
      config.minimumValue = 3000;
      const art = generateRandomArtObject('test-seed', config);
      expect(art.value).toBeGreaterThanOrEqual(3000);
    });

    it('should respect maximum value config', () => {
      const config = getDefaultArtObjectGeneratorConfig();
      config.maximumValue = 2000;
      const art = generateRandomArtObject('test-seed', config);
      expect(art.value).toBeLessThanOrEqual(2000);
    });

    it('should throw error if no types match value range', () => {
      const config = getDefaultArtObjectGeneratorConfig();
      config.minimumValue = 1000000; // Assuming no art object is this expensive
      expect(() => generateRandomArtObject('test-seed', config)).toThrow();
    });
  });

  describe('getRandomArtObjectsForValue', () => {
    it('should return a list of art objects summing up to the total value', () => {
      const totalValue = 5000;
      const artObjects = getRandomArtObjectsForValue('test-seed', totalValue);
      const sum = artObjects.reduce((acc, art) => acc + art.value, 0);

      expect(sum).toBeLessThanOrEqual(totalValue);
      // It should be reasonably close, but might not be exact due to random generation
      expect(sum).toBeGreaterThan(0);
    });

    it('should return empty list if total value is too low', () => {
      const totalValue = 1; // Assuming no art object is this cheap
      const artObjects = getRandomArtObjectsForValue('test-seed', totalValue);
      expect(artObjects).toHaveLength(0);
    });
  });
});
