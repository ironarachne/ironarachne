import { historyAfterSourceRemoval } from './region_history_removal';
import { withRegionHistoryEvidence } from './region_history_dependencies';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionHistory } from './region_history_types';

/** Allocate once, without consuming any generation stream. */
export const initialRegionRealmIds = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => `realm:${index}`);

/** Find an unused identity; deletion does not make the array length an identity. */
export function nextRegionRealmId(ids: readonly string[]): string {
  let index = 0;
  while (ids.includes(`realm:${index}`)) index++;
  return `realm:${index}`;
}

export function emptyRegionHistory(): RegionHistory {
  return { version: 1, state: 'unrecorded', actors: [], events: [] };
}

export function regionRealmIdentityError(
  value: Pick<RegionSnapshot, 'realmIds' | 'realms'>,
): string | null {
  const { realmIds: ids, realms } = value;
  if (
    !Array.isArray(ids) ||
    ids.length !== realms.length ||
    ids.some((id) => typeof id !== 'string' || !/^realm:.+/.test(id)) ||
    new Set(ids).size !== ids.length
  )
    return 'region realms need unique local IDs matching their list';
  const index = (v: unknown) => Number.isInteger(v) && Number(v) >= 0 && Number(v) < realms.length;
  for (const realm of realms) {
    if (realm.parent !== -1 && !index(realm.parent))
      return 'region realm has an invalid parent index';
    for (const claim of realm.claims) {
      if (
        !claim ||
        !index(claim.claimantId) ||
        typeof claim.status !== 'string' ||
        typeof claim.claimantName !== 'string'
      )
        return 'region realm has an invalid claimant index or claim';
    }
  }
  return null;
}

/** Reorder or remove realms and translate all old positional links in one immutable operation.
 * Generated history dependencies are removed atomically; authored history is protected.
 */
export function retainRegionRealms(
  snapshot: RegionSnapshot,
  ids: readonly string[],
): RegionSnapshot {
  const error = regionRealmIdentityError(snapshot);
  if (error) throw new Error(error);
  if (new Set(ids).size !== ids.length || ids.some((id) => !snapshot.realmIds.includes(id)))
    throw new Error('Realm order must contain unique existing IDs.');
  const removed = snapshot.realmIds.filter((id) => !ids.includes(id));
  if (
    ids.every((id, index) => id === snapshot.realmIds[index]) &&
    ids.length === snapshot.realmIds.length
  )
    return snapshot;
  const history = historyAfterSourceRemoval(
    snapshot.history,
    new Set(),
    removed.map((realmId) => ({ kind: 'realm', realmId })),
  );
  if (history === null) throw new Error('Realm removal would damage authored history.');
  const remap = (index: number) => (index === -1 ? -1 : ids.indexOf(snapshot.realmIds[index]));
  if (snapshot.mainRealm !== null && remap(snapshot.mainRealm) < 0)
    throw new Error('Change the regional seat before removing its realm.');
  return withRegionHistoryEvidence({
    ...snapshot,
    history,
    realmIds: [...ids],
    mainRealm: snapshot.mainRealm === null ? null : remap(snapshot.mainRealm),
    realms: ids.map((id) => {
      const realm = snapshot.realms[snapshot.realmIds.indexOf(id)];
      return {
        ...realm,
        parent: remap(realm.parent),
        claims: realm.claims
          .filter((claim) => remap(claim.claimantId) >= 0)
          .map((claim) => ({ ...claim, claimantId: remap(claim.claimantId) })),
      };
    }),
  });
}
