import type { RNG } from '@ironarachne/rng';
import { BiomeClassifications } from '$lib/environment';
import { allSpecies } from '$lib/species';
import {
  deriveResourcesFromSpecies,
  getBuildingMaterialResources,
  getGeologicalResources,
  supportsGeologicalResource,
} from '$lib/resources';
import type { MapNode } from '$lib/map';
import type Region from './region';
import type { FactBase, FactSource, ResourceFact, ResourceKind } from './region_fact_types';
import type { RegionResourceCatalog, ResourceCandidate } from './region_resource_rule_types';
import { ecologyCandidatesFor } from './region_ecology';
import { depositKinds, resourceKinds } from './region_resource_constants';

const current = (fact: FactBase) => fact.reason?.status !== 'stale';
const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const reference = (factId: string): FactSource => ({ kind: 'fact', factId });
const positive = (fact: ResourceFact) => ['available', 'limited'].includes(fact.availability);
export { positive as isUsableRegionResource };
function observations(node: MapNode): FactSource[] {
  return (['elevation', 'temperature', 'moisture', 'biomeId', 'isWater', 'isOcean'] as const).map(
    (property) => ({
      kind: 'map-node',
      nodeId: node.id,
      property,
      observedValue: String(node[property]),
    }),
  );
}
function base(
  region: Pick<Region, 'facts'>,
  kind: ResourceKind,
  name: string,
  nodeIds: number[],
  habitatIds: string[] = [],
): ResourceFact {
  return {
    id: `resource:${kind}:${encodeURIComponent(name)}`,
    kind,
    name,
    description: '',
    origin: 'generated',
    availability: 'limited',
    depositIds: [],
    habitatIds: [...habitatIds].sort(),
    areaIds: region
      .facts!.areas.filter((area) => area.mapNodeIds.some((id) => nodeIds.includes(id)))
      .map((area) => area.id)
      .sort(),
    anchor: { nodeIds: [...nodeIds].sort((a, b) => a - b), edgeIds: [] },
  };
}

function generateDeposits(
  region: Pick<Region, 'map' | 'facts'>,
  rng: RNG,
  catalog: RegionResourceCatalog,
): void {
  const facts = region.facts!;
  for (const province of [...facts.geology].filter(current).sort((a, b) => lexical(a.id, b.id))) {
    const nodes = province.anchor.nodeIds
      .filter((id) =>
        region.map.nodes.some((node) => node.id === id && !node.isWater && !node.isOcean),
      )
      .sort((a, b) => a - b);
    if (!nodes.length) continue;
    const eligible = [...catalog.geology]
      .filter((entry) => supportsGeologicalResource(province.setting, entry))
      .sort((a, b) => lexical(a.resource.name, b.resource.name));
    const remaining = [...eligible];
    const count = remaining.length ? rng.int(0, Math.min(3, remaining.length)) : 0;
    for (let i = 0; i < count; i++) {
      const chosen = rng.weighted(
        remaining.map((entry) => ({
          value: entry,
          commonality: Math.max(1, entry.resource.commonality),
        })),
      );
      remaining.splice(remaining.indexOf(chosen), 1);
      if (!chosen.extractionMethods.length) continue;
      const extraction = rng.item([...chosen.extractionMethods]);
      const concentration = rng.item(['trace', 'workable', 'workable', 'rich'] as const);
      const exposure =
        extraction === 'drilling'
          ? rng.item(['shallow', 'deep'] as const)
          : extraction === 'gathering' || extraction === 'quarrying'
            ? 'surface'
            : rng.item(['surface', 'shallow', 'deep'] as const);
      const nodeId = rng.item(nodes);
      const node = region.map.nodes.find((entry) => entry.id === nodeId)!;
      facts.resourceDeposits.push({
        id: `deposit:${encodeURIComponent(province.id)}:${encodeURIComponent(chosen.resource.name)}`,
        name: `${chosen.resource.name} occurrence`,
        description: `${concentration === 'trace' ? 'Trace presence, without a modeled usable deposit' : `A ${concentration} concentration`} of ${chosen.resource.name}; ${exposure} exposure requiring ${extraction}.`,
        origin: 'generated',
        geologyId: province.id,
        resourceName: chosen.resource.name,
        category: chosen.category,
        concentration,
        exposure,
        extraction,
        anchor: { nodeIds: [nodeId], edgeIds: [] },
        reason: {
          ruleId: 'fantasy:region:geological-deposit:v1',
          status: 'current',
          sources: [reference(province.id), ...observations(node)],
        },
      });
    }
  }
}

