import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { BiomeClassifications, type Environment } from '$lib/environment';
import { allSpecies } from '$lib/species';
import type { MapNode, RegionMap } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import type Region from './region';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateHabitatFacts } from './region_habitats';
import { generateEcologyRelationships, ecologyHarvestRisks } from './region_ecology_relationships';
import { generateNotableFacts } from './region_notables';
import type { SettlementRoleFact } from './region_fact_types';
import type { EcologyInhabitantFact } from './region_ecology_types';
import type { EcologyRelationshipRegion } from './region_ecology_relationship_types';
import type { RegionEcologyCatalog } from './region_ecology_rule_types';

function node(id: number, biomeId = 'flooded grassland', changes: Partial<MapNode> = {}): MapNode {
  return {
    id,
    biomeId,
    neighbors: [],
    center: { x: id, y: 1 },
    polygon: { vertices: [], edges: [] },
    edges: [],
    corners: [],
    elevation: 0.2,
    moisture: 0.8,
    temperature: 20,
    isOcean: false,
    isWater: false,
    isCoast: false,
    ...changes,
  };
}
function fixture(nodes: MapNode[] = [node(10)]): EcologyRelationshipRegion {
  const map: RegionMap = { width: 40, height: 30, nodes, edges: [], corners: [] };
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: nodes
      .filter((node) => !node.isWater && !node.isOcean)
      .map((node) => node.id)
      .sort((a, b) => a - b),
  });
  const region = {
    map,
    facts,
    settlements: [],
    settlementIds: [],
    environment: {
      ecosystems: [],
      dominantEcosystem: { name: '', description: '', flora: [], fauna: [] },
      climate: { seasons: [], temperature: 20, humidity: 0.8 },
    } as unknown as Environment,
  };
  generateHabitatFacts(region, new RNG('habitat'));
  return region;
}
function river(region: EcologyRelationshipRegion, nodeId = 10) {
  region.map.edges.push({
    id: 77 + region.map.edges.length,
    d0: nodeId,
    v0: 0,
    v1: 1,
    river: 2,
    midpoint: { x: 1, y: 1 },
  });
}
function inhabitant(
  region: EcologyRelationshipRegion,
  name: string,
  roles: EcologyInhabitantFact['roles'],
  category: EcologyInhabitantFact['category'] = 'fauna',
  habitatId = region.facts!.habitats[0].id,
) {
  const entry: EcologyInhabitantFact = {
    id: `inhabitant:${name}`,
    name,
    description: 'Saved occurrence',
    origin: 'authored',
    category,
    roles,
    source:
      category === 'flora'
        ? { kind: 'described', label: name }
        : { kind: 'species', speciesName: name },
    habitatIds: [habitatId],
  };
  region.facts!.ecologyInhabitants.push(entry);
  return entry;
}
function settlement(region: EcologyRelationshipRegion, nodeId: number, rule = 'river-settlement') {
  const id = `settlement:${region.settlements.length + 1}`;
  region.settlements.push({ name: 'A town', mapNodeId: nodeId } as Settlement);
  region.settlementIds!.push(id);
  const role: SettlementRoleFact = {
    id: `role:site:${id}`,
    name: 'Site',
    description: 'Saved access',
    origin: 'generated' as const,
    settlement: { kind: 'embedded' as const, settlementId: id },
    areaIds: ['area:land'],
    anchor: { nodeIds: [nodeId], edgeIds: [] },
    reason: {
      ruleId: `fantasy:region:${rule}:v1`,
      status: 'current' as const,
      sources: [
        { kind: 'map-node' as const, nodeId, property: 'isWater' as const, observedValue: 'false' },
      ],
    },
  };
  region.facts!.settlementRoles.push(role);
  return role;
}
function derive(
  region: EcologyRelationshipRegion,
  seed = 'relationships',
  catalog?: RegionEcologyCatalog,
) {
  const before = structuredClone(region);
  generateEcologyRelationships(region, new RNG(seed), catalog);
  expect({
    ...region,
    facts: { ...region.facts, ecologyRelationships: before.facts!.ecologyRelationships },
  }).toEqual(before);
  expect(
    regionFactsError(
      region.facts,
      region.map,
      region.settlementIds!.map((id) => ({ id, snapshot: {} as never })),
    ),
  ).toBeNull();
  for (const entry of region.facts!.ecologyRelationships) {
    expect(entry.reason?.status).toBe('current');
    expect(entry.reason!.ruleId).toMatch(/^fantasy:region:ecology:.*:v1$/);
    for (const source of entry.reason!.sources) {
      if (source.kind === 'map-node')
        expect(source.observedValue).toBe(
          String(region.map.nodes.find((node) => node.id === source.nodeId)![source.property]),
        );
      if (source.kind === 'map-edge')
        expect(source.observedValue).toBe(
          String(region.map.edges.find((edge) => edge.id === source.edgeId)![source.property]),
        );
    }
  }
  return region.facts!.ecologyRelationships;
}
function wetFixture() {
  const region = fixture();
  river(region);
  inhabitant(region, 'heron', ['predator']);
  inhabitant(region, 'crayfish', ['scavenger']);
  return region;
}
function browseFixture(temperature = 5) {
  const region = fixture([node(10, 'temperate grassland', { moisture: 0.4, temperature })]);
  inhabitant(region, 'deer', ['grazer']);
  inhabitant(region, 'grass', ['producer'], 'flora');
  return region;
}

