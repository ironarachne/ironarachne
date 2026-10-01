import type { RegionMap } from '$lib/map';
import { depositKinds } from './region_resource_constants';
import type { RegionFacts } from './region_fact_types';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const oneOf = (value: unknown, allowed: readonly string[]) =>
  typeof value === 'string' && allowed.includes(value);
const processes = [
  'intrusive',
  'volcanic',
  'volcanic-pipe',
  'metamorphic',
  'hydrothermal',
  'sedimentary',
  'placer',
  'evaporite',
  'organic-sedimentary',
  'petroleum',
];

/** Structure and same-snapshot links only; catalog occurrence compatibility belongs to generation. */
export function resourceFactsError(
  facts: Record<string, unknown>,
  map: RegionMap,
  areaIds: Set<string>,
): string | null {
  const land = new Set(
    map.nodes.filter((node) => !node.isWater && !node.isOcean).map((node) => node.id),
  );
  const anchorValid = (value: unknown): boolean => {
    const anchor = object(value);
    return (
      anchor !== null &&
      Array.isArray(anchor.nodeIds) &&
      anchor.nodeIds.length > 0 &&
      anchor.nodeIds.every((id) => Number.isInteger(id) && land.has(id)) &&
      new Set(anchor.nodeIds).size === anchor.nodeIds.length &&
      Array.isArray(anchor.edgeIds) &&
      anchor.edgeIds.every((id) => map.edges.some((edge) => edge.id === id))
    );
  };
  for (const value of facts.geology as unknown[]) {
    const province = object(value)!;
    const setting = object(province.setting);
    if (
      !strings(province.areaIds) ||
      !province.areaIds.length ||
      !province.areaIds.every((id) => areaIds.has(id)) ||
      !anchorValid(province.anchor)
    )
      return 'region geology has an invalid location';
    if (
      !setting ||
      !strings(setting.hostRocks) ||
      !strings(setting.processes) ||
      !setting.processes.every((process) => processes.includes(process))
    )
      return 'region geology has an invalid setting';
    if (setting.petroleum !== undefined) {
      const petroleum = object(setting.petroleum);
      if (
        !petroleum ||
        !text(petroleum.sourceRock) ||
        !text(petroleum.reservoirRock) ||
        !text(petroleum.sealRock) ||
        ![petroleum.sourceRock, petroleum.reservoirRock, petroleum.sealRock].every((rock) =>
          (setting.hostRocks as string[]).includes(rock),
        ) ||
        !oneOf(petroleum.maturity, ['immature', 'oil-window', 'gas-window']) ||
        typeof petroleum.trapped !== 'boolean' ||
        !setting.processes.includes('petroleum')
      )
        return 'region geology has an invalid petroleum system';
    }
  }
  const typed = facts as unknown as RegionFacts;
  for (const value of facts.resourceDeposits as unknown[]) {
    const deposit = object(value)!;
    const province = typed.geology.find((entry) => entry.id === deposit.geologyId);
    if (
      !province ||
      !anchorValid(deposit.anchor) ||
      !(deposit.anchor as { nodeIds: number[] }).nodeIds.every((id) =>
        province.anchor.nodeIds.includes(id),
      )
    )
      return 'region deposit has an invalid province or location';
    if (
      !text(deposit.resourceName) ||
      !oneOf(deposit.category, Object.keys(depositKinds)) ||
      !oneOf(deposit.concentration, ['trace', 'workable', 'rich']) ||
      !oneOf(deposit.exposure, ['surface', 'shallow', 'deep']) ||
      !oneOf(deposit.extraction, ['gathering', 'quarrying', 'mining', 'drilling'])
    )
      return 'region deposit has invalid material or extraction metadata';
    if (
      (deposit.extraction === 'drilling' && deposit.exposure === 'surface') ||
      (['gathering', 'quarrying'].includes(String(deposit.extraction)) &&
        deposit.exposure !== 'surface') ||
      (['oil', 'gas'].includes(String(deposit.category)) && deposit.extraction !== 'drilling')
    )
      return 'region deposit exposure contradicts extraction';
  }
  for (const value of facts.resources as unknown[]) {
    const resource = object(value)!;
    if (
      !oneOf(resource.availability, ['available', 'limited', 'not-observed', 'unknown']) ||
      !strings(resource.depositIds)
    )
      return 'region resource has invalid availability or deposits';
    const deposits = typed.resourceDeposits.filter((entry) =>
      (resource.depositIds as string[]).includes(entry.id),
    );
    if (
      deposits.length !== resource.depositIds.length ||
      deposits.some((entry) => depositKinds[entry.category] !== resource.kind)
    )
      return 'region resource cites an unknown or mismatched deposit';
    if (resource.catalogSource !== undefined) {
      const source = object(resource.catalogSource);
      if (
        !source ||
        !oneOf(source.kind, ['building-material', 'species-product', 'geological-resource']) ||
        !text(source.resourceName) ||
        (source.kind === 'species-product' && !text(source.speciesName))
      )
        return 'region resource has an invalid catalog source';
      if (deposits.length && source.kind !== 'geological-resource')
        return 'geological resource has a non-geological catalog source';
      if (deposits.some((entry) => entry.resourceName !== source.resourceName))
        return 'region resource catalog disagrees with its deposit';
    }
    if (
      ['available', 'limited'].includes(String(resource.availability)) &&
      Object.values(depositKinds).some((kind) => kind === resource.kind) &&
      (!deposits.length || deposits.some((entry) => entry.concentration === 'trace'))
    )
      return 'usable geological resource requires workable deposits';
  }
  return null;
}
