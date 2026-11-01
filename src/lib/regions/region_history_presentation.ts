import type { HistoryPresentReference, HistoryReference } from './region_history_types';
import type { HistoryRemovalImpact } from './region_history_removal';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionDocument, RegionSection } from './region_presentation';
import {
  getCurrentHistoryEvents,
  getHistoryEventsNeedingReview,
} from './region_history_dependencies';
import { historyFact } from './region_history_evidence';

export const HISTORY_REVIEW_NOTICE =
  'History needs review; supporting information changed or could not be checked.';
export const HISTORY_EVENT_REVIEW_NOTICE =
  'Needs review: supporting information changed or could not be checked; saved text has not been recomputed.';
export type RegionHistoryReadingEntry = {
  eventId: string;
  heading: string;
  body: string;
  warning?: string;
  references: { label: string; anchorId: string }[];
};
export type RegionHistoryReading = { notice?: string; entries: RegionHistoryReadingEntry[] };
export const historyEventAnchor = (id: string) => `history-event-${encodeURIComponent(id)}`;
const referenceId = (ref: HistoryReference) => {
  switch (ref.kind) {
    case 'realm':
      return ref.realmId;
    case 'settlement':
      return ref.settlementId;
    case 'organization':
      return ref.organizationId;
    case 'fact':
      return ref.factId;
    case 'historicalActor':
      return ref.actorId;
  }
};
export const historySourceAnchor = (ref: HistoryPresentReference) =>
  `history-source-${ref.kind}-${encodeURIComponent(referenceId(ref))}`;
export function historySource(
  snapshot: RegionSnapshot,
  ref: HistoryPresentReference,
): { label: string; anchorId: string; record: unknown } {
  const record =
    ref.kind === 'realm'
      ? snapshot.realms[snapshot.realmIds.indexOf(ref.realmId)]
      : ref.kind === 'organization'
        ? snapshot.organizations.find((o) => o.id === ref.organizationId)
        : ref.kind === 'settlement'
          ? snapshot.settlements.find((s) => s.id === ref.settlementId)?.snapshot
          : historyFact(snapshot, ref.factId);
  const label = record?.name?.trim() || `Unresolved ${ref.kind}`;
  // Inspector records stay stored data; they do not fetch external references or infer history.
  return { label, anchorId: historySourceAnchor(ref), record };
}
export function historySourceEntries(snapshot: RegionSnapshot) {
  const refs = new Map<string, HistoryPresentReference>();
  for (const event of snapshot.history.events)
    for (const ref of [...event.participants, ...event.consequences.map((c) => c.target)])
      if (ref.kind !== 'historicalActor') refs.set(historySourceAnchor(ref), ref);
  return [...refs.values()].map((ref) => historySource(snapshot, ref));
}

/** The complete stored snapshot is required: filtered reading facts are not historical evidence. */
export function regionHistoryReading(snapshot: RegionSnapshot): RegionHistoryReading {
  const current = new Set(getCurrentHistoryEvents(snapshot).map((e) => e.id));
  const review = new Set(getHistoryEventsNeedingReview(snapshot).map((e) => e.id));
  let generated = 0;
  const entries: RegionHistoryReadingEntry[] = [];
  for (const event of [...snapshot.history.events].sort((a, b) => a.time.order - b.time.order)) {
    if (
      event.origin === 'generated' &&
      (++generated > 6 || !current.has(event.id) || !event.description.trim())
    )
      continue;
    const years = event.time.yearsBeforePresent;
    const time =
      years === undefined
        ? `Event ${event.time.order + 1}`
        : years === 0
          ? 'Present year'
          : `${years} ${years === 1 ? 'year' : 'years'} before the present`;
    entries.push({
      eventId: event.id,
      heading: [time, event.name].filter(Boolean).join(' — '),
      body: event.description,
      ...(review.has(event.id) ? { warning: HISTORY_EVENT_REVIEW_NOTICE } : {}),
      references: [
        ...new Map(
          event.consequences.map((c) => {
            const source = historySource(snapshot, c.target);
            return [
              source.anchorId,
              { label: `Explains: ${source.label}`, anchorId: source.anchorId },
            ] as const;
          }),
        ).values(),
      ],
    });
  }
  return { ...(review.size ? { notice: HISTORY_REVIEW_NOTICE } : {}), entries };
}

export function historySection(snapshot: RegionSnapshot): RegionSection[] {
  const history = regionHistoryReading(snapshot);
  if (!history.entries.length && !history.notice) return [];
  return [
    {
      heading: 'History',
      history,
      lines: [
        ...(history.notice ? [history.notice] : []),
        ...history.entries.map((entry) =>
          [entry.heading, entry.body, entry.warning, ...entry.references.map((r) => r.label)]
            .filter(Boolean)
            .join('\n\n'),
        ),
      ],
    },
  ];
}
export function appendHistoryReading(snapshot: RegionSnapshot, document: RegionDocument): void {
  const section = historySection(snapshot);
  if (!section.length) return;
  const identity = document.sections.findIndex((s) => s.heading === 'Regional identity');
  document.sections.splice(identity >= 0 ? identity + 1 : 0, 0, ...section);
}

export function historyRemovalMessage(
  snapshot: RegionSnapshot,
  impact: HistoryRemovalImpact,
): string {
  const eventNames = (ids: string[]) =>
    ids
      .map(
        (id) => snapshot.history.events.find((e) => e.id === id)?.name || 'Unnamed history event',
      )
      .join('; ');
  const actorNames = (ids: string[]) =>
    ids
      .map(
        (id) =>
          snapshot.history.actors.find((a) => a.id === id)?.name || 'Unnamed historical actor',
      )
      .join('; ');
  return [
    impact.eventIds.length ? `History events to remove: ${eventNames(impact.eventIds)}.` : '',
    impact.actorIds.length ? `Historical actors to remove: ${actorNames(impact.actorIds)}.` : '',
    impact.staleEventIds.length
      ? `History events needing review afterward: ${eventNames(impact.staleEventIds)}.`
      : '',
    impact.protectedEventIds.length
      ? `Authored history prevents removal: ${eventNames(impact.protectedEventIds)}.`
      : '',
    impact.protectedActorIds.length
      ? `Authored historical actors prevent removal: ${actorNames(impact.protectedActorIds)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}