describe('bounded ecological relationships', () => {
  it('connects herons and crayfish using recorded shared-bank evidence and saved names', () => {
    const region = wetFixture();
    region.facts!.ecologyInhabitants[0].name = 'Silver herons';
    const [entry] = derive(region);
    expect(entry.relation).toEqual({ kind: 'feeds-on', targetId: 'inhabitant:crayfish' });
    expect(entry.subjectId).toBe('inhabitant:heron');
    expect(entry.description).toContain('Food for Silver herons: crayfish');
    expect(entry.reason!.sources).toContainEqual({ kind: 'fact', factId: 'inhabitant:crayfish' });
    expect(entry.reason!.sources).toContainEqual({
      kind: 'map-edge',
      edgeId: 77,
      property: 'river',
      observedValue: '2',
    });
    expect(entry.reason!.sources).toContainEqual({
      kind: 'map-node',
      nodeId: 10,
      property: 'biomeId',
      observedValue: 'flooded grassland',
    });
  });

  it('omits absent food, unknown niches and unsupported fantasy diets', () => {
    const region = wetFixture();
    region.facts!.ecologyInhabitants.pop();
    inhabitant(region, "will o' the wisp", ['other'], 'fantastical');
    expect(derive(region)).toEqual([]);
    const unspecified = wetFixture();
    unspecified.facts!.ecologyInhabitants[0].roles = ['other'];
    expect(derive(unspecified)).toEqual([]);
    const missing = wetFixture();
    missing.facts!.ecologyInhabitants[1].source = {
      kind: 'species',
      speciesName: 'unavailable species',
    };
    expect(derive(missing)).toEqual([]);
    expect(derive(wetFixture(), 'empty', { species: [], biomes: [] })).toEqual([]);
  });

  it('does not mistake membership in a disconnected habitat for a common suitable cell', () => {
    const region = fixture([
      node(10, 'temperate deciduous forest', { moisture: 0.5, temperature: 18 }),
      node(20, 'temperate grassland', { moisture: 0.4, temperature: 34 }),
    ]);
    const habitat = region.facts!.habitats.find(
      (entry) => entry.name === 'temperate deciduous forest',
    )!;
    habitat.anchor!.nodeIds = [10, 20];
    // Deer support the cool forest cell; grass supports the hot grassland cell. Both live IDs
    // reference this authored mixed habitat, but no cell supports the explicit feeding pair.
    inhabitant(region, 'deer', ['grazer'], 'fauna', habitat.id);
    inhabitant(region, 'grass', ['producer'], 'flora', habitat.id);
    expect(derive(region)).toEqual([]);
    const split = wetFixture();
    split.map.nodes.push(node(20, 'flooded grassland', { moisture: 0.1 }));
    split.facts!.habitats[0].anchor!.nodeIds.push(20);
    split.map.edges[0].d0 = 20;
    expect(derive(split)).toEqual([]);
  });

  it('qualifies cold browse only with a valid named cooling period and observed local cold', () => {
    const region = browseFixture();
    region.environment.climate.seasons = [
      {
        name: 'winter',
        startDay: 364,
        endDay: 90,
        temperatureAdjustment: -0.1,
        humidityAdjustment: -0.1,
      },
    ];
    const [entry] = derive(region);
    expect(entry.description).toContain('During winter, cold conditions');
    expect(entry.reason!.sources).toContainEqual({
      kind: 'environment',
      field: 'climate',
      observedValue: JSON.stringify(region.environment.climate),
    });
    expect(entry.reason!.sources).toContainEqual({
      kind: 'map-node',
      nodeId: 10,
      property: 'temperature',
      observedValue: '5',
    });
    const empty = derive(browseFixture())[0];
    expect(empty.description).not.toContain('During');
    expect(
      empty.reason!.sources.some(
        (source) => source.kind === 'environment' && source.field === 'climate',
      ),
    ).toBe(false);
    const warm = browseFixture(18);
    warm.environment.climate.seasons = region.environment.climate.seasons;
    expect(derive(warm)[0].description).not.toContain('During');
    const invalid = browseFixture();
    invalid.environment.climate.seasons = [
      { ...region.environment.climate.seasons[0], name: '' },
      { ...region.environment.climate.seasons[0], startDay: 0 },
      { ...region.environment.climate.seasons[0], temperatureAdjustment: NaN },
      { ...region.environment.climate.seasons[0], temperatureAdjustment: 0.1 },
    ];
    expect(derive(invalid)[0].description).not.toContain('During');
  });

  it('never derives a flood, migration, recurring breeding event or diet from seasonal names alone', () => {
    const region = wetFixture();
    region.environment.climate.seasons = [
      {
        name: 'flood and migration season',
        startDay: 10,
        endDay: 50,
        temperatureAdjustment: 0,
        humidityAdjustment: 0.9,
      },
    ];
    expect(derive(region)[0].description).not.toMatch(
      /flood and migration season|annual flood|breeding/,
    );
  });

  it('grounds ibex grazing in a shared rocky upland cell with represented grass', () => {
    const region = fixture([
      node(1, 'subtropical desert', { elevation: 0.1, temperature: 25, moisture: 0.1 }),
      node(2, 'subtropical desert', { elevation: 0.1, temperature: 25, moisture: 0.1 }),
      node(10, 'alpine tundra', { elevation: 0.9, temperature: 5, moisture: 0.3 }),
    ]);
    const upland = region.facts!.habitats.find((entry) => entry.name === 'alpine tundra')!.id;
    inhabitant(region, 'ibex', ['grazer'], 'fauna', upland);
    inhabitant(region, 'grass', ['producer'], 'flora', upland);
    const catalog = {
      species: allSpecies,
      biomes: BiomeClassifications.getAll().map((entry) =>
        entry.name === 'alpine tundra' ? { ...entry, vegetationTypes: ['grass'] } : entry,
      ),
    };
    expect(derive(region, 'upland', catalog)[0].reason!.ruleId).toContain('ibex-grazing');
    region.facts!.ecologyRelationships = [];
    region.map.nodes[2].elevation = 0.1;
    expect(derive(region, 'upland', catalog)).toEqual([]);
  });

  it('records reed use through an existing settlement site in a connected accessible patch', () => {
    const region = fixture([
      node(10, 'flooded grassland', { neighbors: [20], moisture: 0.1 }),
      node(20, 'flooded grassland', { neighbors: [10] }),
    ]);
    river(region, 20);
    const plant = inhabitant(region, 'reeds', ['producer'], 'flora');
    const role = settlement(region, 10);
    const [entry] = derive(region);
    expect(entry.relation).toEqual({
      kind: 'used-by',
      settlement: role.settlement,
      use: 'material',
    });
    expect(entry.subjectId).toBe(plant.id);
    expect(entry.description).toContain('woven mats and basketry');
    expect(entry.reason!.sources).toContainEqual({ kind: 'fact', factId: role.id });
    expect(entry.reason!.sources).toContainEqual({
      kind: 'map-node',
      nodeId: 20,
      property: 'moisture',
      observedValue: '0.8',
    });
    region.facts!.ecologyRelationships = [];
    region.map.nodes[0].neighbors = [];
    region.map.nodes[1].neighbors = [];
    expect(derive(region)).toEqual([]);
  });

  it('rejects missing, stale, generic, artifact-only and water settlement access', () => {
    for (const change of ['missing', 'stale', 'generic', 'artifact', 'water', 'anchor'] as const) {
      const region = fixture();
      river(region);
      inhabitant(region, 'reeds', ['producer'], 'flora');
      const role = settlement(region, 10);
      if (change === 'missing') {
        region.settlements = [];
        region.settlementIds = [];
        region.facts!.settlementRoles = [];
      }
      if (change === 'stale') role.reason!.status = 'stale';
      if (change === 'generic') role.reason!.ruleId = 'fantasy:region:land-placement:v1';
      if (change === 'artifact') role.settlement = { kind: 'artifact', targetId: 'outside' };
      if (change === 'water') region.map.nodes[0].isWater = true;
      if (change === 'anchor') role.anchor.nodeIds = [];
      expect(derive(region), change).toEqual([]);
    }
  });

  it('caps relationships at two per major habitat and six overall with stable IDs and ordering', () => {
    const biomes = [
      'temperate deciduous forest',
      'temperate rainforest',
      'montane forest',
      'boreal forest',
    ];
    const region = fixture(
      biomes.map((biome, index) =>
        node(index + 1, biome, {
          elevation: biome === 'montane forest' ? 0.6 : 0.2,
          moisture: biome === 'temperate rainforest' ? 0.8 : 0.5,
          temperature: 10,
        }),
      ),
    );
    for (const habitat of region.facts!.habitats) {
      for (const name of ['deer', 'rabbit']) {
        const entry = inhabitant(region, name, ['grazer'], 'fauna', habitat.id);
        entry.id += `:${habitat.id}`;
      }
      for (const label of ['grass', 'clover', 'oak tree']) {
        const entry = inhabitant(region, label, ['producer'], 'flora', habitat.id);
        entry.id += `:${habitat.id}`;
      }
    }
    const catalog = {
      species: allSpecies,
      biomes: BiomeClassifications.getAll().map((entry) => ({
        ...entry,
        vegetationTypes: ['grass', 'clover', 'oak tree'],
      })),
    };
    const before = structuredClone(region);
    const entries = derive(region, 'capped', catalog);
    expect(entries).toHaveLength(6);
    for (const habitat of region.facts!.habitats)
      expect(
        entries.filter((entry) => entry.habitatIds.includes(habitat.id)).length,
      ).toBeLessThanOrEqual(2);
    const reversed = structuredClone(before);
    reversed.map.nodes.reverse();
    reversed.facts!.habitats.reverse();
    reversed.facts!.ecologyInhabitants.reverse();
    reversed.facts!.areas.reverse();
    reversed.facts!.settlementRoles.reverse();
    expect(
      derive(reversed, 'capped', {
        species: [...catalog.species].reverse(),
        biomes: [...catalog.biomes].reverse(),
      }),
    ).toEqual(entries);
    expect(derive(structuredClone(before), 'capped', catalog)).toEqual(entries);
    expect(derive(structuredClone(before), 'different', catalog)).not.toEqual(entries);
  });

  it('omits stale inhabitants and preserves renamed identity without executing payload data', () => {
    const region = wetFixture();
    region.facts!.ecologyInhabitants[0].reason = {
      ruleId: 'fantasy:custom:ignored',
      status: 'stale',
      sources: [{ kind: 'fact', factId: 'missing' }],
    };
    expect(derive(region)).toEqual([]);
    region.facts!.ecologyInhabitants[0].reason.status = 'current';
    region.facts!.ecologyInhabitants[0].reason.sources = [
      { kind: 'fact', factId: region.facts!.habitats[0].id },
    ];
    expect(derive(region)[0].subjectId).toBe('inhabitant:heron');
    region.facts!.ecologyRelationships = [];
    region.facts!.habitats[0].reason!.status = 'stale';
    expect(derive(region)).toEqual([]);
  });
});

