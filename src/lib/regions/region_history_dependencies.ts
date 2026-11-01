import type { HistoryEvent, RegionHistory } from './region_history_types';
import type { RegionSnapshot } from './region_snapshot';
import { historyEvidenceCurrent } from './region_history_evidence';
import { regionHistoryError } from './region_history_validation';

/** Only explicit causes and historical-actor foundations create event dependencies.
 * Sharing a present-day target does not make one event depend on another.
 */
export function historyEventParents(history: RegionHistory): Map<string, Set<string>> {
  const founders = new Map(
    history.events.flatMap((event) =>
      event.outcome.kind === 'founding' && event.outcome.founded.kind === 'historicalActor'
        ? [[event.outcome.founded.actorId, event.id] as const]
        : [],
    ),
  );
  return new Map(
    history.events.map((event) => [
      event.id,
      new Set([
        ...event.causedByEventIds,
        ...event.participants.flatMap((ref) => {
          const founder = ref.kind === 'historicalActor' ? founders.get(ref.actorId) : undefined;
          return founder && founder !== event.id ? [founder] : [];
        }),
      ]),
    ]),
  );
}

export function historyDependentEventIds(
  history: RegionHistory,
  seeds: Iterable<string>,
): Set<string> {
  const changed = new Set(seeds),
    parents = historyEventParents(history);
  for (let pass = 0; pass < history.events.length; pass++) {
    const dependents = history.events.filter(
      (event) =>
        !changed.has(event.id) && [...parents.get(event.id)!].some((id) => changed.has(id)),
    );
    if (!dependents.length) break;
    dependents.forEach((event) => changed.add(event.id));
  }
  return changed;
}

/** A fresh traversal for each read; never cache mutable/imported snapshots globally. */
export function historyEventChecker(snapshot: RegionSnapshot): (event: HistoryEvent) => boolean {
  if (regionHistoryError(snapshot.history, snapshot)) return () => false;
  const events = new Map(snapshot.history.events.map((event) => [event.id, event]));
  const parents = historyEventParents(snapshot.history),
    memo = new Map<string, boolean>();
  const check = (id: string, visiting: Set<string>): boolean => {
    if (visiting.has(id)) return false;
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    const event = events.get(id);
    if (!event) return false;
    const next = new Set(visiting).add(id);
    const actorNamesObserved = event.participants.every(
      (ref) =>
        ref.kind !== 'historicalActor' ||
        event.evidence.observations.some(
          (obs) => obs.kind === 'historicalActor' && obs.actorId === ref.actorId,
        ),
    );
    const current =
      actorNamesObserved &&
      historyEvidenceCurrent(snapshot, event.evidence) &&
      [...parents.get(id)!].every((parent) => check(parent, next));
    memo.set(id, current);
    return current;
  };
  return (event) => check(event.id, new Set());
}

export function getCurrentHistoryEvents(snapshot: RegionSnapshot): HistoryEvent[] {
  if (regionHistoryError(snapshot.history, snapshot)) return [];
  const current = historyEventChecker(snapshot);
  return snapshot.history.events.filter(current).sort((a, b) => a.time.order - b.time.order);
}

export function getHistoryEventsNeedingReview(snapshot: RegionSnapshot): HistoryEvent[] {
  if (regionHistoryError(snapshot.history, snapshot)) return [];
  const current = historyEventChecker(snapshot);
  return snapshot.history.events
    .filter((event) => !current(event))
    .sort((a, b) => a.time.order - b.time.order);
}

/** Persist review status at the shared region edit boundary; never rewrite saved words. */
export function withRegionHistoryEvidence(snapshot: RegionSnapshot): RegionSnapshot {
  if (!snapshot.history.events.length) return snapshot;
  const current = historyEventChecker(snapshot);
  const changed = snapshot.history.events.filter(
    (event) => event.evidence.reason.status !== 'stale' && !current(event),
  );
  if (!changed.length) return snapshot;
  const stale = new Set(changed.map((event) => event.id));
  return {
    ...snapshot,
    history: {
      ...snapshot.history,
      events: snapshot.history.events.map((event) =>
        stale.has(event.id)
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
  };
}
