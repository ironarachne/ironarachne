import { asRecord } from '$lib/artifact_kinds';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionRoadReading, RegionObservedRoad } from './region_road_reading_types';
import { regionOverviewReasonError } from './region_assessment_validation';
import { roadPathCurrent, roadReadingRelationsCurrent } from './region_road_evidence';

const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const sortedIds = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((id, index) => text(id) && (index === 0 || value[index - 1] < id));
const target = (value: unknown) => {
  const record = asRecord(value);
  return (
    record &&
    ((record.kind === 'embedded' && text(record.settlementId)) ||
      (record.kind === 'artifact' && text(record.targetId)))
  );
};
export function observedRoadError(value: unknown): string | null {
  const road = asRecord(value);
  const anchor = asRecord(road?.anchor);
  if (
    !road ||
    !text(road.routeId) ||
    !Array.isArray(road.endpoints) ||
    road.endpoints.length !== 2 ||
    !road.endpoints.every(target) ||
    !anchor
  )
    return 'invalid observed road';
  for (const field of ['nodeIds', 'edgeIds']) {
    const ids = anchor[field];
    if (
      !Array.isArray(ids) ||
      !ids.every((id) => Number.isInteger(id) && id >= 0) ||
      new Set(ids).size !== ids.length
    )
      return 'invalid observed road path';
  }
  if (
    (anchor.nodeIds as number[]).length < 2 ||
    (anchor.edgeIds as number[]).length !== (anchor.nodeIds as number[]).length - 1
  )
    return 'invalid observed road path';
  return null;
}
export function roadObservationError(value: unknown): string | null {
  const observation = asRecord(value);
  if (observation?.kind === 'road-path') return observedRoadError(observation);
  if (
    observation?.kind !== 'road-network' ||
    !sortedIds(observation.settlementIds) ||
    !Array.isArray(observation.roads)
  )
    return 'invalid road network observation';
  const ids: string[] = [];
  for (const raw of observation.roads) {
    const error = observedRoadError(raw);
    if (error) return error;
    const road = raw as RegionObservedRoad;
    if (
      road.endpoints.some(
        (target) =>
          target.kind !== 'embedded' ||
          !(observation.settlementIds as string[]).includes(target.settlementId),
      )
    )
      return 'invalid road network endpoint';
    ids.push(road.routeId);
  }
  return sortedIds(ids) ? null : 'unordered observed roads';
}

export function roadReadingsError(
  value: unknown,
  snapshot: RegionSnapshot,
  factIds: Set<string>,
): string | null {
  if (!Array.isArray(value)) return 'invalid road readings';
  const ids = new Set<string>();
  for (const raw of value) {
    const reading = asRecord(raw);
    if (
      !reading ||
      reading.reason === undefined ||
      !text(reading.routeId) ||
      ids.has(String(reading.routeId)) ||
      !Array.isArray(reading.observations) ||
      reading.observations.length !== 1
    )
      return 'invalid road reading';
    ids.add(String(reading.routeId));
    const error = regionOverviewReasonError(reading.reason, snapshot.map, factIds);
    if (error) return error;
    const typed = raw as RegionRoadReading;
    if (
      typed.reason.ruleId !== 'fantasy:region:road-reading:v1' ||
      typed.reason.sources.length !== 1 ||
      typed.reason.sources[0].kind !== 'fact' ||
      typed.reason.sources[0].factId !== typed.routeId
    )
      return 'unsupported road reading reason';
    const observation = asRecord(reading.observations[0]);
    if (
      observation?.kind !== 'road-path' ||
      observation.routeId !== reading.routeId ||
      roadObservationError(observation)
    )
      return 'invalid road reading observation';
    if (
      typed.reason.status !== 'stale' &&
      !roadPathCurrent(snapshot, observation as unknown as RegionObservedRoad)
    )
      return 'missing road reading target';
    if (
      typed.detailOwnerRouteId !== undefined &&
      (!text(typed.detailOwnerRouteId) || typed.detailOwnerRouteId === typed.routeId)
    )
      return 'invalid road detail owner';
    if (typed.promptNotableId !== undefined && !text(typed.promptNotableId))
      return 'invalid road prompt owner';
  }
  const readings = value as RegionRoadReading[];
  for (const reading of readings) {
    if (reading.reason.status === 'stale') continue;
    if (!roadReadingRelationsCurrent(snapshot, reading)) return 'unsupported road reading owner';
  }
  return null;
}
