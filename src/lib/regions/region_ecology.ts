import type { RNG } from '@ironarachne/rng';
import { BiomeClassifications } from '$lib/environment';
import { allSpecies } from '$lib/species';
import { classifyRegionLandforms, type MapNode } from '$lib/map';
import type Region from './region';
import type { FactSource, HabitatFact, MapNodeFactProperty } from './region_fact_types';
import type { EcologyInhabitantFact } from './region_ecology_types';
import type {
  EcologyCandidate,
  EcologyPatch,
  EcologyRule,
  RegionEcologyCatalog,
} from './region_ecology_rule_types';
import {
  BIOME_ENVIRONMENTS,
  ECOLOGY_LABEL_ALIASES,
  ECOLOGY_RULES,
  PRODUCER_LABELS,
  UNSUPPORTED_ECOLOGY_LABELS,
} from './region_ecology_rules';

const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const labelKey = (label: string) => ECOLOGY_LABEL_ALIASES[label] ?? label;
const between = (value: number, range: [number, number]) => value >= range[0] && value <= range[1];

function observations(node: MapNode): FactSource[] {
  const properties: MapNodeFactProperty[] = [
    'biomeId',
    'temperature',
    'moisture',
    'elevation',
    'isWater',
    'isOcean',
    'isCoast',
  ];
  return properties.map((property) => ({
    kind: 'map-node',
    nodeId: node.id,
    property,
    observedValue: String(node[property]),
  }));
}

function waterSources(region: Pick<Region, 'map'>, node: MapNode, coast = false): FactSource[] {
  const neighbors = region.map.nodes
    .filter((other) => node.neighbors.includes(other.id))
    .sort((a, b) => a.id - b.id);
  if (coast) {
    const ocean = neighbors.find((other) => other.isOcean);
    return node.isCoast && ocean !== undefined ? observations(ocean) : [];
  }
  const river = region.map.edges
    .filter((edge) => edge.river > 0 && (edge.d0 === node.id || edge.d1 === node.id))
    .sort((a, b) => a.id - b.id)[0];
  if (river !== undefined)
    return [
      { kind: 'map-edge', edgeId: river.id, property: 'river', observedValue: String(river.river) },
    ];
  const lake = neighbors.find((other) => other.isWater && !other.isOcean);
  return lake === undefined ? [] : observations(lake);
}

function supportsRule(patch: EcologyPatch, rule: EcologyRule): boolean {
  return (
    rule.environments.some((environment) => patch.environments.includes(environment)) &&
    between(patch.node.temperature, rule.temperature) &&
    between(patch.node.moisture, rule.moisture) &&
    (rule.landforms === undefined || rule.landforms.includes(patch.landform)) &&
    (rule.water === undefined || patch.waterSources.length > 0)
  );
}

/** Use actual biome IDs, never an editable habitat name or regional climate summary. */
function patchesFor(
  region: Pick<Region, 'map'>,
  habitat: HabitatFact,
  catalog: RegionEcologyCatalog,
): EcologyPatch[] {
  const ids = new Set(habitat.anchor?.nodeIds ?? []);
  const landforms = classifyRegionLandforms(region.map).byNodeId;
  return region.map.nodes
    .filter((node) => ids.has(node.id) && !node.isOcean && !node.isWater)
    .sort((a, b) => a.id - b.id)
    .flatMap((node) => {
      // Legacy swamp labels are a deliberate alias for wet land, not an aquatic habitat.
      const biome = catalog.biomes.find(
        (entry) => entry.name === (node.biomeId === 'swamp' ? 'flooded grassland' : node.biomeId),
      );
      if (
        biome === undefined ||
        biome.isAquatic ||
        !between(node.temperature, [biome.temperatureMin, biome.temperatureMax]) ||
        !between(node.moisture, [biome.humidityMin, biome.humidityMax]) ||
        !between(node.elevation, [biome.altitudeMin, biome.altitudeMax])
      )
        return [];
      const landform = landforms.get(node.id)!;
      const environments = [...(BIOME_ENVIRONMENTS[biome.name] ?? [])];
      // The mountain hint requires the shared observed landform, not a montane biome name alone.
      if (landform === 'plain') {
        const index = environments.indexOf('mountain');
        if (index !== -1) environments.splice(index, 1);
      } else environments.push(landform === 'hill' ? 'hill' : 'mountain');
      if (node.isCoast && waterSources(region, node, true).length > 0) environments.push('coastal');
      return [{ node, biome, landform, environments, waterSources: waterSources(region, node) }];
    });
}