function geologicalCandidates(region: Pick<Region, 'facts'>): ResourceCandidate[] {
  const grouped = new Map<string, ResourceCandidate>();
  for (const deposit of region
    .facts!.resourceDeposits.filter(current)
    .sort((a, b) => lexical(a.id, b.id))) {
    const supportingProvince = region.facts!.geology.find(
      (entry) => entry.id === deposit.geologyId,
    );
    if (deposit.concentration === 'trace' || !supportingProvince || !current(supportingProvince))
      continue;
    const kind = depositKinds[deposit.category];
    const key = JSON.stringify([kind, deposit.resourceName]);
    const candidate = grouped.get(key) ?? {
      fact: base(region, kind, deposit.resourceName, []),
      sources: [],
      supportIds: new Set<string>(),
    };
    candidate.fact.catalogSource = {
      kind: 'geological-resource',
      resourceName: deposit.resourceName,
    };
    candidate.fact.depositIds.push(deposit.id);
    candidate.fact.anchor!.nodeIds.push(...deposit.anchor.nodeIds);
    const province = region.facts!.geology.find((entry) => entry.id === deposit.geologyId)!;
    candidate.fact.areaIds.push(...province.areaIds);
    candidate.sources.push(reference(deposit.id), reference(province.id));
    candidate.supportIds.add(deposit.id);
    if (deposit.concentration === 'rich') candidate.fact.availability = 'available';
    const extraction = new Set(
      candidate.fact.depositIds.map(
        (id) => region.facts!.resourceDeposits.find((entry) => entry.id === id)!.extraction,
      ),
    );
    candidate.fact.description = `Potential raw ${deposit.resourceName} from saved deposits; requires ${[...extraction].sort().join(' or ')}. No current industry or extraction technology is implied.`;
    grouped.set(key, candidate);
  }
  return [...grouped.values()];
}

function waterCandidates(region: Pick<Region, 'facts' | 'map'>): ResourceCandidate[] {
  const land = region.map.nodes
    .filter((node) => !node.isWater && !node.isOcean)
    .sort((a, b) => a.id - b.id);
  const results: ResourceCandidate[] = [];
  for (const edge of [...region.map.edges]
    .filter((edge) => edge.river > 0)
    .sort((a, b) => a.id - b.id)) {
    const node = land.find((node) => node.id === edge.d0 || node.id === edge.d1);
    if (!node) continue;
    const fact = base(region, 'freshwater', 'River water', [node.id]);
    fact.id = 'resource:freshwater';
    fact.anchor!.edgeIds = [edge.id];
    fact.description =
      'A river on the saved map provides a freshwater source; drinking-water purity is not established.';
    results.push({
      fact,
      supportIds: new Set([`river:${edge.id}`]),
      sources: [
        ...fact.areaIds.map(reference),
        { kind: 'map-edge', edgeId: edge.id, property: 'river', observedValue: String(edge.river) },
      ],
    });
    break;
  }
  for (const lake of [...region.map.nodes]
    .filter((node) => node.isWater && !node.isOcean)
    .sort((a, b) => a.id - b.id)) {
    const node = land.find(
      (node) => node.neighbors.includes(lake.id) || lake.neighbors.includes(node.id),
    );
    if (!node) continue;
    const fact = base(region, 'freshwater', 'Lake water', [node.id, lake.id]);
    fact.description =
      'A non-ocean lake adjoining regional land provides potential freshwater; water purity is not established.';
    results.push({
      fact,
      supportIds: new Set([`lake:${lake.id}`]),
      sources: [...fact.areaIds.map(reference), ...observations(lake)],
    });
    break;
  }
  return results;
}

