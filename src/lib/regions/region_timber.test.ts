import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { BiomeClassifications, type Environment } from '$lib/environment';
import { allSpecies } from '$lib/species';
import {
  getBuildingMaterialResources,
  getGeologicalResources,
  getProcessingRecipes,
} from '$lib/resources';
import type { MapNode } from '$lib/map';
import type { Settlement } from '$lib/settlements';
import { emptyRegionFacts } from './region_facts';
import { generateHabitatFacts } from './region_habitats';
import { generateGeologyFacts } from './region_geology';
import { generateResourceFacts } from './region_resources';
import { generateEcologyRelationships } from './region_ecology_relationships';
import { accessibleProcessingResources } from './region_processing_resources';
import { assessProcessingCapability } from './region_processing_capability';
import { assessSettlementSupply } from './region_supply';
import { TIMBER_PRODUCER_LABELS } from './region_ecology_rules';
import type { RegionResourceCatalog } from './region_resource_rule_types';

function fixture(label = 'elm tree') {
  const facts = emptyRegionFacts('current');
  const node: MapNode = {
    id: 1,
    center: { x: 0, y: 0 },
    neighbors: [],
    edges: [],
    corners: [],
    polygon: { vertices: [], edges: [] },
    biomeId: 'temperate deciduous forest',
    elevation: 0.2,
    temperature: 20,
    moisture: 0.6,
    isWater: false,
    isOcean: false,
    isCoast: false,
  };
  facts.areas.push({
    id: 'area:land',
    name: 'Land',
    description: '',
    origin: 'generated',
    mapNodeIds: [1],
  });
  const region = {
    facts,
    map: { width: 10, height: 10, nodes: [node], edges: [], corners: [] },
    environment: {
      terrain: { geologicalMakeup: { rockTypes: ['granite'], soilTypes: [] } },
      ecosystems: [],
      dominantEcosystem: { name: '', description: '', flora: [], fauna: [] },
      climate: { seasons: [] },
    } as unknown as Environment,
    settlements: [{ name: 'Home', mapNodeId: 1 } as Settlement],
    settlementIds: ['settlement:home'],
  };
  if (label === 'mangrove tree') {
    node.biomeId = 'mangrove forest';
    node.temperature = 25;
    node.elevation = 0.05;
    node.moisture = 0.8;
    node.isCoast = true;
    node.neighbors = [2];
    region.map.nodes.push({ ...node, id: 2, neighbors: [1], isWater: true, isOcean: true });
  }
  const catalog: RegionResourceCatalog = {
    geology: getGeologicalResources(),
    buildingMaterials: getBuildingMaterialResources(),
    ecology: {
      species: allSpecies,
      biomes: [
        {
          ...BiomeClassifications.getByName(node.biomeId!),
          vegetationTypes: [label],
          faunaTypes: [],
        },
      ],
    },
  };
  generateHabitatFacts(region, new RNG('habitat'));
  generateGeologyFacts(region, new RNG('geology'));
  facts.ecologyInhabitants.push({
    id: 'inhabitant:tree',
    name: 'Edited name',
    description: 'Edited to claim pine and a sawmill.',
    origin: 'authored',
    category: 'flora',
    roles: ['producer'],
    source: { kind: 'described', label },
    habitatIds: [facts.habitats[0].id],
    reason: {
      ruleId: 'fixture',
      status: 'current',
      sources: [{ kind: 'fact', factId: facts.habitats[0].id }],
    },
  });
  facts.settlementRoles.push({
    id: 'role:site:home',
    name: 'Home',
    description: '',
    origin: 'generated',
    settlement: { kind: 'embedded', settlementId: 'settlement:home' },
    areaIds: ['area:land'],
    anchor: { nodeIds: [1], edgeIds: [] },
    reason: {
      ruleId: 'fantasy:region:forest-settlement:v1',
      status: 'current',
      sources: [{ kind: 'fact', factId: 'area:land' }],
    },
  });
  return { region, catalog };
}
function derive(label: string) {
  const result = fixture(label);
  generateEcologyRelationships(result.region, new RNG('uses'), result.catalog.ecology);
  generateResourceFacts(result.region, new RNG('wood'), result.catalog);
  return result;
}

