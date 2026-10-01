import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { BiomeClassifications, Terrain, type Environment } from '$lib/environment';
import { allSpecies } from '$lib/species';
import { getGeologicalResources, getBuildingMaterialResources } from '$lib/resources';
import type { MapNode } from '$lib/map';
import type Region from './region';
import type { RegionSnapshot } from './region_snapshot';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateGeologyFacts } from './region_geology';
import { generateResourceFacts } from './region_resources';
import { generateHabitatFacts } from './region_habitats';
import { generateEcologyInhabitants } from './region_ecology';
import { setRegionResourceFactText, removeRegionResourceFact } from './region_resource_editing';
import type { RegionResourceCatalog } from './region_resource_rule_types';

const catalog: RegionResourceCatalog = {
  geology: getGeologicalResources(),
  ecology: { species: allSpecies, biomes: BiomeClassifications.getAll() },
  buildingMaterials: getBuildingMaterialResources(),
};
function node(id: number, changes: Partial<MapNode> = {}): MapNode {
  return {
    id,
    center: { x: id, y: 0 },
    neighbors: [],
    polygon: { vertices: [], edges: [] },
    edges: [],
    corners: [],
    biomeId: 'temperate deciduous forest',
    elevation: 0.2,
    temperature: 20,
    moisture: 0.6,
    isWater: false,
    isOcean: false,
    isCoast: false,
    ...changes,
  };
}
function fixture(): Pick<Region, 'map' | 'facts' | 'environment'> {
  const nodes = [node(1), node(2), node(3), node(4)];
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: nodes.map((entry) => entry.id),
  });
  return {
    map: { width: 10, height: 10, nodes, edges: [], corners: [] },
    facts,
    environment: {
      terrain: {
        geologicalMakeup: { rockTypes: [...Terrain.possibleRocks], soilTypes: ['loam', 'gravel'] },
      },
      ecosystems: [],
      dominantEcosystem: { name: '', description: '', flora: [], fauna: [] },
      climate: { seasons: [] },
    } as unknown as Environment,
  };
}
function prepared(seed = 'geology') {
  const region = fixture();
  generateGeologyFacts(region, new RNG(seed));
  return region;
}

