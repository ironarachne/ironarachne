import { regionSourceQualifications as regionSourceQualificationsForTest } from './region_source_presentation';
import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getPlantDefinitions, type Environment } from '$lib/environment';
import type { MapNode } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import type Region from './region';
import type { RegionSnapshot } from './region_snapshot';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateHabitatFacts } from './region_habitats';
import { generateEcologyInhabitants } from './region_ecology';
import { generateResourceFacts } from './region_resources';
import { generateManagedProduction, finalizeResourceInventory } from './region_managed_production';
import { biologicalSourceCandidates, geologicalSourceCandidates } from './region_raw_sources';
import { biologicalWaterSources } from './region_biological_patches';
import { accessibleProcessingResources } from './region_processing_resources';
import { selectedResourceCurrent } from './region_evidence';
import { removeRegionResourceFact, setRegionResourceFactText } from './region_resource_editing';
import { rawSourceFactsError } from './region_raw_source_validation';

function fixture(): Pick<
  Region,
  'map' | 'facts' | 'settlements' | 'settlementIds' | 'environment'
> & { facts: NonNullable<Region['facts']> } {
  const node: MapNode = {
    id: 1,
    center: { x: 1, y: 0 },
    neighbors: [2],
    edges: [1],
    corners: [],
    polygon: { vertices: [], edges: [] },
    biomeId: 'temperate grassland',
    temperature: 20,
    moisture: 0.5,
    elevation: 0.2,
    isWater: false,
    isOcean: false,
    isCoast: false,
  };
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'authored',
    mapNodeIds: [1],
  });
  const region = {
    facts,
    map: {
      width: 10,
      height: 10,
      nodes: [node, { ...node, id: 2, neighbors: [1], isWater: true, biomeId: 'lake' }],
      edges: [{ id: 1, d0: 1, d1: 2, v0: 0, v1: 1, river: 2, midpoint: { x: 1, y: 1 } }],
      corners: [],
    },
    environment: {
      terrain: { geologicalMakeup: { soilTypes: ['loam'], rockTypes: ['granite'] } },
      dominantEcosystem: { flora: [], fauna: [] },
      ecosystems: [],
      climate: { seasons: [] },
    } as unknown as Environment,
    settlements: [{ name: 'Home', mapNodeId: 1 } as Settlement],
    settlementIds: ['settlement:home'],
  };
  generateHabitatFacts(region, new RNG('habitat'));
  return region;
}
function generated(seed = 'source') {
  const region = fixture();
  generateEcologyInhabitants(region, new RNG(seed));
  generateResourceFacts(region, new RNG(seed));
  generateManagedProduction(region, new RNG(seed));
  finalizeResourceInventory(region, new RNG(seed));
  return region;
}
function error(region: ReturnType<typeof fixture>) {
  return regionFactsError(region.facts, region.map, [
    { id: 'settlement:home', snapshot: region.settlements[0] as never },
  ]);
}
function saved(region: ReturnType<typeof fixture>) {
  return {
    ...region,
    settlements: [{ id: 'settlement:home', snapshot: region.settlements[0] }],
  } as unknown as RegionSnapshot;
}

