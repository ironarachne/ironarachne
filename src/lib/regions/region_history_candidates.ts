import type { FactSource } from './region_fact_types';
import type {
  HistoricalActor,
  HistoryConsequence,
  HistoryEvent,
  HistoryOutcome,
  HistoryPresentReference,
  HistoryReference,
} from './region_history_types';
import type { RegionSnapshot } from './region_snapshot';
import { historyEvidenceKey, historyObservation } from './region_history_evidence';
import { createRegionEvidenceChecker } from './region_context_evidence';

export type RegionHistoryCandidate = {
  id: string;
  family: HistoryOutcome['kind'];
  /** Current relationships precede invented succession, then standalone foundings. */
  tier: number;
  conflicts: string[];
  events: HistoryEvent[];
  actors: HistoricalActor[];
};
export const historyLexical = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const identity = (family: string, parts: string[]) =>
  `history:${JSON.stringify([family, ...parts])}`;
const pairKey = (a: HistoryReference, b: HistoryReference) =>
  [historyEvidenceKey(a), historyEvidenceKey(b)].sort(historyLexical).join('|');

function draft(
  snapshot: RegionSnapshot,
  family: string,
  parts: string[],
  outcome: HistoryOutcome,
  participants: HistoryReference[],
  consequences: HistoryConsequence[],
  observed: HistoryPresentReference[],
  sources: FactSource[] = [],
): HistoryEvent | null {
  const observations = observed.map((ref) => historyObservation(snapshot, ref));
  if (observations.some((obs) => obs === null || (obs.kind !== 'fact' && !obs.name.trim())))
    return null;
  return {
    id: identity(family, parts),
    name: '',
    description: '',
    origin: 'generated',
    time: { order: 0 },
    outcome,
    participants,
    consequences,
    causedByEventIds: [],
    evidence: {
      reason: { ruleId: `fantasy:region:history:${family}:v1`, status: 'current', sources },
      observations: observations.filter((obs) => obs !== null),
    },
  };
}