function organicCandidates(
  region: Pick<Region, 'map' | 'facts' | 'environment'>,
  catalog: RegionResourceCatalog,
): ResourceCandidate[] {
  const grouped = new Map<string, ResourceCandidate>();
  const facts = region.facts!;
  const zones = new Set(
    facts.areas.filter((area) => area.id.startsWith('area:habitat-zone:')).map((area) => area.id),
  );
  const habitats = facts.habitats
    .filter((habitat) => current(habitat) && habitat.areaIds.some((id) => zones.has(id)))
    .sort(
      (a, b) =>
        (b.anchor?.nodeIds.length ?? 0) - (a.anchor?.nodeIds.length ?? 0) || lexical(a.id, b.id),
    )
    .slice(0, 4);
  const add = (
    kind: ResourceKind,
    name: string,
    habitatId: string,
    nodeIds: number[],
    sources: FactSource[],
    catalogSource?: ResourceFact['catalogSource'],
  ) => {
    const key = JSON.stringify([kind, name, catalogSource]);
    const candidate = grouped.get(key) ?? {
      fact: base(region, kind, name, [], []),
      sources: [],
      supportIds: new Set<string>(),
    };
    candidate.fact.id = `resource:${kind}:${encodeURIComponent(key)}`;
    candidate.fact.habitatIds.push(habitatId);
    candidate.fact.anchor!.nodeIds.push(...nodeIds);
    candidate.fact.areaIds.push(...base(region, kind, name, nodeIds).areaIds);
    candidate.fact.catalogSource = catalogSource;
    candidate.fact.description = `Potential raw ${name} from locally supported sources; no cultivated crop, domestication or sustainable yield is implied.`;
    candidate.sources.push(reference(habitatId), ...sources);
    candidate.supportIds.add(habitatId);
    grouped.set(key, candidate);
  };
  const trees = new Set([
    'oak',
    'pine',
    'birch',
    'maple',
    'spruce',
    'fir',
    'cedar',
    'beech',
    'willow',
    'cypress',
    'mangrove',
  ]);
  for (const habitat of habitats) {
    const candidates = ecologyCandidatesFor(region, habitat, catalog.ecology);
    for (const inhabitant of facts.ecologyInhabitants
      .filter(current)
      .filter((entry) => entry.habitatIds.includes(habitat.id))) {
      const support = candidates.find(
        (entry) =>
          entry.category === inhabitant.category &&
          JSON.stringify(entry.source) === JSON.stringify(inhabitant.source) &&
          JSON.stringify([...entry.roles].sort()) === JSON.stringify([...inhabitant.roles].sort()),
      );
      if (!support) continue;
      const nodeIds = [...support.nodeSources.keys()].sort((a, b) => a - b);
      const sources = [reference(inhabitant.id), ...[...support.nodeSources.values()].flat()];
      if (inhabitant.category === 'flora' && inhabitant.roles.includes('producer')) {
        const treeName = support.name.replace(/ tree$/, '');
        if (trees.has(treeName)) {
          const name = `${treeName} timber`;
          const known = catalog.buildingMaterials.find((entry) => entry.name === name);
          add(
            'timber',
            name,
            habitat.id,
            nodeIds,
            sources,
            known ? { kind: 'building-material', resourceName: known.name } : undefined,
          );
        }
        if (['reeds', 'papyrus'].includes(support.name))
          add('fiber', `${support.name} stems`, habitat.id, nodeIds, sources);
      }
      if (inhabitant.category !== 'fauna' || inhabitant.source.kind !== 'species') continue;
      const speciesName = inhabitant.source.speciesName;
      const species = catalog.ecology.species.find((entry) => entry.name === speciesName);
      if (!species) continue;
      for (const product of deriveResourcesFromSpecies(species)) {
        const food = ['red_meat', 'reptile_meat', 'poultry', 'insect_meat', 'fish'].includes(
          product.minor_type,
        );
        add(
          food ? (product.minor_type === 'fish' ? 'fish' : 'food') : 'animal-material',
          product.name,
          habitat.id,
          nodeIds,
          sources,
          { kind: 'species-product', speciesName: species.name, resourceName: product.name },
        );
      }
    }
    const suitable = region.map.nodes.filter(
      (node) =>
        habitat.anchor?.nodeIds.includes(node.id) &&
        !node.isWater &&
        !node.isOcean &&
        node.elevation >= 0 &&
        node.elevation <= 0.4 &&
        node.temperature >= 5 &&
        node.temperature <= 30 &&
        node.moisture >= 0.3 &&
        node.moisture <= 0.8 &&
        /grassland|savanna|plains|prairie/i.test(node.biomeId ?? ''),
    );
    if (
      suitable.length &&
      region.environment.terrain.geologicalMakeup.soilTypes.some((soil) =>
        ['loam', 'silt', 'clay'].includes(soil),
      )
    )
      add(
        'arable-land',
        'Potential cultivation ground',
        habitat.id,
        suitable.map((node) => node.id),
        [
          ...suitable.flatMap(observations),
          {
            kind: 'environment',
            field: 'terrain',
            observedValue: JSON.stringify(region.environment.terrain),
          },
        ],
      );
  }
  return [...grouped.values()];
}

