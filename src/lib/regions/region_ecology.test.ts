import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { BiomeClassifications, type Environment } from '$lib/environment';
import { allSpecies } from '$lib/species';
import type { MapNode, RegionMap } from '$lib/map';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateHabitatFacts } from './region_habitats';
import { generateEcologyInhabitants } from './region_ecology';
import type { RegionEcologyCatalog } from './region_ecology_rule_types';

function node(
  id: number,
  biomeId = 'temperate deciduous forest',
  changes: Partial<MapNode> = {},
): MapNode {
  return {
    id,
    biomeId,
    neighbors: [],
    center: { x: id, y: 1 },
    polygon: { vertices: [], edges: [] },
    edges: [],
    corners: [],
    elevation: 0.2,
    moisture: 0.5,
    temperature: 18,
    isOcean: false,
    isWater: false,
    isCoast: false,
    ...changes,
  };
}
function fixture(nodes: MapNode[]) {
  const map: RegionMap = { nodes, edges: [], corners: [], width: 20, height: 20 };
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: nodes.map((n) => n.id).sort((a, b) => a - b),
  });
  const environment = {
    ecosystems: [],
    dominantEcosystem: { name: 'Empty', description: '', flora: [], fauna: [] },
  } as unknown as Environment;
  const region = { map, facts, environment };
  generateHabitatFacts(region, new RNG('habitat'));
  return region;
}
const wetBiome = {
  ...BiomeClassifications.getByName('flooded grassland'),
  vegetationTypes: ['reed'],
  faunaTypes: ['heron', 'crayfish'],
};
const wetCatalog: RegionEcologyCatalog = {
  biomes: [wetBiome],
  species: allSpecies.filter((species) =>
    ['heron', 'crayfish', "will o' the wisp"].includes(species.name),
  ),
};
function wetFixture() {
  const region = fixture([node(10, 'flooded grassland', { moisture: 0.8 })]);
  region.map.edges.push({
    id: 70,
    d0: 999,
    d1: 10,
    v0: 0,
    v1: 1,
    river: 2,
    midpoint: { x: 1, y: 1 },
  });
  return region;
}
function derive(
  region: ReturnType<typeof fixture>,
  catalog?: RegionEcologyCatalog,
  seed = 'ecology',
) {
  const before = structuredClone({
    map: region.map,
    habitats: region.facts.habitats,
    areas: region.facts.areas,
  });
  generateEcologyInhabitants(region, new RNG(seed), catalog);
  expect(regionFactsError(region.facts, region.map, [])).toBeNull();
  expect({ map: region.map, habitats: region.facts.habitats, areas: region.facts.areas }).toEqual(
    before,
  );
  return region.facts.ecologyInhabitants;
}