/** Enumerate meanings without RNG, historical naming, prose parsing or present-day mutations. */
export function regionHistoryCandidates(snapshot: RegionSnapshot): RegionHistoryCandidate[] {
  const candidates: RegionHistoryCandidate[] = [];
  const current = createRegionEvidenceChecker(snapshot);
  const add = (event: HistoryEvent | null, tier: number, conflicts: string[]) => {
    if (event)
      candidates.push({
        id: event.id,
        family: event.outcome.kind,
        tier,
        conflicts,
        events: [event],
        actors: [],
      });
  };
  for (const settlement of [...snapshot.settlements].sort((a, b) => historyLexical(a.id, b.id))) {
    const node = snapshot.map.nodes.find((n) => n.id === settlement.snapshot.mapNodeId);
    if (!node || node.isWater || node.isOcean) continue;
    const role = snapshot.facts.settlementRoles
      .filter(
        (role) =>
          role.settlement.kind === 'embedded' &&
          role.settlement.settlementId === settlement.id &&
          role.id.startsWith('role:site:') &&
          role.anchor.nodeIds.includes(node.id) &&
          current(role),
      )
      .sort((a, b) => historyLexical(a.id, b.id))[0];
    if (!role) continue;
    const ref: HistoryPresentReference = { kind: 'settlement', settlementId: settlement.id };
    add(
      draft(
        snapshot,
        'settlement-founding',
        [settlement.id],
        { kind: 'founding', founded: ref },
        [ref],
        [{ kind: 'existence', target: ref }],
        [ref, { kind: 'fact', factId: role.id }],
        [{ kind: 'fact', factId: role.id }],
      ),
      2,
      ['founding:settlement'],
    );
  }

  const organizations = [...snapshot.organizations].sort((a, b) => historyLexical(a.id, b.id));
  const pairs = new Set<string>();
  for (const organization of organizations) {
    const ref: HistoryPresentReference = { kind: 'organization', organizationId: organization.id };
    add(
      draft(
        snapshot,
        'organization-founding',
        [organization.id],
        { kind: 'founding', founded: ref },
        [ref],
        [{ kind: 'existence', target: ref }],
        [ref],
      ),
      2,
      ['founding:organization'],
    );
    for (const relation of [...organization.relationships].sort((a, b) =>
      historyLexical(historyEvidenceKey(a), historyEvidenceKey(b)),
    )) {
      const other = organizations.find((o) => o.id === relation.relatedOrganizationId);
      if (!other || other.id === organization.id || relation.kind !== 'rival') continue;
      const otherRef: HistoryPresentReference = { kind: 'organization', organizationId: other.id };
      const pair = pairKey(ref, otherRef);
      // Do not turn ambiguous alliance/hierarchy/trade edges into a war origin.
      const relations = [
        ...organization.relationships.filter((r) => r.relatedOrganizationId === other.id),
        ...other.relationships.filter((r) => r.relatedOrganizationId === organization.id),
      ];
      if (pairs.has(pair) || relations.some((r) => r.kind !== 'rival')) continue;
      pairs.add(pair);
      const sides = [ref, otherRef].sort((a, b) =>
        historyLexical(historyEvidenceKey(a), historyEvidenceKey(b)),
      );
      add(
        draft(
          snapshot,
          'rivalry-war',
          [pair],
          { kind: 'war', sides, resolution: 'rivalry-persists' },
          sides,
          sides.map((target) => ({ kind: 'rivalry', target })),
          sides,
        ),
        0,
        [`politics:${pair}`],
      );
    }
  }

  const realms = snapshot.realmIds
    .map((id, index) => ({ id, realm: snapshot.realms[index] }))
    .sort((a, b) => historyLexical(a.id, b.id));
  const ancestry = (id: string): string[] | null => {
    const seen: string[] = [];
    let index = snapshot.realmIds.indexOf(id);
    while (index !== -1) {
      const next = snapshot.realmIds[index];
      if (!next || seen.includes(next)) return null;
      seen.push(next);
      index = snapshot.realms[index].parent;
    }
    return seen;
  };
  const eligible = new Set(
    realms
      .filter(
        ({ id, realm }) =>
          realm.name.trim() &&
          ancestry(id) &&
          historyObservation(snapshot, { kind: 'realm', realmId: id }),
      )
      .map((r) => r.id),
  );
  const claimPairs = new Set<string>();
  for (const { id, realm } of realms) {
    if (!eligible.has(id)) continue;
    const ref: HistoryPresentReference = { kind: 'realm', realmId: id };
    add(
      draft(
        snapshot,
        'realm-founding',
        [id],
        { kind: 'founding', founded: ref },
        [ref],
        [{ kind: 'existence', target: ref }],
        [ref],
      ),
      2,
      ['founding:realm'],
    );
    const parentId = snapshot.realmIds[realm.parent];
    if (parentId && eligible.has(parentId)) {
      const parent: HistoryPresentReference = { kind: 'realm', realmId: parentId };
      add(
        draft(
          snapshot,
          'subordination',
          [id, parentId],
          { kind: 'incorporation', predecessor: ref, successorRealmId: parentId },
          [ref, parent],
          [{ kind: 'subordination', target: ref }],
          [ref, parent],
        ),
        0,
        [`politics:${pairKey(ref, parent)}`],
      );
    }
    for (const claim of [...realm.claims].sort((a, b) =>
      historyLexical(snapshot.realmIds[a.claimantId], snapshot.realmIds[b.claimantId]),
    )) {
      const claimantId = snapshot.realmIds[claim.claimantId];
      if (
        claim.status !== 'unpressed' ||
        claimantId === id ||
        !eligible.has(claimantId) ||
        ancestry(id)!.includes(claimantId) ||
        ancestry(claimantId)!.includes(id)
      )
        continue;
      const other: HistoryPresentReference = { kind: 'realm', realmId: claimantId };
      const pair = pairKey(ref, other);
      if (claimPairs.has(pair)) continue;
      claimPairs.add(pair);
      // Keep owner then claimant as the semantic order; the candidate identity is symmetric.
      add(
        draft(
          snapshot,
          'claim-war',
          [pair],
          { kind: 'war', sides: [ref, other], resolution: 'claim-persists' },
          [ref, other],
          [{ kind: 'claim-continuity', target: other }],
          [ref, other],
        ),
        0,
        [`politics:${pair}`],
      );
    }

    // This is explicitly invented institutional succession, anchored to current existence.
    // Both alternatives require the predecessor's founding and share a conflict slot.
    const actor: HistoricalActor = {
      id: identity('predecessor', [id]),
      name: 'Historical predecessor',
      kind: 'realm',
      origin: 'generated',
    };
    const past: HistoryReference = { kind: 'historicalActor', actorId: actor.id };
    const founding = draft(
      snapshot,
      'predecessor-founding',
      [id],
      { kind: 'founding', founded: past },
      [past],
      [{ kind: 'existence', target: ref }],
      [ref],
    )!;
    for (const kind of ['fall', 'incorporation'] as const) {
      const outcome: HistoryOutcome =
        kind === 'fall'
          ? { kind, historicalRealmId: actor.id, successorRealmId: id }
          : { kind, predecessor: past, successorRealmId: id };
      const end = draft(
        snapshot,
        `predecessor-${kind}`,
        [id],
        outcome,
        [past, ref],
        [{ kind: 'claim-continuity', target: ref }],
        [ref],
      )!;
      end.time.order = 1;
      end.causedByEventIds = [founding.id];
      candidates.push({
        id: end.id,
        family: kind,
        tier: 1,
        conflicts: ['predecessor-account'],
        events: [founding, end],
        actors: [actor],
      });
    }
  }
  return candidates.sort((a, b) => historyLexical(a.id, b.id));
}
