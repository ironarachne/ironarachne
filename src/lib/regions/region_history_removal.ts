import type {
  HistoryEvent,
  HistoryPresentReference,
  HistoryReference,
  RegionHistory,
} from './region_history_types';
import { historyDependentEventIds } from './region_history_dependencies';

/** A transient impact report for confirmation UI; never persisted in a region. */
export type HistoryRemovalImpact = {
  eventIds: string[];
  actorIds: string[];
  staleEventIds: string[];
  protectedEventIds: string[];
  protectedActorIds: string[];
};
export type HistoryRemovalRequest = {
  eventIds?: ReadonlySet<string>;
  facts?: ReadonlySet<string>;
  reviewFacts?: ReadonlySet<string>;
  targets?: readonly HistoryPresentReference[];
};
const key = (ref: HistoryReference): string => {
  switch (ref.kind) {
    case 'fact':
      return `fact:${ref.factId}`;
    case 'realm':
      return `realm:${ref.realmId}`;
    case 'settlement':
      return `settlement:${ref.settlementId}`;
    case 'organization':
      return `organization:${ref.organizationId}`;
    case 'historicalActor':
      return `historicalActor:${ref.actorId}`;
  }
};
function sources(event: HistoryEvent): HistoryReference[] {
  return [
    ...event.participants,
    ...event.consequences.map((c) => c.target),
    ...event.evidence.observations,
    ...event.evidence.reason.sources.flatMap((source) =>
      source.kind === 'fact' ? [{ kind: 'fact' as const, factId: source.factId }] : [],
    ),
    ...event.evidence.observations.flatMap((obs): HistoryReference[] => {
      if (obs.kind === 'realm')
        return [
          ...(obs.parentRealmId === null
            ? []
            : [{ kind: 'realm' as const, realmId: obs.parentRealmId }]),
          ...obs.claims.map((claim) => ({
            kind: 'realm' as const,
            realmId: claim.claimantRealmId,
          })),
        ];
      if (obs.kind === 'organization')
        return obs.relationships.map((relation) => ({
          kind: 'organization',
          organizationId: relation.relatedOrganizationId,
        }));
      return [];
    }),
  ];
}

/** One closure for source removals and explicit event removals; shared targets are not event edges. */
export function historyRemovalImpact(
  history: RegionHistory,
  request: HistoryRemovalRequest = {},
): HistoryRemovalImpact {
  const removedTargets = new Set([
    ...(request.targets ?? []).map(key),
    ...[...(request.facts ?? [])].map((factId) => key({ kind: 'fact', factId })),
  ]);
  const explicit = request.eventIds ?? new Set<string>();
  const reviewTargets = new Set(
    [...(request.reviewFacts ?? [])].map((factId) => key({ kind: 'fact', factId })),
  );
  const seeds = history.events
    .filter(
      (event) =>
        explicit.has(event.id) || sources(event).some((ref) => removedTargets.has(key(ref))),
    )
    .map((event) => event.id);
  const removed = historyDependentEventIds(history, seeds);
  const review = historyDependentEventIds(
    history,
    history.events
      .filter((event) => sources(event).some((ref) => reviewTargets.has(key(ref))))
      .map((event) => event.id),
  );
  const events = [...history.events]
    .sort((a, b) => a.time.order - b.time.order)
    .filter((event) => removed.has(event.id));
  const used = new Set(
    history.events
      .filter((event) => !removed.has(event.id))
      .flatMap((event) =>
        event.participants.flatMap((ref) => (ref.kind === 'historicalActor' ? [ref.actorId] : [])),
      ),
  );
  const actors = events.length ? history.actors.filter((actor) => !used.has(actor.id)) : [];
  return {
    eventIds: events.map((event) => event.id),
    actorIds: actors.map((actor) => actor.id),
    staleEventIds: history.events
      .filter((event) => review.has(event.id) && !removed.has(event.id))
      .map((event) => event.id),
    protectedEventIds: history.events
      .filter(
        (event) =>
          (removed.has(event.id) || review.has(event.id)) &&
          event.origin === 'authored' &&
          !explicit.has(event.id),
      )
      .map((event) => event.id),
    protectedActorIds: actors
      .filter((actor) => actor.origin === 'authored')
      .map((actor) => actor.id),
  };
}

export function applyHistoryRemoval(
  history: RegionHistory,
  impact: HistoryRemovalImpact,
): RegionHistory | null {
  if (impact.protectedEventIds.length || impact.protectedActorIds.length) return null;
  if (!impact.eventIds.length && !impact.staleEventIds.length) return history;
  const events = new Set(impact.eventIds),
    actors = new Set(impact.actorIds);
  return {
    ...history,
    events: history.events
      .filter((event) => !events.has(event.id))
      .map((event) =>
        impact.staleEventIds.includes(event.id) && event.evidence.reason.status !== 'stale'
          ? {
              ...event,
              evidence: {
                ...event.evidence,
                reason: { ...event.evidence.reason, status: 'stale' },
              },
            }
          : event,
      ),
    actors: history.actors.filter((actor) => !actors.has(actor.id)),
  };
}

/** Existing source-removal transactions retain their API and use the common impact/closure. */
export function historyAfterSourceRemoval(
  history: RegionHistory,
  facts: ReadonlySet<string>,
  targets: HistoryPresentReference[] = [],
  reviewFacts: ReadonlySet<string> = new Set(),
): RegionHistory | null {
  return applyHistoryRemoval(
    history,
    historyRemovalImpact(history, { facts, targets, reviewFacts }),
  );
}
