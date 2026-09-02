import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Names from '$lib/names';
import { generate, getDefaultConfig } from './regions';
import * as SettlementTiles from './settlement_tiles';
import * as TerrainTiles from './terrain_tiles';
import type RegionGeneratorConfig from './region_generator_config';

// Region generation builds a whole map graph, so keep the map small and the realm count low.
function configFor(seed: string, overrides: Partial<RegionGeneratorConfig> = {}) {
  const rng = new RNG(seed);

  return {
    nameGeneratorSet: Names.getFantasyNameGeneratorSet('human', rng),
    dominantCulture: null,
    mapWidth: 12,
    mapHeight: 10,
    minRealms: 1,
    maxRealms: 2,
    rng,
    ...overrides,
  } satisfies RegionGeneratorConfig;
}

describe('getDefaultConfig', () => {
  it('defaults to a 40 by 30 map', () => {
    const config = getDefaultConfig(new RNG('base-seed'));

    expect(config.mapWidth).toBe(40);
    expect(config.mapHeight).toBe(30);
  });

  it('defaults to between two and four neighbouring realms', () => {
    const config = getDefaultConfig(new RNG('base-seed'));

    expect(config.minRealms).toBe(2);
    expect(config.maxRealms).toBe(4);
  });

  it('starts with no dominant culture, so the name generator set is used instead', () => {
    expect(getDefaultConfig(new RNG('base-seed')).dominantCulture).toBeNull();
  });

  it('supplies a name generator set and an RNG', () => {
    const config = getDefaultConfig(new RNG('base-seed'));

    expect(config.nameGeneratorSet.country).toBeDefined();
    expect(config.rng).toBeInstanceOf(RNG);
  });
});

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(configFor('region')).name).toBe(generate(configFor('region')).name);
  });

  it('produces different regions for different seeds', () => {
    const names = new Set(
      Array.from({ length: 5 }, (_, index) => generate(configFor(`vary-${index}`)).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('names the region after its main realm', () => {
    const region = generate(configFor('named'));

    expect(region.name).toBe(region.realms[region.mainRealm].name);
  });

  it('takes its authority from the main realm', () => {
    const region = generate(configFor('authority'));

    expect(region.authority).toBe(region.realms[region.mainRealm].authority);
  });

  it('makes the first realm the main realm', () => {
    expect(generate(configFor('main')).mainRealm).toBe(0);
  });

  it('generates a map with nodes', () => {
    const region = generate(configFor('map'));

    expect(region.map).toBeDefined();
    expect(Object.keys(region.map).length).toBeGreaterThan(0);
  });

  it('describes the region with its environment description', () => {
    const region = generate(configFor('described'));

    expect(region.description).toBe(region.environment.description);
    expect(region.description).toBeTruthy();
  });

  it('generates at least one settlement', () => {
    const region = generate(configFor('settled'));

    expect(region.settlements.length).toBeGreaterThan(0);
    for (const settlement of region.settlements) {
      expect(settlement.name).toBeTruthy();
    }
  });

  it('generates between one and three organizations', () => {
    const region = generate(configFor('orgs'));

    expect(region.organizations.length).toBeGreaterThanOrEqual(1);
    expect(region.organizations.length).toBeLessThanOrEqual(3);
  });

  it('generates at least as many realms as the configured minimum, plus the main realm', () => {
    const region = generate(configFor('realms', { minRealms: 2, maxRealms: 2 }));

    expect(region.realms.length).toBeGreaterThanOrEqual(3);
  });

  it('gives every non-standalone realm a parent inside the region', () => {
    for (let index = 0; index < 5; index++) {
      const region = generate(configFor(`parents-${index}`));

      for (const realm of region.realms) {
        if (!realm.realmType.isStandalone && realm.parent !== -1) {
          expect(realm.parent).toBeGreaterThanOrEqual(0);
          expect(realm.parent).toBeLessThan(region.realms.length);
        }
      }
    }
  });

  it('prefers a dominant culture name generator set over the config one', () => {
    const rng = new RNG('cultured');
    const cultureNameGenerators = Names.getFantasyNameGeneratorSet('dwarf', rng);
    const config = configFor('cultured', {
      dominantCulture: {
        nameGenerators: cultureNameGenerators,
      } as unknown as RegionGeneratorConfig['dominantCulture'],
    });

    const region = generate(config);

    expect(region.dominantCulture?.nameGenerators).toBe(cultureNameGenerators);
  });
});

describe('settlement tiles', () => {
  it('numbers settlement sizes from village up to capital', () => {
    expect(SettlementTiles.VILLAGE).toBe(0);
    expect(SettlementTiles.TOWN).toBe(1);
    expect(SettlementTiles.CITY).toBe(2);
    expect(SettlementTiles.CAPITAL).toBe(3);
  });

  it('gives each settlement size a distinct value', () => {
    const values = [
      SettlementTiles.VILLAGE,
      SettlementTiles.TOWN,
      SettlementTiles.CITY,
      SettlementTiles.CAPITAL,
    ];

    expect(new Set(values).size).toBe(values.length);
  });
});

describe('terrain tiles', () => {
  it('starts terrain at water', () => {
    expect(TerrainTiles.WATER).toBe(0);
  });

  it('gives each terrain a distinct value', () => {
    const values = [
      TerrainTiles.WATER,
      TerrainTiles.GRASSLAND,
      TerrainTiles.HILLS,
      TerrainTiles.MOUNTAINS,
      TerrainTiles.DESERT,
      TerrainTiles.TUNDRA,
      TerrainTiles.SWAMP,
      TerrainTiles.FOREST,
      TerrainTiles.JUNGLE,
    ];

    expect(new Set(values).size).toBe(values.length);
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
