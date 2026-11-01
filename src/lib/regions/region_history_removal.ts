import type {
  HistoryPresentReference,
  HistoryReference,
  RegionHistory,
} from './region_history_types';

/** Keep existing removal transactions referentially valid once generation emits history.
 * Full edit invalidation and history authoring remain separate from this removal boundary.
 */
export function historyAfterSourceRemoval(
  history: RegionHistory,
  facts: ReadonlySet<string>,
  targets: HistoryPresentReference[] = [],
): RegionHistory | null {
  const removedFacts = new Set([
    ...facts,
    ...targets.flatMap((target) => (target.kind === 'fact' ? [target.factId] : [])),
  ]);
  const removedReference = (ref: HistoryReference) => {
    if (ref.kind === 'fact') return removedFacts.has(ref.factId);
    return targets.some(
      (target) =>
        (ref.kind === 'settlement' &&
          target.kind === 'settlement' &&
          ref.settlementId === target.settlementId) ||
        (ref.kind === 'organization' &&
          target.kind === 'organization' &&
          ref.organizationId === target.organizationId) ||
        (ref.kind === 'realm' && target.kind === 'realm' && ref.realmId === target.realmId),
    );
  };
  const removed = new Set(
    history.events
      .filter(
        (event) =>
          event.participants.some(removedReference) ||
          event.consequences.some((c) => removedReference(c.target)) ||
          event.evidence.observations.some(removedReference) ||
          event.evidence.reason.sources.some(
            (source) => source.kind === 'fact' && removedFacts.has(source.factId),
          ),
      )
      .map((event) => event.id),
  );
  for (let pass = 0; pass < history.events.length; pass++) {
    const dependents = history.events.filter(
      (event) => !removed.has(event.id) && event.causedByEventIds.some((id) => removed.has(id)),
    );
    if (!dependents.length) break;
    dependents.forEach((event) => removed.add(event.id));
  }
  if (!removed.size) return history;
  if (history.events.some((event) => removed.has(event.id) && event.origin === 'authored'))
    return null;
  const events = history.events.filter((event) => !removed.has(event.id));
  const used = new Set(
    events.flatMap((event) =>
      event.participants.flatMap((ref) => (ref.kind === 'historicalActor' ? [ref.actorId] : [])),
    ),
  );
  if (history.actors.some((actor) => !used.has(actor.id) && actor.origin === 'authored'))
    return null;
  return { ...history, events, actors: history.actors.filter((actor) => used.has(actor.id)) };
}