describe('ecological gathering hazards', () => {
  it('reuses a saved material-use relation and an explicit crocodilian overlap, with no danger from a wisp or heron', () => {
    const region = fixture();
    river(region);
    settlement(region, 10);
    inhabitant(region, 'reeds', ['producer'], 'flora');
    const danger = inhabitant(region, 'alligator', ['predator']);
    inhabitant(region, "will o' the wisp", ['other'], 'fantastical');
    const [use] = derive(region);
    const risks = ecologyHarvestRisks(region);
    expect(risks).toHaveLength(1);
    expect(risks[0].sources).toContainEqual({ kind: 'fact', factId: use.id });
    expect(risks[0].sources).toContainEqual({ kind: 'fact', factId: danger.id });
    generateNotableFacts(region as Region, new RNG('hazards'));
    const hazard = region.facts!.notables.find(
      (entry) => entry.reason!.ruleId === 'fantasy:region:ecology-bank-gathering:v1',
    )!;
    expect(hazard.description).toContain('alligator');
    expect(hazard.description).toContain('Hook:');
    expect(hazard.anchor!.nodeIds).toEqual([10]);
    expect(hazard.reason!.sources).toContainEqual({ kind: 'fact', factId: use.id });
    use.reason!.status = 'stale';
    expect(ecologyHarvestRisks(region)).toEqual([]);
    use.reason!.status = 'current';
    danger.source = { kind: 'species', speciesName: 'heron' };
    expect(ecologyHarvestRisks(region)).toEqual([]);
  });

  it('omits unsupported or unreachable gathering dangers instead of treating all predators as hazards', () => {
    const region = fixture();
    river(region);
    const role = settlement(region, 10);
    inhabitant(region, 'reeds', ['producer'], 'flora');
    inhabitant(region, 'crocodile', ['predator']);
    derive(region);
    expect(ecologyHarvestRisks(region)).toHaveLength(1);
    role.reason!.status = 'stale';
    expect(ecologyHarvestRisks(region)).toEqual([]);
    role.reason!.status = 'current';
    region.map.edges = [];
    expect(ecologyHarvestRisks(region)).toEqual([]);
  });
});
