import { describe, it, expect } from 'vitest';
import { generateDungeon } from './generator';
import { buildDungeonEnvironment } from '../dungeon_roll';

describe('Master Dungeon Generator', () => {
  // Stub a mock environment mimicking the existing ironarachne structure
  const baseEnvironment = buildDungeonEnvironment(
    'architecture-fixture',
    'temperate deciduous forest',
  );
  const mockForestEnvironment = {
    ...baseEnvironment,
    biome: { ...baseEnvironment.biome, name: 'forest', features: ['roots', 'moss'] },
  };

  it('should run end-to-end generating a complete functional dungeon blueprint', () => {
    const dungeon = generateDungeon({
      seed: 'master-generate-seed-1',
      width: 40,
      height: 40,
      environment: mockForestEnvironment,
      blueprintName: 'Stronghold', // 0.4 density, dense doors
      encounterChancePerRoom: 1.0, // Force every room to get creatures
      treasureChancePerRoom: 1.0, // Force every room to get treasure
    });

    // 1. Assert Metadata
    expect(dungeon.name).toContain('Forest Stronghold');
    expect(dungeon.theme.name).toBe('Forest Stronghold');

    // 2. Assert Layout Subsystems Linked Properly
    expect(dungeon.layout.width).toBe(40);
    expect(dungeon.layout.height).toBe(40);
    expect(dungeon.rooms.length).toBeGreaterThan(0);

    // 3. Assert Interactivity Output
    expect(dungeon.doors.length).toBeGreaterThan(0);

    // 4. Assert Encounter Subsystem ran
    const roomZero = dungeon.rooms[0];
    expect(roomZero.id).toBeDefined();
    expect(roomZero.description.length).toBeGreaterThan(10); // Merged theme/blueprint
    expect(roomZero.encounter).toBeDefined();

    // Randomly rolled an encounter from the forest/military tags
    expect(roomZero.encounter!.groups.length).toBeGreaterThan(0);

    // 5. Assert Treasure Subsystem ran
    expect(roomZero.treasure).toBeDefined();
  });
});