describe('regional geology and raw inventory', () => {
  it('covers each land node once, preserves physical geography and ignores equivalent ordering', () => {
    const region = fixture();
    const original = structuredClone(region.map);
    generateGeologyFacts(region, new RNG('same'));
    expect(region.facts!.geology.flatMap((entry) => entry.anchor.nodeIds).sort()).toEqual([
      1, 2, 3, 4,
    ]);
    expect(region.map).toEqual(original);
    const reordered = fixture();
    reordered.map.nodes.reverse();
    reordered.environment.terrain.geologicalMakeup.rockTypes.reverse();
    generateGeologyFacts(reordered, new RNG('same'));
    expect(reordered.facts!.geology).toEqual(region.facts!.geology);
    const empty = fixture();
    empty.map.nodes = [];
    generateGeologyFacts(empty, new RNG('same'));
    expect(empty.facts!.geology).toEqual([]);
    const noArea = fixture();
    noArea.facts!.areas = [];
    generateGeologyFacts(noArea, new RNG('same'));
    expect(noArea.facts!.geology).toEqual([]);
  });
  it('generates positive examples of all geological categories, including oil and gas, with valid saved evidence', () => {
    const kinds = new Set<string>();
    const stones = new Set<string>();
    let trace = false;
    let rich = false;
    for (let i = 0; i < 600; i++) {
      const region = prepared(`geo:${i}`);
      generateResourceFacts(region, new RNG(`resources:${i}`));
      expect(regionFactsError(region.facts, region.map, [])).toBeNull();
      expect(region.facts!.resourceDeposits.length).toBeLessThanOrEqual(12);
      expect(region.facts!.resources.length).toBeLessThanOrEqual(39);
      for (const fact of region.facts!.resources.filter((entry) =>
        ['available', 'limited'].includes(entry.availability),
      )) {
        if (fact.depositIds.length) kinds.add(fact.kind);
        if (fact.kind === 'stone') stones.add(fact.name);
        expect(fact.reason!.sources.length).toBeGreaterThan(0);
        for (const id of fact.depositIds) {
          const deposit = region.facts!.resourceDeposits.find((entry) => entry.id === id)!;
          expect(deposit.concentration).not.toBe('trace');
          if (fact.kind === 'oil' || fact.kind === 'gas') {
            expect(deposit.extraction).toBe('drilling');
            expect(deposit.exposure).not.toBe('surface');
          }
        }
      }
      trace ||= region.facts!.resourceDeposits.some((entry) => entry.concentration === 'trace');
      rich ||= region.facts!.resourceDeposits.some((entry) => entry.concentration === 'rich');
    }
    expect(kinds).toEqual(
      new Set(['ore', 'gemstone', 'stone', 'geological-material', 'oil', 'gas']),
    );
    expect(stones.size).toBeGreaterThanOrEqual(6);
    expect(trace && rich).toBe(true);
  });
  it('repeats full facts and is stable under shuffled maps and catalogs', () => {
    const a = prepared();
    const b = prepared();
    b.map.nodes.reverse();
    b.facts!.geology.reverse();
    generateResourceFacts(a, new RNG('same'), catalog);
    generateResourceFacts(b, new RNG('same'), {
      ...catalog,
      geology: [...catalog.geology].reverse(),
      ecology: { ...catalog.ecology, species: [...allSpecies].reverse() },
    });
    expect(b.facts!.resourceDeposits).toEqual(a.facts!.resourceDeposits);
    expect(b.facts!.resources).toEqual(a.facts!.resources);
    const c = prepared();
    generateResourceFacts(c, new RNG('different'));
    expect(c.facts!.resourceDeposits).not.toEqual(a.facts!.resourceDeposits);
  });
  it('reports sparse or stale geology as unknown and trace-only deposits as unobserved usable supply', () => {
    const sparse = prepared();
    generateResourceFacts(sparse, new RNG('x'), { ...catalog, geology: [] });
    expect(sparse.facts!.resources.find((entry) => entry.kind === 'ore')!.availability).toBe(
      'unknown',
    );
    const stale = prepared();
    stale.facts!.geology[0].reason!.status = 'stale';
    generateResourceFacts(stale, new RNG('x'));
    expect(stale.facts!.resources.find((entry) => entry.kind === 'gas')!.availability).toBe(
      'unknown',
    );
    const traceOnly = prepared();
    const province = traceOnly.facts!.geology[0];
    traceOnly.facts!.resourceDeposits.push({
      id: 'deposit:trace',
      name: 'Trace',
      description: '',
      origin: 'authored',
      geologyId: province.id,
      resourceName: 'iron ore',
      category: 'metal-ore',
      concentration: 'trace',
      exposure: 'deep',
      extraction: 'mining',
      anchor: { nodeIds: [province.anchor.nodeIds[0]], edgeIds: [] },
    });
    generateResourceFacts(traceOnly, new RNG('x'), {
      ...catalog,
      geology: catalog.geology
        .filter((entry) => entry.category === 'metal-ore')
        .map((entry) => ({ ...entry, hostRocks: ['unsupported rock'] })),
    });
    const ore = traceOnly.facts!.resources.find((entry) => entry.kind === 'ore')!;
    expect(ore.availability).toBe('not-observed');
    expect(ore.depositIds).toContain('deposit:trace');
    const noLand = fixture();
    noLand.facts!.areas = [];
    generateResourceFacts(noLand, new RNG('x'));
    expect(noLand.facts!.resources).toEqual([]);
  });
  it('uses both river endpoints and genuine lake margins, retaining the primary river identity', () => {
    const region = fixture();
    region.map.nodes.push(node(9, { isWater: true, neighbors: [1] }));
    region.map.nodes[0].neighbors = [9];
    region.map.edges.push({
      id: 70,
      d0: 9,
      d1: 1,
      v0: 0,
      v1: 1,
      river: 2,
      midpoint: { x: 0, y: 0 },
    });
    generateResourceFacts(region, new RNG('water'));
    expect(
      region.facts!.resources.find((entry) => entry.id === 'resource:freshwater')!.anchor!.nodeIds,
    ).toEqual([1]);
    expect(
      region.facts!.resources.some(
        (entry) => entry.name === 'Lake water' && entry.availability === 'limited',
      ),
    ).toBe(true);
    expect(regionFactsError(region.facts, region.map, [])).toBeNull();
    const dry = fixture();
    generateResourceFacts(dry, new RNG('dry'));
    expect(dry.facts!.resources.find((entry) => entry.kind === 'freshwater')!.availability).toBe(
      'not-observed',
    );
  });
  it('grounds reed fibers and cultivation potential locally and omits stale flora', () => {
    const wet = fixture();
    wet.map.nodes.forEach((entry) => {
      entry.biomeId = 'flooded grassland';
      entry.moisture = 0.8;
      entry.neighbors = wet.map.nodes
        .filter((other) => other.id !== entry.id)
        .map((other) => other.id);
    });
    wet.map.edges.push({ id: 77, d0: 1, d1: 2, v0: 0, v1: 1, river: 2, midpoint: { x: 0, y: 0 } });
    const ecology = {
      ...catalog.ecology,
      biomes: [
        {
          ...BiomeClassifications.getByName('flooded grassland'),
          vegetationTypes: ['reeds'],
          faunaTypes: [],
        },
      ],
    };
    generateHabitatFacts(wet, new RNG('habitat'));
    generateEcologyInhabitants(wet, new RNG('inhabitants'), ecology);
    expect(
      wet.facts!.ecologyInhabitants.some(
        (entry) => entry.source.kind === 'described' && entry.source.label === 'reeds',
      ),
    ).toBe(true);
    const stale = structuredClone(wet);
    stale.facts!.ecologyInhabitants.forEach((entry) => {
      entry.reason!.status = 'stale';
    });
    generateResourceFacts(wet, new RNG('fibers'), { ...catalog, ecology });
    expect(
      wet.facts!.resources.some(
        (entry) => entry.kind === 'fiber' && entry.availability === 'limited',
      ),
    ).toBe(true);
    expect(
      wet.facts!.resources.some(
        (entry) => entry.kind === 'arable-land' && entry.availability === 'limited',
      ),
    ).toBe(true);
    expect(regionFactsError(wet.facts, wet.map, [])).toBeNull();
    generateResourceFacts(stale, new RNG('fibers'), { ...catalog, ecology });
    expect(stale.facts!.resources.find((entry) => entry.kind === 'fiber')!.availability).toBe(
      'unknown',
    );
    const unsuitable = fixture();
    unsuitable.environment.terrain.geologicalMakeup.soilTypes = ['sand'];
    unsuitable.map.nodes.forEach((entry) => {
      entry.biomeId = 'temperate grassland';
    });
    generateHabitatFacts(unsuitable, new RNG('habitat'));
    generateResourceFacts(unsuitable, new RNG('cultivation'));
    expect(
      unsuitable.facts!.resources.find((entry) => entry.kind === 'arable-land')!.availability,
    ).toBe('not-observed');
  });
  it('uses only supported saved flora/fauna and preserves source identities under display edits', () => {
    const region = fixture();
    region.map.nodes.forEach((entry) => {
      entry.neighbors = region.map.nodes
        .filter((other) => other.id !== entry.id)
        .map((other) => other.id);
    });
    generateHabitatFacts(region, new RNG('habitats'));
    generateEcologyInhabitants(region, new RNG('inhabitants'));
    const before = structuredClone(region.facts!.ecologyInhabitants);
    expect(before.length).toBeGreaterThan(0);
    region.facts!.ecologyInhabitants.forEach((entry) => {
      entry.name = 'Edited name';
    });
    generateResourceFacts(region, new RNG('organic'));
    const sources = region.facts!.resources.filter(
      (entry) => entry.catalogSource?.kind === 'species-product',
    );
    expect(sources.length).toBeGreaterThan(0);
    expect(
      region.facts!.resources.some(
        (entry) => entry.kind === 'timber' && ['available', 'limited'].includes(entry.availability),
      ),
    ).toBe(true);
    for (const fact of sources)
      expect(
        fact.reason!.sources.some(
          (source) => source.kind === 'fact' && before.some((entry) => entry.id === source.factId),
        ),
      ).toBe(true);
    expect(regionFactsError(region.facts, region.map, [])).toBeNull();
  });
});

