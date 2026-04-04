import { describe, it, expect } from 'vitest';
import { generateDungeon } from './generator';
import type Environment from '../../environment/environment.js';

const mockCavernEnvironment: Environment = {
  biome: {
    name: 'cave',
    temperature: 50,
    altitude: 0,
    humidity: 90,
    isAquatic: false,
    descriptions: ['A dark, damp cave.'],
    features: ['stalactites', 'fungi'],
  },
  climate: {
    name: 'subterranean',
    temperature: 50,
    humidity: 90,
    descriptions: ['Always damp and cool.'],
    adjective: 'subterranean',
  },
  terrain: { name: 'underground', isWater: false },
  waterSystem: { name: 'underground river' },
  dominantEcosystem: { name: 'cave' },
  ecosystems: [],
  description: 'A vast network of natural caverns.'
} as unknown as Environment;

describe('Cavern Room Description', () => {
  it('should not use engineered language for natural caverns', () => {
    const dungeon = generateDungeon({
      seed: 'cavern-test-seed',
      width: 20,
      height: 20,
      environment: mockCavernEnvironment,
      blueprintName: 'Natural Caverns',
      encounterChancePerRoom: 0.0,
      treasureChancePerRoom: 0.0,
    });
    for (const room of dungeon.rooms) {
      expect(room.description.toLowerCase()).not.toContain('originally designed as');
    }
  });
});
