import { isRawResourceSnapshot } from '$lib/resources';
import type { RegionMap } from '$lib/map';
import type { RegionFacts } from './region_fact_types';
import type { RegionSemanticFact } from './region_resource_types';
import { regionFactTargets } from './region_resource_editing';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const oneOf = (value: unknown, choices: string[]) => choices.includes(String(value));

/** Structure and same-save evidence only; no live ecological or food catalog lookup. */
export function rawSourceFactsError(
  value: Record<string, unknown>,
  map: RegionMap,
  areaIds: Set<string>,
  settlementValid: (value: unknown) => boolean,
): string | null {
  const facts = value as unknown as RegionFacts;
  const habitatIds = new Set(facts.habitats.map((entry) => entry.id));
  const land = new Map(
    map.nodes.filter((node) => !node.isWater && !node.isOcean).map((node) => [node.id, node]),
  );
  const location = (raw: Record<string, unknown>) => {
    const anchor = object(raw.anchor);
    return (
      strings(raw.areaIds) &&
      raw.areaIds.length > 0 &&
      raw.areaIds.every((id) => areaIds.has(id)) &&
      strings(raw.habitatIds) &&
      raw.habitatIds.every((id) => habitatIds.has(id)) &&
      anchor !== null &&
      Array.isArray(anchor.nodeIds) &&
      anchor.nodeIds.length > 0 &&
      anchor.nodeIds.every((id) => Number.isInteger(id) && land.has(id)) &&
      new Set(anchor.nodeIds).size === anchor.nodeIds.length &&
      Array.isArray(anchor.edgeIds) &&
      anchor.edgeIds.every(
        (id) => Number.isInteger(id) && map.edges.some((edge) => edge.id === id),
      ) &&
      new Set(anchor.edgeIds).size === anchor.edgeIds.length
    );
  };
  for (const raw of value.managedProduction as Record<string, unknown>[]) {
    const producer = object(raw.producer);
    if (
      !producer ||
      !(producer.kind === 'plant'
        ? text(producer.plantId)
        : producer.kind === 'species' && text(producer.speciesName)) ||
      !oneOf(raw.mode, ['cultivation', 'husbandry', 'apiary']) ||
      !text(raw.productionRuleId) ||
      !settlementValid(raw.settlement) ||
      !location(raw) ||
      !strings(raw.supportingResourceIds) ||
      !strings(raw.supportingInhabitantIds)
    )
      return 'managed production has invalid identity, support or location';
    if ((raw.mode === 'cultivation') !== (producer.kind === 'plant'))
      return 'managed production mode contradicts its producer';
    for (const id of raw.supportingResourceIds) {
      const resource = facts.resources.find((entry) => entry.id === id);
      if (
        !resource ||
        !['available', 'limited'].includes(resource.availability) ||
        resource.sourceIds?.some(
          (sourceId) =>
            facts.resourceSources.find((source) => source.id === sourceId)?.source.kind ===
            'managed',
        )
      )
        return 'managed production needs unmanaged resource support';
    }
    if (
      !raw.supportingInhabitantIds.every((id) =>
        facts.ecologyInhabitants.some(
          (entry) =>
            entry.id === id && entry.category === 'flora' && entry.roles.includes('producer'),
        ),
      )
    )
      return 'managed production has invalid forage support';
  }
  for (const raw of value.resourceSources as Record<string, unknown>[]) {
    const origin = object(raw.source);
    if (
      !text(raw.definitionId) ||
      !isRawResourceSnapshot(raw.resource) ||
      !strings(raw.requirements) ||
      !location(raw) ||
      !oneOf(raw.method, [
        'gathering',
        'cutting',
        'hunting',
        'fishing',
        'shellfish-collection',
        'shearing',
        'milking',
        'egg-collection',
        'colony-harvest',
        'slaughtering',
        'quarrying',
        'mining',
        'drilling',
      ]) ||
      !oneOf(raw.availability, ['available', 'limited', 'unknown', 'not-observed']) ||
      !origin ||
      !Array.isArray(raw.waterSources)
    )
      return 'resource source has invalid metadata';
    if (origin.kind === 'wild') {
      const inhabitant = facts.ecologyInhabitants.find((entry) => entry.id === origin.inhabitantId);
      if (
        !inhabitant ||
        !(raw.habitatIds as string[]).every((id) => inhabitant.habitatIds.includes(id))
      )
        return 'wild source needs its saved inhabitant';
      if (raw.method === 'colony-harvest' && inhabitant.occurrenceForm !== 'colony')
        return 'wild colony harvest needs a saved colony';
      if (['milking', 'shearing', 'egg-collection', 'slaughtering'].includes(String(raw.method)))
        return 'wild presence cannot support managed harvesting';
    } else if (origin.kind === 'managed') {
      const production = facts.managedProduction.find((entry) => entry.id === origin.productionId);
      if (
        !production ||
        !(raw.anchor as { nodeIds: number[] }).nodeIds.every((id) =>
          production.anchor.nodeIds.includes(id),
        )
      )
        return 'managed source needs its located production';
    } else if (origin.kind === 'deposit') {
      const deposit = facts.resourceDeposits.find((entry) => entry.id === origin.depositId);
      if (
        !deposit ||
        deposit.resourceName !== raw.resource.name ||
        raw.method !== deposit.extraction ||
        !(raw.anchor as { nodeIds: number[] }).nodeIds.every((id) =>
          deposit.anchor.nodeIds.includes(id),
        )
      )
        return 'deposit source has invalid evidence';
      if (
        ['available', 'limited'].includes(String(raw.availability)) &&
        deposit.concentration === 'trace'
      )
        return 'trace deposit is not usable raw supply';
    } else return 'resource source has an unknown origin';
    for (const waterValue of raw.waterSources) {
      const water = object(waterValue);
      if (!water) return 'resource source has invalid water evidence';
      const nodes = (raw.anchor as { nodeIds: number[] }).nodeIds;
      if (water.kind === 'river') {
        const edge = map.edges.find((entry) => entry.id === water.edgeId && entry.river > 0);
        if (!edge || !nodes.some((id) => id === edge.d0 || id === edge.d1))
          return 'source river does not adjoin land access';
      } else {
        const node = map.nodes.find((entry) => entry.id === water.nodeId);
        if (
          !node ||
          (water.kind === 'ocean'
            ? !node.isOcean
            : water.kind !== 'lake' || !node.isWater || node.isOcean) ||
          !nodes.some(
            (id) => land.get(id)!.neighbors.includes(node.id) || node.neighbors.includes(id),
          )
        )
          return 'source water does not adjoin land access';
      }
    }
  }
  const claimed = new Set<string>();
  for (const resource of facts.resources) {
    if (resource.sourceIds === undefined) continue;
    if (
      !strings(resource.sourceIds) ||
      resource.sourceIds.length > 4 ||
      resource.catalogSource?.kind !== 'raw-resource'
    )
      return 'resource summary has invalid source membership';
    if (['available', 'limited'].includes(resource.availability) && !resource.sourceIds.length)
      return 'usable keyed resource needs a retained source';
    for (const id of resource.sourceIds) {
      const source = facts.resourceSources.find((entry) => entry.id === id);
      if (!source || claimed.has(id) || source.resource.id !== resource.catalogSource.resourceId)
        return 'resource summary cites missing, duplicate or mismatched supply';
      claimed.add(id);
    }
    const deposits = resource.sourceIds
      .flatMap((id) => {
        const origin = facts.resourceSources.find((entry) => entry.id === id)!.source;
        return origin.kind === 'deposit' ? [origin.depositId] : [];
      })
      .sort();
    if (JSON.stringify([...resource.depositIds].sort()) !== JSON.stringify([...new Set(deposits)]))
      return 'resource deposit projection disagrees with source origins';
  }
  if (facts.resourceSources.some((entry) => !claimed.has(entry.id)))
    return 'resource source has no inventory summary';
  const all = Object.values(facts).filter(Array.isArray).flat() as RegionSemanticFact[];
  const byId = new Map(all.map((entry) => [entry.id, entry]));
  const visit = (id: string, path: Set<string>): boolean => {
    if (path.has(id)) return false;
    const entry = byId.get(id);
    if (!entry) return false;
    const next = new Set(path);
    next.add(id);
    const links = [
      ...regionFactTargets(entry),
      ...(entry.reason?.sources ?? []).flatMap((source) =>
        source.kind === 'fact' ? [source.factId] : [],
      ),
    ];
    return links.every((link) => visit(link, next));
  };
  return [...facts.managedProduction, ...facts.resourceSources].every((entry) =>
    visit(entry.id, new Set()),
  )
    ? null
    : 'resource production evidence is missing or cyclic';
}
