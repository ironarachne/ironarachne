import { asRecord } from '$lib/artifact_kinds';
import type { RegionSnapshot } from './region_snapshot';
import { regionOverviewReasonError } from './region_assessment_validation';

const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const numbers = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.every(
    (entry, i) => Number.isInteger(entry) && entry >= 0 && (i === 0 || value[i - 1] < entry),
  );
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((entry, i) => text(entry) && (i === 0 || value[i - 1] < entry));

export function landscapeObservationError(value: unknown): string | null {
  const record = asRecord(value);
  if (
    !record ||
    record.kind !== 'landscape-footprint' ||
    !finite(record.mapWidth) ||
    record.mapWidth <= 0 ||
    !finite(record.mapHeight) ||
    record.mapHeight <= 0 ||
    !numbers(record.landNodeIds) ||
    !Array.isArray(record.footprints) ||
    !record.footprints.length ||
    !Array.isArray(record.cells)
  )
    return 'invalid landscape footprint observation';
  const ids: string[] = [];
  for (const raw of record.footprints) {
    const footprint = asRecord(raw);
    if (!footprint || !text(footprint.factId) || !numbers(footprint.nodeIds))
      return 'invalid landscape fact footprint';
    ids.push(footprint.factId);
  }
  if (!strings(ids)) return 'unordered landscape footprints';
  const cells: number[] = [];
  for (const raw of record.cells) {
    const cell = asRecord(raw);
    if (
      !cell ||
      !Number.isInteger(cell.nodeId) ||
      Number(cell.nodeId) < 0 ||
      !finite(cell.x) ||
      !finite(cell.y) ||
      !numbers(cell.neighborIds)
    )
      return 'invalid landscape cell observation';
    cells.push(Number(cell.nodeId));
  }
  if (!numbers(cells) || JSON.stringify(cells) !== JSON.stringify(record.landNodeIds))
    return 'incomplete landscape cells';
  return null;
}

export function landscapePlacesError(
  value: unknown,
  snapshot: RegionSnapshot,
  factIds: Set<string>,
): string | null {
  if (!Array.isArray(value)) return 'invalid landscape place registry';
  const ids = new Set<string>();
  const sources = new Set<string>();
  for (const raw of value) {
    const place = asRecord(raw);
    if (
      !place ||
      !text(place.id) ||
      ids.has(place.id) ||
      !text(place.primaryFactId) ||
      !strings(place.aliasFactIds) ||
      !['landscape', 'notable-place'].includes(String(place.owner)) ||
      (place.descriptor !== undefined && !text(place.descriptor)) ||
      !Array.isArray(place.observations) ||
      (place.descriptor !== undefined && !place.observations.length)
    )
      return 'invalid landscape place';
    ids.add(place.id);
    const error = regionOverviewReasonError(place.reason, snapshot.map, factIds);
    if (error || place.reason === undefined) return error ?? 'missing landscape place reason';
    const stale = asRecord(place.reason)?.status === 'stale';
    for (const id of [place.primaryFactId, ...place.aliasFactIds]) {
      if (sources.has(id) || (!stale && !factIds.has(id)))
        return 'duplicate or missing landscape place source';
      sources.add(id);
    }
    const members = [place.primaryFactId, ...place.aliasFactIds];
    const reasonSources = asRecord(place.reason)?.sources as { kind: string; factId?: string }[];
    if (
      !members.includes(place.id) ||
      members.some(
        (id) => !reasonSources.some((source) => source.kind === 'fact' && source.factId === id),
      )
    )
      return 'unsupported landscape identity';
    if (!stale && place.owner === 'landscape') {
      const geographicIds = new Set(
        [
          ...snapshot.facts.areas.filter((fact) => fact.id.startsWith('area:habitat-zone:')),
          ...snapshot.facts.mountainRanges,
          ...snapshot.facts.denseForests,
        ].map((fact) => fact.id),
      );
      if (members.some((id) => !geographicIds.has(id))) return 'invalid landscape source';
      if (
        place.aliasFactIds.length &&
        (!place.descriptor ||
          members.some((id) => !snapshot.facts.denseForests.some((forest) => forest.id === id)))
      )
        return 'invalid grouped landscape patches';
    }
    if (place.owner === 'notable-place' && !stale) {
      const primary = snapshot.facts.notables.find(
        (fact) => fact.id === place.primaryFactId && fact.kind === 'landmark',
      );
      if (
        !primary ||
        place.aliasFactIds.length !== 1 ||
        !snapshot.facts.denseForests.some(
          (forest) => forest.id === (place.aliasFactIds as string[])[0],
        ) ||
        !primary.reason?.sources.some(
          (source) =>
            source.kind === 'fact' && source.factId === (place.aliasFactIds as string[])[0],
        )
      )
        return 'invalid landscape landmark alias';
    }
    for (const observation of place.observations) {
      const error = landscapeObservationError(observation);
      if (error) return error;
      const footprints = asRecord(observation)!.footprints as { factId: string }[];
      if (!stale && footprints.some((entry) => !factIds.has(entry.factId)))
        return 'missing landscape footprint fact';
    }
  }
  return null;
}