describe('regional inhabitants', () => {
  it('grounds wetland flora, fauna and optional fantasy life in the same wet river bank', () => {
    const region = wetFixture();
    const entries = derive(region, wetCatalog);
    expect(entries.map((entry) => entry.name).sort()).toEqual(
      ['crayfish', 'heron', 'reeds', "will o' the wisp"].sort(),
    );
    expect(entries.find((entry) => entry.name === 'reeds')).toMatchObject({
      source: { kind: 'described', label: 'reeds' },
      roles: ['producer'],
    });
    expect(entries.find((entry) => entry.name === 'heron')).toMatchObject({
      source: { kind: 'species', speciesName: 'heron' },
      roles: ['predator'],
    });
    expect(entries.find((entry) => entry.name === "will o' the wisp")).toMatchObject({
      category: 'fantastical',
      roles: ['other'],
    });
    expect(region.facts.ecologyRelationships).toEqual([]);
    for (const entry of entries) {
      expect(entry.habitatIds).toEqual(['habitat:biome:flooded%20grassland']);
      expect(entry.reason).toMatchObject({ status: 'current' });
      expect(entry.reason!.ruleId).toMatch(/^fantasy:region:ecology:.*:v1$/);
      expect(entry.reason!.sources).toContainEqual({
        kind: 'map-edge',
        edgeId: 70,
        property: 'river',
        observedValue: '2',
      });
      expect(entry.reason!.sources).toContainEqual({
        kind: 'map-node',
        nodeId: 10,
        property: 'temperature',
        observedValue: '18',
      });
    }
  });

  it('distinguishes warm arid, upland and wetland inhabitants using observed landforms', () => {
    const region = fixture([
      node(1, 'subtropical desert', { temperature: 30, moisture: 0.1, elevation: 0.1 }),
      node(2, 'subtropical desert', { temperature: 30, moisture: 0.1, elevation: 0.1 }),
      node(3, 'subtropical desert', { temperature: 30, moisture: 0.1, elevation: 0.1 }),
      node(9, 'alpine tundra', { temperature: 5, moisture: 0.3, elevation: 0.9 }),
    ]);
    const catalog = {
      species: allSpecies.filter((entry) => ['ibex', 'fennec fox'].includes(entry.name)),
      biomes: [
        {
          ...BiomeClassifications.getByName('subtropical desert'),
          faunaTypes: ['fennec fox'],
          vegetationTypes: ['cactus'],
        },
        {
          ...BiomeClassifications.getByName('alpine tundra'),
          faunaTypes: ['ibex'],
          vegetationTypes: ['grass'],
        },
      ],
    };
    const entries = derive(region, catalog);
    expect(entries.find((entry) => entry.name === 'ibex')).toMatchObject({
      roles: ['grazer'],
      habitatIds: ['habitat:biome:alpine%20tundra'],
    });
    expect(entries.find((entry) => entry.name === 'fennec fox')!.habitatIds).toEqual([
      'habitat:biome:subtropical%20desert',
    ]);
    expect(entries.some((entry) => entry.category === 'fantastical')).toBe(false);
    const flat = fixture([
      node(9, 'alpine tundra', { temperature: 5, moisture: 0.3, elevation: 0.9 }),
    ]);
    expect(derive(flat, catalog).some((entry) => entry.name === 'ibex')).toBe(false);
  });

  it('cannot use biome or regional climate labels to override contradictory local observations', () => {
    const region = wetFixture();
    region.map.nodes[0].moisture = 0.1;
    region.environment.climate = { humidity: 1 } as Environment['climate'];
    expect(derive(region, wetCatalog)).toEqual([]);
    const split = fixture([
      node(1, 'flooded grassland', { temperature: -20, moisture: 0.8 }),
      node(2, 'flooded grassland', { temperature: 20, moisture: 0.1 }),
    ]);
    expect(derive(split, wetCatalog)).toEqual([]);
  });

  it('requires water at the supporting patch and never populates open-water habitats', () => {
    const dry = wetFixture();
    dry.map.edges = [];
    expect(derive(dry, wetCatalog)).toEqual([]);
    const disconnected = fixture([
      node(1, 'flooded grassland', { moisture: 0.8 }),
      node(2, 'flooded grassland', { moisture: 0.1 }),
    ]);
    disconnected.map.edges.push({ id: 1, d0: 2, v0: 0, v1: 1, river: 1, midpoint: { x: 2, y: 1 } });
    expect(derive(disconnected, wetCatalog)).toEqual([]);
    const water = fixture([
      node(1, 'flooded grassland', { isWater: true, moisture: 0.8 }),
      node(2, 'ocean', { isOcean: true }),
    ]);
    expect(derive(water)).toEqual([]);
    const aquatic = fixture([node(1, 'freshwater lake', { moisture: 0.8 })]);
    expect(derive(aquatic)).toEqual([]);
  });

  it('supports freshwater lake margins and proven coastal land margins without inventing tides', () => {
    const lake = fixture([
      node(1, 'flooded grassland', { moisture: 0.8, neighbors: [2] }),
      node(2, 'lake', { isWater: true }),
    ]);
    expect(derive(lake, wetCatalog).some((entry) => entry.name === 'heron')).toBe(true);
    const coast = fixture([
      node(1, 'mangrove forest', {
        elevation: 0.05,
        temperature: 25,
        moisture: 0.8,
        isCoast: true,
        neighbors: [2],
      }),
      node(2, 'ocean', { isOcean: true }),
    ]);
    const catalog = {
      species: allSpecies.filter((entry) => entry.name === 'crab'),
      biomes: [
        {
          ...BiomeClassifications.getByName('mangrove forest'),
          faunaTypes: ['crab'],
          vegetationTypes: [],
        },
      ],
    };
    expect(derive(coast, catalog).map((entry) => entry.name)).toEqual(['crab']);
    const unsupported = fixture([
      node(1, 'mangrove forest', {
        elevation: 0.05,
        temperature: 25,
        moisture: 0.8,
        isCoast: true,
      }),
    ]);
    expect(derive(unsupported, catalog)).toEqual([]);
  });

  it('merges repeated occurrences, ranks only major habitats and enforces category caps', () => {
    const nodes = [
      'temperate deciduous forest',
      'temperate rainforest',
      'boreal forest',
      'mediterranean woodland',
      'tropical rainforest',
    ].flatMap((biome, index) =>
      Array.from({ length: 5 - index }, (_, offset) =>
        node(index * 10 + offset, biome, {
          temperature: biome === 'tropical rainforest' ? 25 : 12,
          moisture:
            biome === 'temperate rainforest' || biome === 'tropical rainforest' ? 0.85 : 0.5,
        }),
      ),
    );
    const entries = derive(fixture(nodes));
    expect(entries.length).toBeLessThanOrEqual(20);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    expect(entries.filter((entry) => entry.category === 'fantastical').length).toBeLessThanOrEqual(
      2,
    );
    expect(entries.some((entry) => entry.habitatIds.length > 1)).toBe(true);
    expect(
      entries.some((entry) => entry.habitatIds.includes('habitat:biome:tropical%20rainforest')),
    ).toBe(false);
    for (const habitat of new Set(entries.flatMap((entry) => entry.habitatIds))) {
      const occurrences = entries.filter((entry) => entry.habitatIds.includes(habitat));
      expect(occurrences.filter((entry) => entry.category === 'flora').length).toBeLessThanOrEqual(
        2,
      );
      expect(occurrences.filter((entry) => entry.category !== 'flora').length).toBeLessThanOrEqual(
        3,
      );
      expect(
        occurrences.filter((entry) => entry.category === 'fantastical').length,
      ).toBeLessThanOrEqual(1);
    }
  });

  it('is reproducible across graph, habitat and catalog ordering and varies with selection seed', () => {
    const before = fixture([node(1), node(2)]);
    const expected = derive(before);
    const shuffled = fixture([node(2), node(1)]);
    shuffled.facts.habitats.reverse();
    const catalog = {
      species: [...allSpecies].reverse(),
      biomes: [...BiomeClassifications.getAll()].reverse().map((entry) => ({
        ...entry,
        faunaTypes: [...entry.faunaTypes].reverse(),
        vegetationTypes: [...entry.vegetationTypes].reverse(),
      })),
    };
    expect(derive(shuffled, catalog)).toEqual(expected);
    expect(derive(fixture([node(1), node(2)]))).toEqual(expected);
    const outputs = ['one', 'two', 'three'].map((seed) =>
      JSON.stringify(derive(fixture([node(1)]), undefined, seed)),
    );
    expect(new Set(outputs).size).toBeGreaterThan(1);
  });

  it('uses ecosystem strings only with independent suitability and records the saved observation', () => {
    const region = wetFixture();
    region.environment.ecosystems = [
      {
        name: 'Authored',
        description: 'anything',
        flora: ['reed', 'alien parasite'],
        fauna: ['heron', 'dolphin'],
      },
    ];
    const entries = derive(region, wetCatalog);
    expect(entries.find((entry) => entry.name === 'heron')!.reason!.sources).toContainEqual({
      kind: 'environment',
      field: 'ecosystems',
      observedValue: JSON.stringify(region.environment.ecosystems),
    });
    expect(entries.some((entry) => ['alien parasite', 'dolphin'].includes(entry.name))).toBe(false);
  });

  it('handles absent catalogs, unknown labels and missing species metadata conservatively', () => {
    expect(derive(wetFixture(), { species: [], biomes: [] })).toEqual([]);
    const sparse = {
      biomes: [wetBiome],
      species: wetCatalog.species.map((entry) => ({ ...entry, environments: [] })),
    };
    expect(derive(wetFixture(), sparse).map((entry) => entry.name)).toEqual(['reeds']);
    const custom = {
      species: [],
      biomes: [
        {
          ...BiomeClassifications.getByName('temperate deciduous forest'),
          vegetationTypes: ['unknown plant'],
          faunaTypes: ['unknown beetle'],
        },
      ],
    };
    const entries = derive(fixture([node(1)]), custom);
    expect(entries.map((entry) => entry.name).sort()).toEqual(['unknown beetle', 'unknown plant']);
    expect(
      entries.every((entry) => entry.roles[0] === 'other' && entry.source.kind === 'described'),
    ).toBe(true);
    expect(derive(fixture([]))).toEqual([]);
    expect(derive(fixture([node(1, 'unknown biome')]))).toEqual([]);
  });
});
