import type { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import type { RegionSnapshot } from './region_snapshot';
import type {
  HistoricalActor,
  HistoryEvent,
  HistoryReference,
  RegionHistory,
} from './region_history_types';
import { historyEvidenceCurrent, historyEvidenceKey } from './region_history_evidence';
import { regionHistoryError } from './region_history_validation';
import {
  historyLexical,
  regionHistoryCandidates,
  type RegionHistoryCandidate,
} from './region_history_candidates';

const generatedHistory = (events: HistoryEvent[], actors: HistoricalActor[]): RegionHistory => ({
  version: 1,
  state: 'generated',
  events,
  actors,
});
const referenceKey = (ref: HistoryReference) => historyEvidenceKey(ref);

/** Chronological prerequisites are distinct from the saved causal explanation links. */
function orderEvents(events: HistoryEvent[]): HistoryEvent[] | null {
  const founders = new Map(
    events.flatMap((event) =>
      event.outcome.kind === 'founding'
        ? [[referenceKey(event.outcome.founded), event.id] as const]
        : [],
    ),
  );
  const remaining = new Map(events.map((event) => [event.id, event]));
  const completed = new Set<string>();
  const result: HistoryEvent[] = [];
  while (remaining.size) {
    const ready = [...remaining.values()]
      .filter((event) => {
        const dependencies = [
          ...event.causedByEventIds,
          ...event.participants.flatMap((ref) => {
            const founder = founders.get(referenceKey(ref));
            return founder && founder !== event.id ? [founder] : [];
          }),
        ];
        return dependencies.every((id) => completed.has(id));
      })
      .sort((a, b) => historyLexical(a.id, b.id));
    if (!ready.length) return null;
    const next = ready[0];
    result.push({ ...next, time: { order: result.length } });
    remaining.delete(next.id);
    completed.add(next.id);
  }
  return result;
}

function selectCandidates(snapshot: RegionSnapshot, rng: RNG): RegionHistoryCandidate[] {
  let pool = regionHistoryCandidates(snapshot).filter(
    (candidate) =>
      !regionHistoryError(generatedHistory(candidate.events, candidate.actors), snapshot) &&
      candidate.events.every((event) => historyEvidenceCurrent(snapshot, event.evidence)),
  );
  const chosen: RegionHistoryCandidate[] = [];
  const conflicts = new Set<string>(),
    meanings = new Set<string>();
  const families = new Map<string, number>();
  let count = 0;
  // Every iteration consumes a candidate; neither conflicts nor invalid trials retry forever.
  while (pool.length) {
    pool = pool.filter(
      (candidate) =>
        count + candidate.events.length <= 6 &&
        !candidate.conflicts.some((key) => conflicts.has(key)) &&
        (families.get(candidate.family) ?? 0) < (candidate.family === 'founding' ? 3 : 2),
    );
    if (!pool.length) break;
    const score = (candidate: RegionHistoryCandidate): number[] => {
      const consequences = candidate.events
        .flatMap((event) => event.consequences)
        .map((c) => `${c.kind}:${referenceKey(c.target)}`);
      return [
        candidate.tier,
        families.has(candidate.family) ? 1 : 0,
        snapshot.mainRealm !== null &&
        candidate.events.some((event) =>
          event.consequences.some(
            (c) =>
              c.target.kind === 'realm' &&
              c.target.realmId === snapshot.realmIds[snapshot.mainRealm!],
          ),
        )
          ? 0
          : 1,
        -consequences.filter((key) => !meanings.has(key)).length,
      ];
    };
    const compare = (a: RegionHistoryCandidate, b: RegionHistoryCandidate) => {
      const sa = score(a),
        sb = score(b);
      return sa[0] - sb[0] || sa[1] - sb[1] || sa[2] - sb[2] || sa[3] - sb[3];
    };
    pool.sort((a, b) => compare(a, b) || historyLexical(a.id, b.id));
    const ties = pool.filter((candidate) => compare(candidate, pool[0]) === 0);
    const selected = ties[rng.int(0, ties.length - 1)];
    pool = pool.filter((candidate) => candidate.id !== selected.id);
    const trial = [...chosen, selected];
    const ordered = orderEvents(trial.flatMap((candidate) => candidate.events));
    if (
      !ordered ||
      regionHistoryError(
        generatedHistory(
          ordered,
          trial.flatMap((c) => c.actors),
        ),
        snapshot,
      )
    )
      continue;
    chosen.push(selected);
    count += selected.events.length;
    selected.conflicts.forEach((key) => conflicts.add(key));
    selected.events
      .flatMap((event) => event.consequences)
      .forEach((c) => meanings.add(`${c.kind}:${referenceKey(c.target)}`));
    families.set(selected.family, (families.get(selected.family) ?? 0) + 1);
  }
  return chosen;
}

function label(snapshot: RegionSnapshot, actors: HistoricalActor[], ref: HistoryReference): string {
  switch (ref.kind) {
    case 'realm':
      return snapshot.realms[snapshot.realmIds.indexOf(ref.realmId)].name;
    case 'organization':
      return snapshot.organizations.find((o) => o.id === ref.organizationId)!.name;
    case 'settlement':
      return snapshot.settlements.find((s) => s.id === ref.settlementId)!.snapshot.name;
    case 'historicalActor':
      return actors.find((actor) => actor.id === ref.actorId)!.name;
    case 'fact':
      throw new Error('History has no enabled wording for a fact participant.');
  }
}
const sentenceCase = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/** Equivalent phrasings express only the saved outcome, without leaders, sites or war spoils. */
function writeEvent(
  snapshot: RegionSnapshot,
  actors: HistoricalActor[],
  event: HistoryEvent,
  rng: RNG,
): HistoryEvent {
  const name = (ref: HistoryReference) => label(snapshot, actors, ref);
  const outcome = event.outcome;
  let title: string, options: string[];
  switch (outcome.kind) {
    case 'founding': {
      const subject = name(outcome.founded);
      title = `Founding of ${subject}`;
      options =
        outcome.founded.kind === 'settlement'
          ? [
              `${sentenceCase(subject)} was founded at its present site.`,
              `The settlement of ${subject} began at the site it occupies today.`,
            ]
          : [
              `${sentenceCase(subject)} came into being.`,
              `This period saw the founding of ${subject}.`,
            ];
      break;
    }
    case 'war': {
      const [a, b] = outcome.sides.map(name);
      title = `War between ${a} and ${b}`;
      options =
        outcome.resolution === 'rivalry-persists'
          ? [
              `A war between ${a} and ${b} left their rivalry unresolved.`,
              `War between ${a} and ${b} ended with their rivalry unsettled.`,
            ]
          : [
              `A war between ${a} and ${b} left an unpressed claim unresolved.`,
              `War between ${a} and ${b} ended without resolving the claim between them.`,
            ];
      break;
    }
    case 'incorporation': {
      const predecessor = name(outcome.predecessor),
        successor = name({ kind: 'realm', realmId: outcome.successorRealmId });
      title = `Incorporation of ${predecessor}`;
      options =
        outcome.predecessor.kind === 'historicalActor'
          ? [
              `${sentenceCase(predecessor)} was absorbed into ${successor}, which continued as its successor.`,
              `${sentenceCase(successor)} absorbed ${predecessor}, bringing the older polity to an end.`,
            ]
          : [
              `${sentenceCase(predecessor)} entered the authority of ${successor}, a relationship that continues today.`,
              `${sentenceCase(predecessor)} became subordinate to ${successor} and remains so today.`,
            ];
      break;
    }
    case 'fall': {
      const predecessor = name({ kind: 'historicalActor', actorId: outcome.historicalRealmId });
      const successor = name({ kind: 'realm', realmId: outcome.successorRealmId });
      title = `Fall of ${predecessor}`;
      options = [
        `${sentenceCase(predecessor)} ceased to exist as a polity, leaving ${successor} as its successor.`,
        `${sentenceCase(successor)} succeeded ${predecessor} after the older polity came to an end.`,
      ];
      break;
    }
    default:
      throw new Error('History has no approved disaster or migration wording.');
  }
  return { ...event, name: title, description: rng.item(options) };
}

/** Whole-region generation only: never replace saved or authored chronology on a repeated call. */
export function generateRegionHistory(snapshot: RegionSnapshot, rng: RNG): RegionHistory {
  if (
    snapshot.history.state !== 'unrecorded' ||
    snapshot.history.events.length ||
    snapshot.history.actors.length
  )
    return structuredClone(snapshot.history);
  const selected = selectCandidates(snapshot, rng);
  const usedNames = new Set(
    [
      ...snapshot.realms.map((r) => r.name),
      ...snapshot.organizations.map((o) => o.name),
      ...snapshot.settlements.map((s) => s.snapshot.name),
    ].map((name) => name.trim().toLowerCase()),
  );
  const named: RegionHistoryCandidate[] = [];
  for (const candidate of selected) {
    const actors: HistoricalActor[] = [];
    for (const actor of candidate.actors) {
      const names = getFantasyNameGeneratorSet('human', rng).country;
      for (let attempt = 0; attempt < 3; attempt++) {
        const country = names.generate(1)[0]?.trim();
        const name = country ? `the Former Realm of ${country}` : '';
        if (!name || usedNames.has(name.toLowerCase())) continue;
        actors.push({ ...actor, name });
        usedNames.add(name.toLowerCase());
        break;
      }
    }
    // Drop a whole bundle if bounded naming fails; never keep its fall without its founding.
    if (actors.length === candidate.actors.length) named.push({ ...candidate, actors });
  }
  const actors = named.flatMap((candidate) => candidate.actors);
  const ordered = orderEvents(named.flatMap((candidate) => candidate.events));
  if (!ordered) throw new Error('Selected history has cyclic chronological prerequisites.');
  const history = generatedHistory(
    ordered.map((event) => writeEvent(snapshot, actors, event, rng)),
    actors,
  );
  const error = regionHistoryError(history, snapshot);
  if (error || history.events.some((event) => !historyEvidenceCurrent(snapshot, event.evidence)))
    throw new Error(error ?? 'Generated history has incompatible present support.');
  return history;
}