describe('source-qualified regional raw supply', () => {
  it('generates bounded sources and owner-supported production, never wild milk or seed cotton cloth', () => {
    let managed = 0,
      wild = 0;
    for (let index = 0; index < 24; index++) {
      const region = generated(`raw:${index}`);
      expect(error(region)).toBeNull();
      expect(region.facts.managedProduction.length).toBeLessThanOrEqual(2);
      expect(region.facts.resourceSources.length).toBeLessThanOrEqual(168);
      managed += region.facts.managedProduction.length;
      wild += region.facts.resourceSources.filter((entry) => entry.source.kind === 'wild').length;
      for (const production of region.facts.managedProduction) {
        expect(production.supportingResourceIds).toContain('resource:freshwater');
        expect(production.settlement).toEqual({
          kind: 'embedded',
          settlementId: 'settlement:home',
        });
      }
      expect(
        region.facts.resourceSources.some(
          (entry) =>
            entry.source.kind === 'wild' &&
            ['milking', 'shearing', 'slaughtering', 'egg-collection'].includes(entry.method),
        ),
      ).toBe(false);
    }
    expect(managed).toBeGreaterThan(0);
    expect(wild).toBeGreaterThan(0);
  });
  it('requires actual water witnesses and producer occurrence, independent of names', () => {
    const region = fixture();
    expect(biologicalWaterSources(region, 1).map((entry) => entry.kind)).toEqual(['river', 'lake']);
    expect(biologicalWaterSources(region, 2)).toEqual([]);
    expect(biologicalWaterSources(region, 999)).toEqual([]);
    expect(biologicalSourceCandidates(region)).toEqual([]);
    const habitat = region.facts.habitats[0];
    region.facts.ecologyInhabitants.push({
      id: 'inhabitant:perch',
      name: 'Edited',
      description: '',
      origin: 'authored',
      category: 'fauna',
      roles: ['other'],
      source: { kind: 'species', speciesName: 'European perch' },
      occurrenceForm: 'population',
      habitatIds: [habitat.id],
    });
    expect(
      biologicalSourceCandidates(region).some(
        (entry) =>
          entry.fact.catalogSource?.kind === 'raw-resource' &&
          entry.fact.catalogSource.resourceId === 'perch-flesh',
      ),
    ).toBe(true);
    region.map.edges[0].river = 0;
    region.map.nodes[1].isWater = false;
    expect(biologicalSourceCandidates(region)).toEqual([]);
  });
  it('requires saved forage and unmanaged support and preserves upstream data across named stages', () => {
    const region = fixture();
    generateEcologyInhabitants(region, new RNG('before'));
    generateResourceFacts(region, new RNG('before'));
    const before = structuredClone({
      map: region.map,
      inhabitants: region.facts.ecologyInhabitants,
      resources: region.facts.resources,
    });
    generateManagedProduction(region, new RNG('managed'));
    expect({
      map: region.map,
      inhabitants: region.facts.ecologyInhabitants,
      resources: region.facts.resources,
    }).toEqual(before);
    const noSupport = fixture();
    generateManagedProduction(noSupport, new RNG('managed'));
    expect(noSupport.facts.managedProduction).toEqual([]);
    const badSoil = fixture();
    badSoil.environment.terrain.geologicalMakeup.soilTypes = ['gravel'];
    generateResourceFacts(badSoil, new RNG('bad'));
    generateManagedProduction(badSoil, new RNG('bad'));
    expect(badSoil.facts.managedProduction).toEqual([]);
    expect(getPlantDefinitions().some((plant) => plant.forage.includes('grazing'))).toBe(true);
  });
  it('selects current sources and rejects unknown generation rules, incompatible deposits and another owner', () => {
    const region = generated('access');
    const eligible = accessibleProcessingResources(region, new Set([1]), 'settlement:home');
    expect(eligible.some((entry) => entry.sourceId)).toBe(true);
    for (const entry of eligible.filter((entry) => entry.sourceId))
      expect(selectedResourceCurrent(region.facts, entry.fact.id, entry.sourceId)).toBe(true);
    expect(selectedResourceCurrent(region.facts, 'missing')).toBe(false);
    for (const source of region.facts.resourceSources) source.definitionId = 'historical:unknown';
    expect(
      accessibleProcessingResources(region, new Set([1])).some((entry) => entry.sourceId),
    ).toBe(false);
    expect(error(region)).toBeNull();
  });
  it('keeps a surviving occurrence after removal and protects authored dependent work', () => {
    const region = generated('access');
    const summary = region.facts.resources.find((entry) => entry.sourceIds?.length)!;
    const source = region.facts.resourceSources.find(
      (entry) => entry.id === summary.sourceIds![0],
    )!;
    const second = structuredClone(source);
    second.id += ':independent';
    region.facts.resourceSources.push(second);
    summary.sourceIds!.push(second.id);
    const original = saved(region);
    const removed = removeRegionResourceFact(original, 'resourceSources', source.id);
    expect(removed.facts.resources.find((entry) => entry.id === summary.id)?.sourceIds).toEqual([
      second.id,
    ]);
    expect(selectedResourceCurrent(removed.facts, summary.id, second.id)).toBe(true);
    const edited = setRegionResourceFactText(
      original,
      'resourceSources',
      source.id,
      'name',
      'Authored',
    );
    expect(edited.facts.resourceSources.find((entry) => entry.id === source.id)?.resource).toEqual(
      source.resource,
    );
    expect(selectedResourceCurrent(edited.facts, summary.id, second.id)).toBe(true);
    summary.origin = 'authored';
    delete summary.reason;
    expect(removeRegionResourceFact(saved(region), 'resourceSources', source.id)).toEqual(
      saved(region),
    );
  });
  it('rejects missing origins, cycles, water mismatch, orphan supply and wrong summary keys without catalog lookup', () => {
    const region = generated('access');
    const check = () =>
      rawSourceFactsError(
        region.facts as never,
        region.map,
        new Set(region.facts.areas.map((entry) => entry.id)),
        () => true,
      );
    expect(check()).toBeNull();
    const original = structuredClone(region.facts);
    const source = region.facts.resourceSources[0];
    source.reason!.sources.push({ kind: 'fact', factId: source.id });
    expect(check()).toMatch(/cyclic/);
    region.facts = structuredClone(original);
    region.facts.resourceSources[0].waterSources = [{ kind: 'river', edgeId: 999 }];
    expect(check()).toMatch(/river/);
    region.facts = structuredClone(original);
    region.facts.resources = region.facts.resources.filter((entry) => !entry.sourceIds?.length);
    expect(check()).toMatch(/no inventory/);
    region.facts = structuredClone(original);
    const summary = region.facts.resources.find((entry) => entry.sourceIds?.length)!;
    summary.catalogSource = { kind: 'raw-resource', resourceId: 'wrong' };
    expect(check()).toMatch(/mismatched/);
    region.facts = structuredClone(original);
    region.facts.resourceSources[0].source = { kind: 'managed', productionId: 'missing' };
    expect(check()).toMatch(/production/);
  });
  it('is reproducible and invariant under equivalent graph ordering', () => {
    expect(generated('repeat')).toEqual(generated('repeat'));
    const region = fixture();
    region.map.nodes.reverse();
    region.map.edges.reverse();
    generateEcologyInhabitants(region, new RNG('repeat'));
    generateResourceFacts(region, new RNG('repeat'));
    generateManagedProduction(region, new RNG('repeat'));
    finalizeResourceInventory(region, new RNG('repeat'));
    expect(region.facts).toEqual(generated('repeat').facts);
    expect(geologicalSourceCandidates(fixture())).toEqual([]);
  });
});

