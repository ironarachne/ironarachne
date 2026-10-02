/**
 * Editing a saved region, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one realm must not
 * disturb another, and rewriting a settlement's description must not touch the map — and it is what
 * lets the editing framework compare what is on screen against what was read to decide whether
 * anything needs saving.
 *
 * **What is editable is what the page shows** (4.1): the region's name and description, which realm
 * is the seat, each realm's name, adjective and description, and each settlement's and
 * organization's name and description.
 *
 * **The map is not editable, and that is a decision rather than an omission.** It is a graph of
 * nodes, edges and corners whose indices the realms' tiles and the roads both point into; a text
 * box over one of those numbers would detach a realm from its land or a road from its towns, and
 * nothing would say so until the map was drawn. A referee who wants different terrain re-rolls.
 *
 * **The arms are not editable here either.** They have an editor of their own — the heraldry kind's
 * — and the generator page opens it in a modal. Reproducing it inside this editor would be a second
 * copy of the site's most intricate component.
 *
 * **Nothing here recomputes anything.** Changing which realm is the seat does not re-derive the
 * description that mentions the old one, because that description may have been rewritten by hand;
 * 4.2 says the edited payload is authoritative, and a generator that quietly corrects prose is
 * regenerating over the user's work.
 */

import type { RegionSnapshot, StoredRealm } from './region_snapshot.js';
import type { RegionSemanticFact } from './region_resource_types';
import {
  regionSemanticFactLists,
  regionFactTargets,
  removeRegionFactIds,
} from './region_resource_editing';

/** The region's own two strings. */
export type RegionTextField = 'name' | 'description';

/** A realm's three strings. */
export type RealmTextField = 'name' | 'adjective' | 'description';

/** Which of a region's two lists of named things an edit applies to. */
export type RegionPlaceList = 'settlements' | 'organizations';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

/** IDs of generated dependent facts to remove, or null when authored work depends on the place. */
function settlementRemovalDependencies(
  snapshot: RegionSnapshot,
  index: number,
): Set<string> | null {
  const settlementId = snapshot.settlements[index].id;
  const roles = snapshot.facts.settlementRoles.filter(
    (role) => role.settlement.kind === 'embedded' && role.settlement.settlementId === settlementId,
  );
  const routes = snapshot.facts.routes.filter((route) =>
    route.endpoints.some(
      (endpoint) =>
        endpoint.kind === 'settlement' &&
        endpoint.settlement.kind === 'embedded' &&
        endpoint.settlement.settlementId === settlementId,
    ),
  );
  const uses = snapshot.facts.ecologyRelationships.filter(
    (entry) =>
      entry.relation.kind === 'used-by' &&
      entry.relation.settlement.kind === 'embedded' &&
      entry.relation.settlement.settlementId === settlementId,
  );
  const products = snapshot.facts.products.filter(
    (entry) =>
      entry.settlement.kind === 'embedded' && entry.settlement.settlementId === settlementId,
  );
  const dailyLife = snapshot.facts.dailyLife.filter(
    (entry) =>
      entry.settlement.kind === 'embedded' && entry.settlement.settlementId === settlementId,
  );
  const supply = snapshot.facts.supply.filter(
    (entry) =>
      entry.settlement.kind === 'embedded' && entry.settlement.settlementId === settlementId,
  );
  if (
    [...roles, ...routes, ...uses, ...products, ...dailyLife, ...supply].some(
      (fact) => fact.origin === 'authored',
    )
  )
    return null;
  const removedIds = new Set(
    [...roles, ...routes, ...uses, ...products, ...dailyLife, ...supply].map((fact) => fact.id),
  );
  const all = regionSemanticFactLists.flatMap<RegionSemanticFact>((key) => snapshot.facts[key]);
  while (true) {
    const dependents = all.filter(
      (fact) =>
        !removedIds.has(fact.id) && regionFactTargets(fact).some((id) => removedIds.has(id)),
    );
    const authoredInbound = all.some(
      (fact) =>
        !removedIds.has(fact.id) &&
        fact.origin === 'authored' &&
        fact.reason?.sources.some(
          (source) => source.kind === 'fact' && removedIds.has(source.factId),
        ),
    );
    if (authoredInbound || dependents.some((fact) => fact.origin === 'authored')) return null;
    if (dependents.length === 0) return removedIds;
    for (const fact of dependents) removedIds.add(fact.id);
  }
}

export function canRemoveRegionSettlement(snapshot: RegionSnapshot, index: number): boolean {
  return (
    hasIndex(snapshot.settlements.length, index) &&
    settlementRemovalDependencies(snapshot, index) !== null
  );
}

export function setRegionText(
  snapshot: RegionSnapshot,
  field: RegionTextField,
  value: string,
): RegionSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * Move the seat of the region to another realm.
 *
 * A realm index that is not there leaves the region alone: the select cannot offer one, so reaching
 * here with a bad index means a hand-edited payload, and a region whose seat points at nothing is
 * worse than one whose seat is unchanged.
 */
export function setRegionMainRealm(snapshot: RegionSnapshot, index: number): RegionSnapshot {
  return hasIndex(snapshot.realms.length, index) ? { ...snapshot, mainRealm: index } : snapshot;
}

function editRealm(
  snapshot: RegionSnapshot,
  index: number,
  change: (realm: StoredRealm) => StoredRealm,
): RegionSnapshot {
  return hasIndex(snapshot.realms.length, index)
    ? { ...snapshot, realms: replaceAt(snapshot.realms, index, change(snapshot.realms[index])) }
    : snapshot;
}

export function setRealmText(
  snapshot: RegionSnapshot,
  index: number,
  field: RealmTextField,
  value: string,
): RegionSnapshot {
  return editRealm(snapshot, index, (realm) => ({ ...realm, [field]: value }));
}

/**
 * Rewrite the name or description of one settlement or organization.
 *
 * The two lists share a function because they share a shape for editing purposes — both are lists
 * of things with a name and a description, and both are stored through their own kind's converter.
 * Anything deeper about a settlement is that kind's editor's business, reached by saving it
 * separately.
 */
export function setRegionPlaceText(
  snapshot: RegionSnapshot,
  list: RegionPlaceList,
  index: number,
  field: 'name' | 'description',
  value: string,
): RegionSnapshot {
  const places = snapshot[list];
  if (list === 'settlements') {
    return hasIndex(snapshot.settlements.length, index)
      ? {
          ...snapshot,
          settlements: replaceAt(snapshot.settlements, index, {
            ...snapshot.settlements[index],
            snapshot: { ...snapshot.settlements[index].snapshot, [field]: value },
          }),
        }
      : snapshot;
  }
  return hasIndex(places.length, index)
    ? {
        ...snapshot,
        organizations: replaceAt(snapshot.organizations, index, {
          ...snapshot.organizations[index],
          [field]: value,
        }),
      }
    : snapshot;
}

/** Take a settlement or an organization out of the region. */
export function removeRegionPlace(
  snapshot: RegionSnapshot,
  list: RegionPlaceList,
  index: number,
): RegionSnapshot {
  const places = snapshot[list];
  if (!hasIndex(places.length, index)) return snapshot;
  if (list === 'settlements') {
    const removedIds = settlementRemovalDependencies(snapshot, index);
    if (removedIds === null) return snapshot;
    return {
      ...snapshot,
      settlements: snapshot.settlements.filter((_place, position) => position !== index),
      facts: removeRegionFactIds(snapshot.facts, removedIds),
    };
  }
  return {
    ...snapshot,
    organizations: snapshot.organizations.filter((_place, position) => position !== index),
  };
}