describe('resource editing dependencies', () => {
  function saved() {
    for (let i = 0; i < 30; i++) {
      const region = prepared();
      generateResourceFacts(region, new RNG(`edit:${i}`));
      if (region.facts!.resources.some((entry) => entry.depositIds.length))
        return region as unknown as RegionSnapshot;
    }
    throw new Error('No usable fixture');
  }
  it('retains IDs and stales the entire explanation chain on edits', () => {
    const snapshot = saved();
    const resource = snapshot.facts.resources.find((entry) => entry.depositIds.length)!;
    const deposit = snapshot.facts.resourceDeposits.find(
      (entry) => entry.id === resource.depositIds[0],
    )!;
    const edited = setRegionResourceFactText(
      snapshot,
      'geology',
      deposit.geologyId,
      'name',
      'Authored province',
    );
    expect(edited.facts.geology.find((entry) => entry.id === deposit.geologyId)!.origin).toBe(
      'authored',
    );
    expect(edited.facts.resources.find((entry) => entry.id === resource.id)!.reason!.status).toBe(
      'stale',
    );
    expect(snapshot.facts.resources.find((entry) => entry.id === resource.id)!.reason!.status).toBe(
      'current',
    );
    expect(setRegionResourceFactText(snapshot, 'geology', 'missing', 'name', 'x')).toBe(snapshot);
  });
  it('protects authored dependencies and removes only direct generated dependents', () => {
    const snapshot = saved();
    const resource = snapshot.facts.resources.find((entry) => entry.depositIds.length)!;
    const deposit = snapshot.facts.resourceDeposits.find(
      (entry) => entry.id === resource.depositIds[0],
    )!;
    snapshot.facts.notables.push({
      id: 'landmark:test',
      kind: 'landmark',
      name: '',
      description: '',
      origin: 'generated',
      areaIds: [],
      reason: {
        ruleId: 'test',
        status: 'current',
        sources: [{ kind: 'fact', factId: resource.id }],
      },
    });
    const removed = removeRegionResourceFact(snapshot, 'geology', deposit.geologyId);
    expect(
      removed.facts.resourceDeposits.some((entry) => entry.geologyId === deposit.geologyId),
    ).toBe(false);
    expect(removed.facts.resources.some((entry) => entry.id === resource.id)).toBe(false);
    expect(removed.facts.notables[0].reason!.status).toBe('stale');
    expect(regionFactsError(removed.facts, removed.map, [])).toBeNull();
    resource.origin = 'authored';
    expect(removeRegionResourceFact(snapshot, 'geology', deposit.geologyId)).toBe(snapshot);
    expect(removeRegionResourceFact(snapshot, 'resources', 'missing')).toBe(snapshot);
  });
  it('derives typed flax stems only from supported saved grassland flora', () => {
    const ecology = {
      ...catalog.ecology,
      species: [],
      biomes: [
        {
          ...BiomeClassifications.getByName('temperate grassland'),
          vegetationTypes: ['flax'],
          faunaTypes: [],
        },
      ],
    };
    const create = (temperature: number, moisture: number) => {
      const region = fixture();
      region.map.nodes.forEach((entry) => {
        entry.biomeId = 'temperate grassland';
        entry.temperature = temperature;
        entry.moisture = moisture;
      });
      generateHabitatFacts(region, new RNG('flax-habitat'));
      generateEcologyInhabitants(region, new RNG('flax-flora'), ecology);
      generateResourceFacts(region, new RNG('flax-stems'), { ...catalog, ecology });
      return region;
    };
    const supported = create(20, 0.4);
    expect(
      supported.facts!.resources.find((entry) => entry.catalogSource?.kind === 'plant-product'),
    ).toMatchObject({
      kind: 'fiber',
      availability: 'limited',
      catalogSource: { kind: 'plant-product', plantName: 'flax', resourceName: 'flax stems' },
    });
    expect(regionFactsError(supported.facts, supported.map, [])).toBeNull();
    for (const region of [create(0, 0.4), create(20, 0.1), create(20, 0.8)]) {
      expect(
        region.facts!.resources.some((entry) => entry.catalogSource?.kind === 'plant-product'),
      ).toBe(false);
    }
  });
});