describe('supported regional wood', () => {
  it.each(['elm tree', 'hickory tree'])(
    'agrees across ecology, raw inventory, processing and supply for %s',
    (label) => {
      const { region } = derive(label);
      const timber = region.facts.resources.find((entry) => entry.kind === 'timber')!;
      expect(timber).toMatchObject({
        name: `${label.replace(' tree', '')} timber`,
        availability: 'limited',
        catalogSource: undefined,
      });
      expect(timber.reason!.sources).toContainEqual({ kind: 'fact', factId: 'inhabitant:tree' });
      expect(region.facts.ecologyRelationships).toEqual([
        expect.objectContaining({
          subjectId: 'inhabitant:tree',
          relation: expect.objectContaining({ kind: 'used-by', use: 'material' }),
        }),
      ]);
      const resources = accessibleProcessingResources(region, new Set([1]));
      const wood = resources.find((entry) => entry.fact.id === timber.id)!;
      expect(wood.resource).toMatchObject({
        major_type: 'wood',
        minor_type: 'timber',
        properties: [],
      });
      expect(
        assessProcessingCapability(getProcessingRecipes(), resources, 'sawn-timber'),
      ).toMatchObject({ supported: true, limited: true });
      expect(region.facts.products).toEqual([]);
      const supply = assessSettlementSupply(region, region.facts.settlementRoles[0]);
      for (const needKey of ['construction-timber', 'wood-fuel'])
        expect(supply.find((entry) => entry.needKey === needKey)).toMatchObject({
          status: 'limited-local',
        });
      expect(derive(label).region.facts).toEqual(region.facts);
    },
  );

  it.each([...TIMBER_PRODUCER_LABELS])(
    'supports the existing tree producer %s without a second whitelist',
    (label) => {
      const { region } = derive(label);
      expect(region.facts.resources.find((entry) => entry.kind === 'timber')!.availability).toBe(
        'limited',
      );
    },
  );

  it('distinguishes missing sources from unsupported metadata without inventing shortages', () => {
    const absent = fixture();
    absent.region.facts.ecologyInhabitants = [];
    generateResourceFacts(absent.region, new RNG('wood'), absent.catalog);
    expect(
      absent.region.facts.resources.find((entry) => entry.kind === 'timber')!.availability,
    ).toBe('not-observed');
    expect(
      assessSettlementSupply(absent.region, absent.region.facts.settlementRoles[0]).find(
        (entry) => entry.needKey === 'wood-fuel',
      ),
    ).toMatchObject({ status: 'local-not-supported' });
    const unsupported = fixture('unknown fantasy tree');
    unsupported.region.facts.ecologyInhabitants[0].roles = ['other'];
    generateResourceFacts(unsupported.region, new RNG('wood'), unsupported.catalog);
    expect(
      unsupported.region.facts.resources.find((entry) => entry.kind === 'timber')!.availability,
    ).toBe('unknown');
    expect(
      assessSettlementSupply(unsupported.region, unsupported.region.facts.settlementRoles[0]),
    ).toEqual([]);
  });

  it('recognizes known nonwood producers and does not require a fauna catalog to assess timber', () => {
    const { region, catalog } = fixture('clover');
    generateResourceFacts(region, new RNG('wood'), {
      ...catalog,
      ecology: { ...catalog.ecology, species: [] },
    });
    expect(region.facts.resources.find((entry) => entry.kind === 'timber')!.availability).toBe(
      'not-observed',
    );
  });

  it.each([
    'stale',
    'missing-parent',
    'incompatible-role',
    'incompatible-source',
    'incompatible-habitat',
  ])('omits %s producer evidence, regardless of display text', (change) => {
    const { region, catalog } = fixture();
    const tree = region.facts.ecologyInhabitants[0];
    if (change === 'stale') tree.reason!.status = 'stale';
    if (change === 'missing-parent') tree.reason!.sources = [{ kind: 'fact', factId: 'missing' }];
    if (change === 'incompatible-role') tree.roles = ['other'];
    if (change === 'incompatible-source') tree.source = { kind: 'described', label: 'pine tree' };
    if (change === 'incompatible-habitat') region.map.nodes[0].biomeId = 'cold desert';
    generateResourceFacts(region, new RNG('wood'), catalog);
    expect(
      region.facts.resources.some(
        (entry) => entry.kind === 'timber' && ['limited', 'available'].includes(entry.availability),
      ),
    ).toBe(false);
    expect(
      accessibleProcessingResources(region, new Set([1])).some(
        (entry) => entry.resource.major_type === 'wood',
      ),
    ).toBe(false);
  });
});
