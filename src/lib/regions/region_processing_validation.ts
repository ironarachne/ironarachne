import type { RegionMap } from '$lib/map';
import type { RegionFacts } from './region_fact_types';

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const stale = (value: Record<string, unknown>) => object(value.reason)?.status === 'stale';
/** Schema/reference invariants; craft policy and actual reachability belong to generation. */
export function processingFactsError(
  value: Record<string, unknown>,
  map: RegionMap,
  areaIds: Set<string>,
  settlementValid: (value: unknown) => boolean,
): string | null {
  const facts = value as unknown as RegionFacts;
  const land = new Set(
    map.nodes.filter((node) => !node.isWater && !node.isOcean).map((node) => node.id),
  );
  const anchorValid = (value: unknown) => {
    const anchor = object(value);
    return (
      anchor !== null &&
      Array.isArray(anchor.nodeIds) &&
      anchor.nodeIds.length > 0 &&
      anchor.nodeIds.every((id) => land.has(id)) &&
      new Set(anchor.nodeIds).size === anchor.nodeIds.length &&
      Array.isArray(anchor.edgeIds) &&
      new Set(anchor.edgeIds).size === anchor.edgeIds.length &&
      anchor.edgeIds.every((id) => map.edges.some((edge) => edge.id === id))
    );
  };
  for (const raw of value.products as Record<string, unknown>[]) {
    if (
      !text(raw.productKey) ||
      !text(raw.recipeId) ||
      !text(raw.technique) ||
      !strings(raw.requirements) ||
      !strings(raw.areaIds) ||
      !raw.areaIds.every((id) => areaIds.has(id)) ||
      !settlementValid(raw.settlement) ||
      !anchorValid(raw.anchor)
    )
      return 'regional product has invalid identity, requirements or location';
    if (!Array.isArray(raw.inputs) || !raw.inputs.length) return 'regional product has no inputs';
    for (const inputValue of raw.inputs) {
      const input = object(inputValue);
      if (!input || !['material', 'fuel', 'water'].includes(String(input.role)))
        return 'regional product has an invalid input role';
      if (input.kind === 'import') {
        if (!text(input.resourceName) || !text(input.explanation))
          return 'regional product import needs a resource and explanation';
        continue;
      }
      if (input.kind === 'product') {
        const parent = facts.products.find((entry) => entry.id === input.productId);
        const parentTarget = object(parent?.settlement);
        const target = object(raw.settlement)!;
        if (
          !parent ||
          !parentTarget ||
          parentTarget.kind !== target.kind ||
          (parentTarget.kind === 'embedded'
            ? parentTarget.settlementId !== target.settlementId
            : parentTarget.targetId !== target.targetId)
        )
          return 'regional product cites an unknown product or different settlement';
        if (!stale(raw) && parent.reason?.status === 'stale')
          return 'current product cites a stale intermediate';
        continue;
      }
      if (
        input.kind !== 'resource' ||
        !text(input.resourceId) ||
        !strings(input.depositIds) ||
        !anchorValid(input.anchor)
      )
        return 'regional product has an invalid resource input';
      const resource = facts.resources.find((entry) => entry.id === input.resourceId);
      if (!resource || !resource.anchor)
        return 'regional product cites an unknown or unlocated resource';
      const anchor = input.anchor as { nodeIds: number[]; edgeIds: number[] };
      if (
        !anchor.nodeIds.every((id) => resource.anchor!.nodeIds.includes(id)) ||
        !anchor.edgeIds.every((id) => resource.anchor!.edgeIds.includes(id))
      )
        return 'regional product input lies outside its source';
      if (
        !input.depositIds.every((id) => resource.depositIds.includes(id)) ||
        (resource.depositIds.length > 0 && input.depositIds.length === 0)
      )
        return 'regional product has an invalid deposit subset';
      const deposits = facts.resourceDeposits.filter((entry) =>
        (input.depositIds as string[]).includes(entry.id),
      );
      if (
        deposits.some((entry) => entry.concentration === 'trace') ||
        (deposits.length > 0 &&
          !anchor.nodeIds.every((id) =>
            deposits.some((entry) => entry.anchor.nodeIds.includes(id)),
          ))
      )
        return 'regional product cites trace or unrelated deposit evidence';
      if (
        !stale(raw) &&
        (!['available', 'limited'].includes(resource.availability) ||
          resource.reason?.status === 'stale' ||
          deposits.some((entry) => entry.reason?.status === 'stale'))
      )
        return 'current product uses unavailable or stale supply';
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const acyclic = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    const product = facts.products.find((entry) => entry.id === id)!;
    if (!product.inputs.every((input) => input.kind !== 'product' || acyclic(input.productId)))
      return false;
    visiting.delete(id);
    visited.add(id);
    return true;
  };
  return facts.products.every((product) => acyclic(product.id))
    ? null
    : 'regional product chain is cyclic';
}
