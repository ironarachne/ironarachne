import { describe, it, expect } from 'vitest';
import { buildTheme, BLUEPRINTS } from './theme';
import type Environment from '../../environment/environment.js';

describe('Theme Configuration Subsystem', () => {
  // Stub a mock environment mimicking the existing ironarachne structure
  const mockDesertEnvironment: Environment = {
    biome: {
      name: 'desert',
      temperature: 40,
      altitude: 100,
      humidity: 5,
      isAquatic: false,
      descriptions: ['A wasteland of blistering sand.'],
      features: ['dunes'],
    },
    climate: {
      name: 'arid',
      temperature: 80,
      humidity: 5,
      descriptions: ['Hot and dry.'],
      adjective: 'arid'
    },
    terrain: { name: 'plains', isWater: false },
    waterSystem: { name: 'oasis' },
    dominantEcosystem: { name: 'desert' },
    ecosystems: [],
    description: 'A harsh desert environment.'
  } as unknown as Environment;

  it('should build a formatted theme name correctly fusing Biome and Blueprint', () => {
    const theme = buildTheme(mockDesertEnvironment, 'Tomb');
    expect(theme.name).toBe('Desert Tomb');
  });

  it('should aggregate tags to pass off to external generators', () => {
    const theme = buildTheme(mockDesertEnvironment, 'Stronghold');

    // Includes the core blueprint tags
    expect(theme.encounterTags).toContain('humanoid');
    expect(theme.encounterTags).toContain('military');

    // Also embeds the Biome natural string as a queryable tag!
    expect(theme.encounterTags).toContain('desert');
  });

  it('should throw an error on an unknown blueprint request', () => {
    expect(() => {
      buildTheme(mockDesertEnvironment, 'NonExistentFakeBlueprint');
    }).toThrowError(/Unknown Dungeon Blueprint/);
  });

  it('should expose appropriate layout hints depending on the blueprint type', () => {
    const caverns = buildTheme(mockDesertEnvironment, 'Natural Caverns');

    // Caverns should be organic blobs
    expect(caverns.blueprint.allowedRoomStyles).toContain('blob');
    expect(caverns.blueprint.allowedRoomStyles).not.toContain('rectangle');

    // Caverns shouldn't have high structural door density
    expect(caverns.blueprint.doorOptions.doorDensity).toBeLessThan(0.5);
  });
});
