import { generateProcessingFacts } from './region_processing';
import { generateLivelihoodFacts } from './region_livelihoods';
import { accessibleDailyLifeResources } from './region_livelihood_access';
import { dailyLifeInputCurrent } from './region_livelihood_evidence';
import { assessSettlementSupply } from './region_supply';
import { getProcessingRecipes, matchesProcessingSource } from '$lib/resources';
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
  it('checks shared evidence with bounded work and still rejects a later cycle', () => {
    const region = generated('access');
    let reads = 0;
    for (let index = 0; index < 20; index++) {
      const parents =
        index > 1 ? [`claim:shared:${index - 1}`, `claim:shared:${index - 2}`] : ['area:land'];
      const reason = {
        ruleId: 'test:shared-evidence',
        status: 'current' as const,
        sources: parents.map((factId) => ({ kind: 'fact' as const, factId })),
      };
      const claim = {
        id: `claim:shared:${index}`,
        name: 'Shared evidence',
        description: '',
        origin: 'authored' as const,
        subjectId: parents[0],
        relatedIds: parents.slice(1),
        reason,
      };
      // Count observable evidence reads rather than asserting a machine-dependent duration.
      Object.defineProperty(claim, 'reason', {
        get: () => {
          reads++;
          return reason;
        },
        enumerable: true,
      });
      region.facts.claims.push(claim);
    }
    for (const source of region.facts.resourceSources)
      source.reason!.sources.push({ kind: 'fact', factId: 'claim:shared:19' });
    const check = () =>
      rawSourceFactsError(
        region.facts as never,
        region.map,
        new Set(region.facts.areas.map((entry) => entry.id)),
        () => true,
      );
    expect(check()).toBeNull();
    expect(reads).toBeLessThanOrEqual(40);
    region.facts.claims[0].relatedIds.push('claim:shared:19');
    expect(check()).toMatch(/cyclic/);
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

function aquaticFixture(speciesName = 'crayfish', coastal = false) {
  const region = fixture();
  if (coastal) {
    region.map.nodes[0].isCoast = true;
    region.map.nodes[1].isOcean = true;
    region.map.edges[0].river = 0;
  }
  region.facts.ecologyInhabitants.push({
    id: 'inhabitant:aquatic',
    name: 'An edited animal',
    description: '',
    origin: 'authored',
    category: 'fauna',
    roles: ['other'],
    source: { kind: 'species', speciesName },
    occurrenceForm: 'population',
    habitatIds: region.facts.habitats.map((entry) => entry.id),
  });
  const candidates = biologicalSourceCandidates(region);
  for (const candidate of candidates) {
    region.facts.resources.push(candidate.fact);
    region.facts.resourceSources.push(...candidate.sourceFacts!);
  }
  region.facts.settlementRoles.push({
    id: 'role:site:home',
    name: 'Home',
    description: '',
    origin: 'authored',
    settlement: { kind: 'embedded', settlementId: 'settlement:home' },
    areaIds: ['area:land'],
    anchor: { nodeIds: [1], edgeIds: [] },
  });
  return region;
}

describe('aquatic source classification and consumption', () => {
  it.each([
    ['crayfish', false],
    ['noble crayfish', false],
    ['European perch', false],
    ['Dungeness crab', true],
    ['blue mussel', true],
    ['eastern oyster', true],
  ])(
    'qualifies %s using its source method and records compatible daily life',
    (species, coastal) => {
      const region = aquaticFixture(species as string, coastal as boolean);
      expect(region.facts.resources).toHaveLength(1);
      expect(region.facts.resources[0].kind).toBe('fish');
      const source = region.facts.resourceSources[0];
      const before = structuredClone(region.facts.resourceSources);
      const resources = accessibleProcessingResources(region, new Set([1]));
      expect(resources.map((entry) => entry.sourceId)).toEqual([source.id]);
      generateLivelihoodFacts(region, new RNG('aquatic'));
      expect(region.facts.dailyLife.map((entry) => entry.activityKey).sort()).toEqual(
        [source.method, `raw-food-${source.resource.id}`].sort(),
      );
      expect(
        region.facts.dailyLife.every((entry) =>
          entry.inputs.some((input) => input.kind === 'resource' && input.sourceId === source.id),
        ),
      ).toBe(true);
      expect(
        region.facts.dailyLife.some((entry) =>
          ['hunting', 'game-food'].includes(entry.activityKey),
        ),
      ).toBe(false);
      expect(region.facts.resourceSources).toEqual(before);
      const supply = assessSettlementSupply(region, region.facts.settlementRoles[0]);
      if (source.method === 'shellfish-collection') {
        expect(supply.find((entry) => entry.needKey === 'preserved-provisions')?.status).toBe(
          'local-not-supported',
        );
        for (const recipe of getProcessingRecipes().filter((entry) =>
          ['dried-provisions', 'smoked-provisions'].includes(entry.outputKey),
        )) {
          expect(
            recipe.inputs.some((input) =>
              matchesProcessingSource(
                input.selector,
                resources[0].resource,
                resources[0].rawResourceId,
              ),
            ),
          ).toBe(false);
        }
      }
    },
  );

  it.each(['river', 'lake'] as const)(
    'requires an actual saved %s witness, not replacement water',
    (kind) => {
      const region = aquaticFixture();
      const source = region.facts.resourceSources[0];
      source.waterSources = source.waterSources.filter((entry) => entry.kind === kind);
      expect(accessibleProcessingResources(region, new Set([1]))).toHaveLength(1);
      if (kind === 'river') region.map.edges[0].river = 0;
      else region.map.nodes[1].isWater = false;
      expect(accessibleProcessingResources(region, new Set([1]))).toEqual([]);
      expect(region.facts.resourceSources[0]).toBe(source);
    },
  );

  it.each([
    'missing occurrence',
    'stale occurrence',
    'stale habitat',
    'stale source',
    'wrong producer',
    'wrong method',
    'wrong raw key',
    'no saved water',
    'ocean replaces freshwater',
    'incompatible climate',
    'inaccessible anchor',
  ])('omits supply and new livelihoods for %s', (change) => {
    const region = aquaticFixture();
    const source = region.facts.resourceSources[0];
    const stale = { ruleId: 'test', sources: [], status: 'stale' as const };
    if (change === 'missing occurrence') region.facts.ecologyInhabitants = [];
    if (change === 'stale occurrence') region.facts.ecologyInhabitants[0].reason = stale;
    if (change === 'stale habitat') region.facts.habitats[0].reason = stale;
    if (change === 'stale source') source.reason = stale;
    if (change === 'wrong producer')
      region.facts.ecologyInhabitants[0].source = { kind: 'species', speciesName: 'deer' };
    if (change === 'wrong method') source.method = 'hunting';
    if (change === 'wrong raw key') source.resource.id = 'deer-meat';
    if (change === 'no saved water') source.waterSources = [];
    if (change === 'ocean replaces freshwater') {
      region.map.edges[0].river = 0;
      region.map.nodes[1].isOcean = true;
      region.map.nodes[0].isCoast = true;
    }
    if (change === 'incompatible climate') region.map.nodes[0].temperature = -20;
    if (change === 'inaccessible anchor') source.anchor.nodeIds = [999];
    expect(accessibleProcessingResources(region, new Set([1]))).toEqual([]);
    generateLivelihoodFacts(region, new RNG('omit'));
    expect(region.facts.dailyLife).toEqual([]);
  });

  it('rechecks water before making new livelihood and supply claims from retained products', () => {
    const region = aquaticFixture('European perch');
    generateProcessingFacts(region, new RNG('preserving'));
    expect(region.facts.products.map((entry) => entry.productKey)).toContain('dried-provisions');
    generateLivelihoodFacts(region, new RNG('living'));
    expect(
      region.facts.dailyLife.some((entry) =>
        entry.inputs.some((input) => input.kind === 'product'),
      ),
    ).toBe(true);
    expect(
      assessSettlementSupply(region, region.facts.settlementRoles[0]).find(
        (entry) => entry.needKey === 'preserved-provisions',
      )?.status,
    ).toBe('limited-local');
    const before = structuredClone(region.facts.products);
    region.facts.resourceSources[0].waterSources = [];
    region.facts.dailyLife = [];
    generateLivelihoodFacts(region, new RNG('living'));
    expect(region.facts.dailyLife).toEqual([]);
    expect(
      assessSettlementSupply(region, region.facts.settlementRoles[0]).find(
        (entry) => entry.needKey === 'preserved-provisions',
      )?.status,
    ).toBe('local-not-supported');
    expect(region.facts.products).toEqual(before);
  });

  it('qualifies each collection anchor against its own saved water evidence', () => {
    const region = aquaticFixture();
    region.map.nodes.push({ ...region.map.nodes[0], id: 3, neighbors: [1] });
    region.facts.habitats[0].anchor!.nodeIds.push(3);
    region.facts.resourceSources[0].anchor.nodeIds.push(3);
    region.facts.resources[0].anchor!.nodeIds.push(3);
    expect(accessibleProcessingResources(region, new Set([3]))).toEqual([]);
    expect(accessibleProcessingResources(region, new Set([1, 3]))[0].anchor.nodeIds).toEqual([1]);
  });

  it('retains the aquatic selection cap without declaring eligible unselected sources unusable', () => {
    const region = aquaticFixture('blue mussel', true);
    const inhabitant = region.facts.ecologyInhabitants[0];
    for (const speciesName of ['Dungeness crab', 'eastern oyster', 'European flounder']) {
      region.facts.ecologyInhabitants.push({
        ...inhabitant,
        id: `inhabitant:${speciesName}`,
        source: { kind: 'species', speciesName },
      });
    }
    region.facts.resources = [];
    region.facts.resourceSources = [];
    expect(biologicalSourceCandidates(region)).toHaveLength(4);
    generateResourceFacts(region, new RNG('bounded'));
    expect(region.facts.resources.filter((entry) => entry.kind === 'fish')).toHaveLength(3);
    expect(region.facts.resourceSources).toHaveLength(3);
    expect(
      accessibleProcessingResources(region, new Set([1])).filter((entry) => entry.sourceId),
    ).toHaveLength(3);
  });

  it('does not move coastal shellfish into freshwater or infer animals from water', () => {
    const region = aquaticFixture('blue mussel', true);
    region.map.nodes[1].isOcean = false;
    expect(accessibleProcessingResources(region, new Set([1]))).toEqual([]);
    expect(biologicalSourceCandidates(region)).toEqual([]);
    expect(biologicalSourceCandidates(fixture())).toEqual([]);
    expect(aquaticFixture('crayfish', true).facts.resourceSources).toEqual([]);
  });

  it('separates distant reachable collection from settlement shore access and retains the product limitation', () => {
    const region = aquaticFixture('European perch');
    const distant = { ...region.map.nodes[0], id: 3, neighbors: [1] };
    region.map.nodes[0].neighbors.push(3);
    region.map.nodes.push(distant);
    region.settlements[0].mapNodeId = 3;
    const role = region.facts.settlementRoles[0];
    role.anchor.nodeIds = [3];
    expect(accessibleProcessingResources(region, new Set([1, 3]))).toHaveLength(1);
    expect(accessibleDailyLifeResources(region, 3)).toEqual([]);
    const summary = region.facts.resources[0];
    const source = region.facts.resourceSources[0];
    region.facts.products.push({
      id: 'product:dried',
      name: 'Dried fish',
      description: '',
      origin: 'authored',
      productKey: 'dried-provisions',
      recipeId: 'fantasy:processing:dried-provisions:v1',
      technique: 'drying',
      requirements: ['covered drying racks'],
      settlement: role.settlement,
      areaIds: role.areaIds,
      anchor: role.anchor,
      inputs: [
        {
          kind: 'resource',
          role: 'material',
          resourceId: summary.id,
          sourceId: source.id,
          anchor: source.anchor,
          depositIds: [],
        },
      ],
    });
    expect(
      dailyLifeInputCurrent(region.facts, region.map, 3, role.settlement, {
        kind: 'product',
        productId: 'product:dried',
      }),
    ).toBe(false);
  });
});
