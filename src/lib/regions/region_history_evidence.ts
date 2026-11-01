import type { FactBase } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type { HistoryObservation, HistoryEvidence, HistoryReference } from './region_history_types';
import { regionSemanticFactLists } from './region_fact_lists';
import { createRegionEvidenceChecker } from './region_context_evidence';

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const setFields = new Set([
  'areaIds',
  'habitatIds',
  'relatedIds',
  'nodeIds',
  'edgeIds',
  'mapNodeIds',
  'sources',
  'tiles',
  'claims',
  'relationships',
]);
/** Saved JSON comparisons preserve ordered values and normalize only declared sets. */
export function historyEvidenceKey(value: unknown, field = ''): string {
  const normalize = (v: unknown, key: string): unknown => {
    if (Array.isArray(v)) {
      const values = v.map((entry) => normalize(entry, ''));
      return setFields.has(key)
        ? values.sort((a, b) => compare(JSON.stringify(a), JSON.stringify(b)))
        : values;
    }
    if (v === null || typeof v !== 'object') return v;
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k]) => key !== 'reason' || k !== 'status')
        .sort(([a], [b]) => compare(a, b))
        .map(([k, entry]) => [k, normalize(entry, k)]),
    );
  };
  return JSON.stringify(normalize(value, field));
}

export function historyFact(snapshot: RegionSnapshot, id: string) {
  return regionSemanticFactLists
    .flatMap<FactBase>((key) => snapshot.facts[key])
    .find((fact) => fact.id === id);
}

/** Unknown claim statuses are retained in storage but cannot justify a historical assertion. */
export function historyObservation(
  snapshot: RegionSnapshot,
  ref: HistoryReference,
): HistoryObservation | null {
  if (ref.kind === 'historicalActor') return null;
  if (ref.kind === 'realm') {
    const index = snapshot.realmIds.indexOf(ref.realmId);
    const realm = snapshot.realms[index];
    if (!realm || realm.claims.some((claim) => claim.status !== 'unpressed')) return null;
    const tiles: number[] = [];
    for (const tile of realm.tiles) {
      const node = snapshot.map.nodes.find(
        (node) => node.center.x === tile.x && node.center.y === tile.y,
      );
      if (!node) return null;
      tiles.push(node.id);
    }
    const parentRealmId = realm.parent === -1 ? null : snapshot.realmIds[realm.parent];
    if (parentRealmId === undefined) return null;
    const claims = realm.claims.map((claim) => ({
      claimantRealmId: snapshot.realmIds[claim.claimantId],
      status: claim.status,
    }));
    if (claims.some((c) => c.claimantRealmId === undefined)) return null;
    return {
      kind: 'realm',
      realmId: ref.realmId,
      name: realm.name,
      parentRealmId,
      tiles: [...new Set(tiles)].sort((a, b) => a - b),
      claims: claims.sort((a, b) => compare(historyEvidenceKey(a), historyEvidenceKey(b))),
    };
  }
  if (ref.kind === 'organization') {
    const org = snapshot.organizations.find((org) => org.id === ref.organizationId);
    if (!org) return null;
    return {
      kind: 'organization',
      organizationId: org.id,
      name: org.name,
      relationships: org.relationships
        .map((relation) => ({ ...relation }))
        .sort((a, b) => compare(historyEvidenceKey(a), historyEvidenceKey(b))),
    };
  }
  if (ref.kind === 'settlement') {
    const entry = snapshot.settlements.find((entry) => entry.id === ref.settlementId);
    return entry &&
      snapshot.map.nodes.some((node) => node.id === entry.snapshot.mapNodeId) &&
      entry.snapshot.mapNodeId !== undefined
      ? {
          kind: 'settlement',
          settlementId: entry.id,
          name: entry.snapshot.name,
          mapNodeId: entry.snapshot.mapNodeId,
        }
      : null;
  }
  const fact = historyFact(snapshot, ref.factId);
  return fact ? { kind: 'fact', factId: fact.id, observed: historyEvidenceKey(fact) } : null;
}

/** Compatibility checks read the saved region only; they never rerun rules or compose prose. */
export function historyEvidenceCurrent(
  snapshot: RegionSnapshot,
  evidence: HistoryEvidence,
): boolean {
  const check = createRegionEvidenceChecker(snapshot);
  if (
    !evidence.observations.length ||
    !check({
      id: 'history:evidence',
      name: '',
      description: '',
      origin: 'generated',
      reason: evidence.reason,
    })
  )
    return false;
  return evidence.observations.every((observation) => {
    const actual = historyObservation(snapshot, observation);
    if (!actual || historyEvidenceKey(actual) !== historyEvidenceKey(observation)) return false;
    if (observation.kind !== 'fact') return true;
    const fact = historyFact(snapshot, observation.factId);
    return !!fact && check(fact);
  });
}
