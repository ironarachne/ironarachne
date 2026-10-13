import { denseForestGeometryError, detectDenseForests, type RegionMap } from '$lib/map';
import type { DenseForestFact } from './region_dense_forest_types';

export function denseForestFactsError(value: unknown, map: RegionMap): string | null {
  if (!Array.isArray(value) || value.length > 3) return 'region needs at most three dense forests';
  const occupied = new Set<number>();
  const expected = value.length ? detectDenseForests(map) : [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return 'dense forest is not an object';
    const forest = raw as DenseForestFact;
    const error = denseForestGeometryError(map, forest);
    if (error) return error;
    if (forest.mapNodeIds.some((id) => occupied.has(id))) return 'dense forest memberships overlap';
    forest.mapNodeIds.forEach((id) => occupied.add(id));
    if (forest.origin !== 'generated') continue;
    if (
      forest.id !== `forest:dense:${forest.mapNodeIds[0]}` ||
      forest.reason?.ruleId !== 'fantasy:region:dense-forest:v1'
    )
      return 'dense forest has an unsupported identity or evidence rule';
    if (!Array.isArray(forest.reason.sources))
      return 'dense forest needs saved terrain observations';
    const observations = new Map(
      forest.reason.sources
        .filter((source) => source?.kind === 'map-node')
        .map((source) => [`${source.nodeId}:${source.property}`, source.observedValue]),
    );
    for (const node of map.nodes)
      for (const property of ['biomeId', 'moisture', 'elevation', 'isWater', 'isOcean'] as const) {
        const observed = observations.get(`${node.id}:${property}`);
        if (
          observed === undefined ||
          (forest.reason.status === 'current' && observed !== String(node[property]))
        )
          return 'dense forest lacks its saved terrain observations';
      }
    if (
      forest.reason.status === 'current' &&
      !expected.some(
        (patch) => JSON.stringify(patch.mapNodeIds) === JSON.stringify(forest.mapNodeIds),
      )
    )
      return 'dense forest does not match realized patch geography';
  }
  return null;
}