function candidatesFor(
  region: Pick<Region, 'map' | 'environment'>,
  habitat: HabitatFact,
  catalog: RegionEcologyCatalog,
): EcologyCandidate[] {
  const candidates = new Map<string, EcologyCandidate>();
  const species = new Map(
    [...catalog.species]
      .sort((a, b) => lexical(a.name, b.name))
      .map((entry) => [entry.name, entry]),
  );
  const add = (
    label: string,
    category: EcologyCandidate['category'],
    patch: EcologyPatch,
    rule?: EcologyRule,
  ) => {
    const name = labelKey(label);
    if (UNSUPPORTED_ECOLOGY_LABELS.has(name)) return;
    const known = species.get(name);
    // Known names require usable species metadata; do not downgrade a contradictory species to prose.
    if (
      known !== undefined &&
      !known.environments.some((environment) => patch.environments.includes(environment))
    )
      return;
    if (rule !== undefined && category !== 'flora' && known === undefined) return;
    if (known !== undefined && category === 'fauna' && !known.creatureTypes.includes('beast'))
      return;
    const source: EcologyCandidate['source'] =
      known === undefined
        ? { kind: 'described', label: name }
        : { kind: 'species', speciesName: name };
    const roles =
      rule?.roles ??
      (category === 'flora' && PRODUCER_LABELS.has(label)
        ? (['producer'] as const)
        : (['other'] as const));
    const key = JSON.stringify([category, source, roles]);
    if (candidates.has(key)) return;
    candidates.set(key, {
      key,
      name,
      source,
      category,
      roles: [...roles],
      description:
        rule?.description ?? `${name} occur in the supported land patches of the listed habitats.`,
      ruleId: `fantasy:region:ecology:${encodeURIComponent(name)}:v1`,
      sources: [
        { kind: 'fact', factId: habitat.id },
        ...observations(patch.node),
        ...(rule?.water === undefined ? [] : patch.waterSources),
        ...(patch.environments.includes('coastal') ? waterSources(region, patch.node, true) : []),
      ],
    });
  };
  for (const patch of patchesFor(region, habitat, catalog)) {
    for (const rule of ECOLOGY_RULES) {
      const floraLabels = [
        ...patch.biome.vegetationTypes,
        ...region.environment.ecosystems.flatMap((ecosystem) => ecosystem.flora),
        ...region.environment.dominantEcosystem.flora,
      ];
      if (rule.category === 'flora' && !floraLabels.some((label) => labelKey(label) === rule.label))
        continue;
      const supported =
        rule.water === 'coast'
          ? { ...patch, waterSources: waterSources(region, patch.node, true) }
          : patch;
      if (supportsRule(supported, rule)) add(rule.label, rule.category, supported, rule);
    }
    for (const [category, labels] of [
      ['flora', patch.biome.vegetationTypes],
      ['fauna', patch.biome.faunaTypes],
    ] as const) {
      for (const label of [...labels].sort(lexical)) {
        // Curated labels cannot bypass stricter water/terrain rules through the generic catalog path.
        if (ECOLOGY_RULES.some((rule) => rule.label === labelKey(label))) continue;
        add(label, category, patch);
      }
    }
  }
  // Ecosystem strings contribute only when a native label or an explicit rule establishes suitability.
  // Unknown strings never inherit the suitability of the whole region or of unrelated catalog labels.
  for (const candidate of candidates.values()) {
    const contains = (ecosystem: Region['environment']['dominantEcosystem']) =>
      (candidate.category === 'flora' ? ecosystem.flora : ecosystem.fauna).some(
        (label) => labelKey(label) === candidate.name,
      );
    if (region.environment.ecosystems.some(contains))
      candidate.sources.push({
        kind: 'environment',
        field: 'ecosystems',
        observedValue: JSON.stringify(region.environment.ecosystems),
      });
    if (contains(region.environment.dominantEcosystem))
      candidate.sources.push({
        kind: 'environment',
        field: 'dominantEcosystem',
        observedValue: JSON.stringify(region.environment.dominantEcosystem),
      });
  }
  return [...candidates.values()].sort((a, b) => lexical(a.key, b.key));
}

/** Bounded occurrences after habitats; never changes map, settlements or upstream RNG streams. */
export function generateEcologyInhabitants(
  region: Pick<Region, 'map' | 'facts' | 'environment'>,
  rng: RNG,
  catalog: RegionEcologyCatalog = { species: allSpecies, biomes: BiomeClassifications.getAll() },
): void {
  const facts = region.facts!;
  const zones = new Set(
    facts.areas.filter((area) => area.id.startsWith('area:habitat-zone:')).map((area) => area.id),
  );
  const habitats = facts.habitats
    .filter((habitat) => habitat.areaIds.some((id) => zones.has(id)))
    .sort(
      (a, b) =>
        (b.anchor?.nodeIds.length ?? 0) - (a.anchor?.nodeIds.length ?? 0) || lexical(a.id, b.id),
    )
    .slice(0, 4);
  const selected = new Map<string, EcologyInhabitantFact>();
  const fantasyKeys = new Set<string>();
  for (const habitat of habitats) {
    const candidates = candidatesFor(region, habitat, catalog);
    const flora = rng.shuffle(candidates.filter((entry) => entry.category === 'flora')).slice(0, 2);
    const fantasy = rng
      .shuffle(
        candidates.filter(
          (entry) =>
            entry.category === 'fantastical' &&
            (fantasyKeys.has(entry.key) || fantasyKeys.size < 2),
        ),
      )
      .slice(0, 1);
    const fauna = rng
      .shuffle(candidates.filter((entry) => entry.category === 'fauna'))
      .slice(0, 3 - fantasy.length);
    for (const candidate of [...flora, ...fauna, ...fantasy]) {
      if (candidate.category === 'fantastical') fantasyKeys.add(candidate.key);
      const existing = selected.get(candidate.key);
      if (existing !== undefined) {
        existing.habitatIds.push(habitat.id);
        existing.reason!.sources.push(...candidate.sources);
      } else
        selected.set(candidate.key, {
          id: `inhabitant:${candidate.category}:${encodeURIComponent(candidate.name)}`,
          name: candidate.name,
          description: candidate.description,
          origin: 'generated',
          source: candidate.source,
          category: candidate.category,
          roles: candidate.roles,
          habitatIds: [habitat.id],
          reason: { ruleId: candidate.ruleId, status: 'current', sources: candidate.sources },
        });
    }
  }
  facts.ecologyInhabitants.push(
    ...[...selected.values()]
      .sort((a, b) => lexical(a.id, b.id))
      .map((entry) => ({
        ...entry,
        habitatIds: entry.habitatIds.sort(lexical),
        reason: {
          ...entry.reason!,
          sources: [
            ...new Map(
              entry.reason!.sources.map((source) => [JSON.stringify(source), source]),
            ).values(),
          ],
        },
      })),
  );
}
