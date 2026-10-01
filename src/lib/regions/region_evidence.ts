import type Region from './region';
import type { FactBase, RegionFacts } from './region_fact_types';
import type { RegionSemanticFact } from './region_resource_types';

/** Follow stored evidence so stale upstream facts cannot quietly support a new product. */
export function processingEvidenceCurrent(
  fact: FactBase,
  facts: RegionFacts,
  visiting = new Set<string>(),
): boolean {
  if (fact.reason?.status === 'stale' || visiting.has(fact.id)) return false;
  const next = new Set(visiting);
  next.add(fact.id);
  const entries = Object.values(facts).filter(Array.isArray).flat() as RegionSemanticFact[];
  return (fact.reason?.sources ?? []).every((source) => {
    if (source.kind !== 'fact') return true;
    const parent = entries.find((entry) => entry.id === source.factId);
    return parent !== undefined && processingEvidenceCurrent(parent, facts, next);
  });
}
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