describe('selected source processing and presentation', () => {
  it('preserves independent processing evidence after a sibling occurrence changes or is removed', async () => {
    const { generateProcessingFacts } = await import('./region_processing');
    const { getProcessingRecipes } = await import('$lib/resources');
    const { resolveProcessingChain } = await import('./region_processing_chain');
    const { assessRegionProductFood } = await import('./region_food');
    const { regionSourceQualifications } = await import('./region_source_presentation');
    const region = fixture();
    const habitat = region.facts.habitats[0];
    region.facts.ecologyInhabitants.push({
      id: 'inhabitant:test-perch',
      name: 'perch',
      description: '',
      origin: 'authored',
      category: 'fauna',
      roles: ['other'],
      source: { kind: 'species', speciesName: 'European perch' },
      occurrenceForm: 'population',
      habitatIds: [habitat.id],
    });
    generateResourceFacts(region, new RNG('perch'));
    region.facts.settlementRoles.push({
      id: 'role:site:home',
      name: 'Home site',
      description: '',
      origin: 'authored',
      settlement: { kind: 'embedded', settlementId: 'settlement:home' },
      areaIds: ['area:land'],
      anchor: { nodeIds: [1], edgeIds: [] },
    });
    generateProcessingFacts(region, new RNG('food'), {
      recipes: getProcessingRecipes().filter((entry) => entry.outputKey === 'dried-provisions'),
    });
    expect(region.facts.products).toHaveLength(1);
    const product = region.facts.products[0];
    const input = product.inputs[0];
    if (input.kind !== 'resource') throw new Error('Expected a selected raw source');
    expect(input.sourceId).toBeDefined();
    expect(product.requirements).toContain('shore fishing gear and handling equipment');
    expect(assessRegionProductFood(region.facts, product.id).status).toBe('eligible');
    expect(regionSourceQualifications(saved(region), product).join(' ')).toContain(
      'Reviewed food opportunity',
    );
    const chosen = region.facts.resourceSources.find((entry) => entry.id === input.sourceId)!;
    const sibling = { ...structuredClone(chosen), id: chosen.id + ':sibling' };
    const summary = region.facts.resources.find((entry) => entry.id === input.resourceId)!;
    region.facts.resourceSources.push(sibling);
    summary.sourceIds!.push(sibling.id);
    summary.reason!.sources.push({ kind: 'fact', factId: sibling.id });
    const edited = setRegionResourceFactText(
      saved(region),
      'resourceSources',
      sibling.id,
      'description',
      'A different occurrence',
    );
    expect(resolveProcessingChain(edited.facts, product.id).issues).toEqual([]);
    expect(edited.facts.products[0].reason?.status).toBe('current');
    const removed = removeRegionResourceFact(saved(region), 'resourceSources', sibling.id);
    expect(resolveProcessingChain(removed.facts, product.id).issues).toEqual([]);
    expect(
      removeRegionResourceFact(saved(region), 'resourceSources', chosen.id).facts.products,
    ).toEqual([]);
    const unknown = structuredClone(product);
    delete unknown.food;
    expect(
      regionSourceQualifications(
        { ...saved(region), facts: { ...region.facts, products: [unknown] } },
        unknown,
      ),
    ).toContain('Food qualification is unknown.');
    const raw = regionSourceQualifications(saved(region), chosen).join(' ');
    expect(raw).toContain('by fishing');
    expect(raw).toContain('Acquisition requires');
  });
  it('reports managed ownership and refuses another settlement’s supply', () => {
    const region = generated('access');
    const managed = region.facts.resourceSources.find((entry) => entry.source.kind === 'managed');
    expect(managed).toBeDefined();
    const production = region.facts.managedProduction.find(
      (entry) => managed?.source.kind === 'managed' && entry.id === managed.source.productionId,
    )!;
    const snapshot = saved(region);
    expect(regionSourceQualificationsForTest(snapshot, production).join(' ')).toContain(
      'owned by Home',
    );
    expect(
      accessibleProcessingResources(region, new Set([1]), 'settlement:other').some(
        (entry) => entry.sourceId === managed!.id,
      ),
    ).toBe(false);
    production.settlement = { kind: 'artifact', targetId: 'external-owner' };
    expect(
      accessibleProcessingResources(region, new Set([1]), {
        kind: 'artifact',
        targetId: 'external-owner',
      }).some((entry) => entry.sourceId === managed!.id),
    ).toBe(true);
    expect(
      accessibleProcessingResources(region, new Set([1]), {
        kind: 'artifact',
        targetId: 'different-owner',
      }).some((entry) => entry.sourceId === managed!.id),
    ).toBe(false);
  });
});