/** Inventory is generated before habitation; saved reads never call this pass. */
export function generateResourceFacts(
  region: Pick<Region, 'map' | 'facts' | 'environment'>,
  rng: RNG,
  catalog: RegionResourceCatalog = {
    geology: getGeologicalResources(),
    ecology: { species: allSpecies, biomes: BiomeClassifications.getAll() },
    buildingMaterials: getBuildingMaterialResources(),
  },
): void {
  const facts = region.facts;
  if (!facts || !facts.areas.some((area) => current(area) && area.mapNodeIds.length)) return;
  generateDeposits(region, rng, catalog);
  const candidates = [
    ...waterCandidates(region),
    ...geologicalCandidates(region),
    ...organicCandidates(region, catalog),
  ];
  for (const kind of resourceKinds) {
    const eligible = candidates
      .filter((entry) => entry.fact.kind === kind)
      .sort((a, b) => lexical(a.fact.id, b.fact.id));
    if (eligible.length) {
      const selected: ResourceCandidate[] = [];
      // Keep the stable primary river source when present; random choices select other sources.
      const primary = eligible.find((entry) => entry.fact.id === 'resource:freshwater');
      if (primary) {
        selected.push(primary);
        eligible.splice(eligible.indexOf(primary), 1);
      }
      while (eligible.length && selected.length < 3) {
        const entry = rng.item(eligible);
        selected.push(entry);
        eligible.splice(eligible.indexOf(entry), 1);
      }
      for (const { fact, sources, supportIds } of selected) {
        if (supportIds.size > 1) fact.availability = 'available';
        fact.areaIds = [...new Set(fact.areaIds)].sort();
        fact.habitatIds = [...new Set(fact.habitatIds)].sort();
        fact.anchor!.nodeIds = [...new Set(fact.anchor!.nodeIds)].sort((a, b) => a - b);
        const uniqueSources = [
          ...new Map(sources.map((source) => [JSON.stringify(source), source])).values(),
        ];
        fact.reason = {
          ruleId:
            fact.id === 'resource:freshwater'
              ? 'fantasy:region:river-water:v1'
              : 'fantasy:region:raw-resource:v1',
          status: 'current',
          sources: uniqueSources,
        };
        facts.resources.push(fact);
      }
      continue;
    }
    const geological = ['stone', 'ore', 'gemstone', 'geological-material', 'oil', 'gas'].includes(
      kind,
    );
    const deposits = facts.resourceDeposits.filter(
      (deposit) => depositKinds[deposit.category] === kind,
    );
    const evidence = geological
      ? [...facts.geology, ...deposits]
      : [...facts.habitats, ...facts.ecologyInhabitants];
    const covered = region.map.nodes
      .filter((node) => !node.isWater && !node.isOcean)
      .every((node) =>
        facts.geology.some(
          (province) => current(province) && province.anchor.nodeIds.includes(node.id),
        ),
      );
    const known = geological
      ? covered &&
        facts.geology.length > 0 &&
        catalog.geology.some((entry) => depositKinds[entry.category] === kind)
      : kind === 'freshwater' ||
        (catalog.ecology.biomes.length > 0 &&
          facts.habitats.length > 0 &&
          (kind === 'arable-land' || catalog.ecology.species.length > 0));
    const availability = known && evidence.every(current) ? 'not-observed' : 'unknown';
    facts.resources.push({
      id: `resource:assessment:${kind}`,
      kind,
      name: `${kind} assessment`,
      origin: 'generated',
      availability,
      depositIds: deposits.map((deposit) => deposit.id).sort(),
      areaIds: facts.areas
        .filter(current)
        .map((area) => area.id)
        .sort(),
      habitatIds: [],
      description:
        availability === 'unknown'
          ? `Usable ${kind} sources cannot be established from the current evidence and catalogs.`
          : `No usable ${kind} source was selected in the modeled region${deposits.length ? '; recorded trace occurrences are not usable deposits' : ''}. This does not exclude unmodeled sources.`,
      reason: {
        ruleId: 'fantasy:region:resource-assessment:v1',
        status: 'current',
        sources: [
          ...facts.areas.filter(current).map((area) => reference(area.id)),
          ...evidence.sort((a, b) => lexical(a.id, b.id)).map((entry) => reference(entry.id)),
        ],
      },
    });
  }
}
