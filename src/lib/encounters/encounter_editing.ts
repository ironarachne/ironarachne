/**
 * Editing a saved encounter, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one bandit must not
 * disturb another, and renaming a group must not touch who is in it — and it is what lets the
 * editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * **What is editable is what the page shows** (4.1): the encounter's name, each group's name, and
 * each mob's name, plus removing a mob or a whole group. A mob's species and archetype are shown
 * but not edited: they are the names other tables are resolved from, and a text box over them
 * would let a user type a species this build cannot describe. Changing them is what a re-roll is
 * for, and a re-roll is a button of its own (4.3).
 *
 * **Nothing here recomputes anything.** Renaming a character sets its `name` and leaves
 * `firstName` and `lastName` as they were rolled: the display name is what the encounter prints,
 * and rewriting the parts from a whole would be guessing where the surname starts.
 *
 * There is no "add a mob". A mob is a whole rolled creature — a species, a body, traits, abilities
 * — and a blank one would be a row the export prints as nothing. A user who wants one more bandit
 * re-rolls the encounter with a different seed.
 */

import type { EncounterSnapshot, StoredEncounterGroup } from './encounter_snapshot.js';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_entry, position) => position !== index);
}

function editGroup(
  snapshot: EncounterSnapshot,
  index: number,
  change: (group: StoredEncounterGroup) => StoredEncounterGroup,
): EncounterSnapshot {
  return hasIndex(snapshot.groups.length, index)
    ? { ...snapshot, groups: replaceAt(snapshot.groups, index, change(snapshot.groups[index])) }
    : snapshot;
}

export function setEncounterName(snapshot: EncounterSnapshot, name: string): EncounterSnapshot {
  return { ...snapshot, name };
}

export function setEncounterGroupName(
  snapshot: EncounterSnapshot,
  index: number,
  name: string,
): EncounterSnapshot {
  return editGroup(snapshot, index, (group) => ({ ...group, name }));
}

export function setEncounterMobName(
  snapshot: EncounterSnapshot,
  groupIndex: number,
  mobIndex: number,
  name: string,
): EncounterSnapshot {
  return editGroup(snapshot, groupIndex, (group) =>
    hasIndex(group.mobs.length, mobIndex)
      ? { ...group, mobs: replaceAt(group.mobs, mobIndex, { ...group.mobs[mobIndex], name }) }
      : group,
  );
}

export function removeEncounterMob(
  snapshot: EncounterSnapshot,
  groupIndex: number,
  mobIndex: number,
): EncounterSnapshot {
  return editGroup(snapshot, groupIndex, (group) =>
    hasIndex(group.mobs.length, mobIndex)
      ? { ...group, mobs: removeAt(group.mobs, mobIndex) }
      : group,
  );
}

export function removeEncounterGroup(
  snapshot: EncounterSnapshot,
  index: number,
): EncounterSnapshot {
  return hasIndex(snapshot.groups.length, index)
    ? { ...snapshot, groups: removeAt(snapshot.groups, index) }
    : snapshot;
}
