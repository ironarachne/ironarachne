import type { RegionSnapshot } from './region_snapshot';
import type { HistoryEvent } from './region_history_types';
import { regionHistoryError } from './region_history_validation';
import { historyDependentEventIds, withRegionHistoryEvidence } from './region_history_dependencies';
import { historyRemovalImpact, applyHistoryRemoval } from './region_history_removal';

function checked(snapshot: RegionSnapshot): RegionSnapshot {
  const error = regionHistoryError(snapshot.history, snapshot);
  if (error) throw new Error(error);
  return withRegionHistoryEvidence(snapshot);
}
function editEvent(
  snapshot: RegionSnapshot,
  id: string,
  edit: (event: HistoryEvent) => HistoryEvent,
): RegionSnapshot {
  const before = snapshot.history.events.find((event) => event.id === id);
  if (!before) return snapshot;
  const after = edit(before);
  if (after === before) return snapshot;
  const dependents = historyDependentEventIds(snapshot.history, [id]);
  dependents.delete(id);
  return checked({
    ...snapshot,
    history: {
      ...snapshot.history,
      state: 'authored',
      events: snapshot.history.events.map((event) =>
        event === before
          ? after
          : dependents.has(event.id)
            ? {
                ...event,
                evidence: {
                  ...event.evidence,
                  reason: { ...event.evidence.reason, status: 'stale' },
                },
              }
            : event,
      ),
    },
  });
}

export function setRegionHistoryEventText(
  snapshot: RegionSnapshot,
  id: string,
  field: 'name' | 'description',
  value: string,
): RegionSnapshot {
  return editEvent(snapshot, id, (event) =>
    event[field] === value ? event : { ...event, [field]: value, origin: 'authored' },
  );
}

/** null removes an optional relative date; invalid requests throw before publishing a result. */
export function setRegionHistoryEventDate(
  snapshot: RegionSnapshot,
  id: string,
  yearsBeforePresent: number | null,
): RegionSnapshot {
  if (
    yearsBeforePresent !== null &&
    (!Number.isSafeInteger(yearsBeforePresent) || yearsBeforePresent < 0)
  )
    throw new Error('History dates must be nonnegative whole years before the present.');
  return editEvent(snapshot, id, (event) => {
    if ((event.time.yearsBeforePresent ?? null) === yearsBeforePresent) return event;
    const time = { ...event.time };
    if (yearsBeforePresent === null) delete time.yearsBeforePresent;
    else time.yearsBeforePresent = yearsBeforePresent;
    return { ...event, time, origin: 'authored' };
  });
}

/** Reuse the existing order slots (including gaps) and retain all event identities. */
export function reorderRegionHistoryEvents(
  snapshot: RegionSnapshot,
  ids: readonly string[],
): RegionSnapshot {
  const ordered = [...snapshot.history.events].sort((a, b) => a.time.order - b.time.order);
  if (
    ids.length !== ordered.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !ordered.some((event) => event.id === id))
  )
    throw new Error('History order must contain each existing event exactly once.');
  if (ids.every((id, index) => id === ordered[index].id)) return snapshot;
  const slots = ordered.map((event) => event.time.order),
    positions = new Map(ids.map((id, index) => [id, slots[index]]));
  return checked({
    ...snapshot,
    history: {
      ...snapshot.history,
      state: 'authored',
      events: ids.map((id) => {
        const event = ordered.find((event) => event.id === id)!;
        return positions.get(id) === event.time.order
          ? event
          : { ...event, origin: 'authored', time: { ...event.time, order: positions.get(id)! } };
      }),
    },
  });
}

export function setRegionHistoricalActorName(
  snapshot: RegionSnapshot,
  id: string,
  name: string,
): RegionSnapshot {
  const actor = snapshot.history.actors.find((actor) => actor.id === id);
  if (!actor || actor.name === name) return snapshot;
  if (!name.trim()) throw new Error('A historical actor needs a nonempty name.');
  const affected = historyDependentEventIds(
    snapshot.history,
    snapshot.history.events
      .filter((event) =>
        event.participants.some((ref) => ref.kind === 'historicalActor' && ref.actorId === id),
      )
      .map((event) => event.id),
  );
  return checked({
    ...snapshot,
    history: {
      ...snapshot.history,
      state: 'authored',
      actors: snapshot.history.actors.map((entry) =>
        entry.id === id ? { ...entry, name, origin: 'authored' } : entry,
      ),
      events: snapshot.history.events.map((event) =>
        affected.has(event.id)
          ? {
              ...event,
              evidence: {
                ...event.evidence,
                reason: { ...event.evidence.reason, status: 'stale' },
              },
            }
          : event,
      ),
    },
  });
}

export function getHistoryEventRemovalImpact(snapshot: RegionSnapshot, id: string) {
  return historyRemovalImpact(snapshot.history, { eventIds: new Set([id]) });
}

export function removeRegionHistoryEvent(snapshot: RegionSnapshot, id: string): RegionSnapshot {
  if (!snapshot.history.events.some((event) => event.id === id)) return snapshot;
  const impact = getHistoryEventRemovalImpact(snapshot, id);
  const history = applyHistoryRemoval(snapshot.history, impact);
  if (history === null) return snapshot;
  return checked({ ...snapshot, history: { ...history, state: 'authored' } });
}
