import { mountainRangeGeometryError } from '$lib/map';
import type { RegionMap } from '$lib/map';
import type { MountainRangeFact } from './region_mountain_range_types';

export function mountainRangeFactsError(value: unknown, map: RegionMap): string | null {
  if (!Array.isArray(value)) return 'region mountain ranges is not a list';
  const occupied = new Set<number>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return 'mountain range is not an object';
    const range = raw as MountainRangeFact;
    if (
      !Array.isArray(range.mapNodeIds) ||
      !Array.isArray(range.spineNodeIds) ||
      ![...range.mapNodeIds, ...range.spineNodeIds].every(Number.isInteger)
    )
      return 'mountain range needs numeric graph references';
    const error = mountainRangeGeometryError(map, range, range.origin === 'generated');
    if (error) return error;
    if (range.mapNodeIds.some((id) => occupied.has(id)))
      return 'mountain range memberships overlap';
    range.mapNodeIds.forEach((id) => occupied.add(id));
    if (
      range.origin === 'generated' &&
      (range.reason?.ruleId !== 'fantasy:region:mountain-range:v1' ||
        range.id !== `range:mountain:${Math.min(...range.mapNodeIds)}`)
    )
      return 'mountain range has an unsupported identity or evidence rule';
    if (range.origin === 'generated') {
      const sources = range.reason?.sources;
      if (!Array.isArray(sources)) return 'mountain range needs saved terrain observations';
      const observations = new Map(
        sources
          .filter((source) => source?.kind === 'map-node')
          .map((source) => [`${source.nodeId}:${source.property}`, source.observedValue]),
      );
      for (const node of map.nodes) {
        for (const property of ['elevation', 'isWater', 'isOcean'] as const) {
          const value = observations.get(`${node.id}:${property}`);
          if (
            value === undefined ||
            (range.reason?.status === 'current' && value !== String(node[property]))
          )
            return 'mountain range lacks its terrain baseline or flank observations';
        }
      }
    }
  }
  return null;
}
