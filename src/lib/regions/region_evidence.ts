import type Region from './region';
import type { FactBase, RegionFacts } from './region_fact_types';
import type { RegionSemanticFact } from './region_resource_types';

/** Index and memoize one immutable read operation, never cache across edits or saves. */
export function createProcessingEvidenceChecker(facts: RegionFacts) {
  const entries = new Map(
    (Object.values(facts).filter(Array.isArray).flat() as RegionSemanticFact[]).map((entry) => [
      entry.id,
      entry,
    ]),
  );
  const checked = new Map<FactBase, boolean>();
  const check = (fact: FactBase, visiting = new Set<string>()): boolean => {
    if (fact.reason?.status === 'stale' || visiting.has(fact.id)) return false;
    const cached = checked.get(fact);
    if (cached !== undefined) return cached;
    const next = new Set(visiting).add(fact.id);
    const selected = sourceSpecificSummaryIds(fact);
    const current = (fact.reason?.sources ?? [])
      .filter((source) => source.kind !== 'fact' || !selected.has(source.factId))
      .every((source) => {
        if (source.kind !== 'fact') return true;
        const parent = entries.get(source.factId);
        return parent !== undefined && check(parent, next);
      });
    checked.set(fact, current);
    return current;
  };
  return check;
}
/** Follow stored evidence so stale upstream facts cannot quietly support a new product. */
export function processingEvidenceCurrent(
  fact: FactBase,
  facts: RegionFacts,
  visiting = new Set<string>(),
): boolean {
  return createProcessingEvidenceChecker(facts)(fact, visiting);
}
/**
 * Coarse potential overland access: the entire dry-land connected component.
 * No radius, travel distance, transport or usable quantity is established, even for neighbors.
 * See docs/region-processing.md's access and wording contract.
 */
export function reachableProcessingNodes(region: Pick<Region, 'map'>, start: number): Set<number> {
  const land = new Map(
    region.map.nodes
      .filter((node) => !node.isWater && !node.isOcean)
      .map((node) => [node.id, node]),
  );
  const reached = new Set<number>();
  const queue = land.has(start) ? [start] : [];
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index];
    if (reached.has(id)) continue;
    reached.add(id);
    for (const neighbor of [...land.get(id)!.neighbors].sort((a, b) => a - b))
      if (land.has(neighbor) && !reached.has(neighbor)) queue.push(neighbor);
  }
  return reached;
}

/** A chosen supply carries its own evidence; another source in its summary cannot poison it. */
export function sourceSpecificSummaryIds(fact: FactBase): Set<string> {
  const inputs =
    'inputs' in fact && Array.isArray(fact.inputs)
      ? (fact.inputs as { kind: string; resourceId?: string; sourceId?: string }[])
      : 'support' in fact &&
          typeof fact.support === 'object' &&
          fact.support !== null &&
          'inputs' in fact.support &&
          Array.isArray(fact.support.inputs)
        ? (fact.support.inputs as { kind: string; resourceId?: string; sourceId?: string }[])
        : [];
  return new Set(
    inputs
      .filter((input) => input.kind === 'resource' && input.sourceId)
      .map((input) => input.resourceId!),
  );
}
export function selectedResourceCurrent(
  facts: RegionFacts,
  resourceId: string,
  sourceId?: string,
  current = createProcessingEvidenceChecker(facts),
): boolean {
  const resource = facts.resources.find((entry) => entry.id === resourceId);
  if (!resource || !['available', 'limited'].includes(resource.availability)) return false;
  if (!sourceId) return !resource.sourceIds && current(resource);
  const source = facts.resourceSources.find((entry) => entry.id === sourceId);
  return (
    !!source &&
    !!resource.sourceIds?.includes(sourceId) &&
    ['available', 'limited'].includes(source.availability) &&
    current(source)
  );
}
