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
  return hasIndex(places.length, index)
    ? {
        ...snapshot,
        [list]: replaceAt(places, index, { ...places[index], [field]: value }),
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
  return hasIndex(places.length, index)
    ? { ...snapshot, [list]: places.filter((_place, position) => position !== index) }
    : snapshot;
}
