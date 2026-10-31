import { describe, it, expect } from 'vitest';
import { generateDungeon } from './generator';
import { buildDungeonEnvironment } from '../dungeon_roll';

const baseEnvironment = buildDungeonEnvironment(
  'architecture-fixture',
  'temperate deciduous forest',
);
const mockCavernEnvironment = {
  ...baseEnvironment,
  biome: { ...baseEnvironment.biome, name: 'cave', features: ['roots', 'moss'] },
};

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
