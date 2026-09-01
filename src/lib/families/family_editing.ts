/**
 * Editing a saved family, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one cousin must not
 * disturb another — and it is what lets the editing framework compare what is on screen against
 * what was read to decide whether anything needs saving.
 *
 * **What is editable is what the page shows** (4.1): the family's name, and each member's first
 * and last name. A member's display `name` follows the two parts through the same helper the
 * character editor uses, so the three cannot fall out of step. Species, age, gender and the
 * description are shown and not edited here: a member is a whole character, and the character
 * kind's own editor is where a person is reworked. Removing a member takes their edges with them —
 * an edge to nobody is a well-defined state the readers tolerate, but not one an editor should
 * leave behind on purpose — and clears the head if it was them.
 *
 * **Nothing here recomputes anything.** Renaming the family does not rename its members: the
 * surname each carries was decided by the tradition at roll time, and a user who renames the house
 * may well mean the house alone.
 */

import { formatCharacterDisplayName } from '$lib/characters';

import type { FamilySnapshot } from './family_snapshot.js';

/** The parts of a member's name the page prints. */
export type FamilyMemberNameField = 'firstName' | 'lastName';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

export function setFamilyName(snapshot: FamilySnapshot, name: string): FamilySnapshot {
  return { ...snapshot, name };
}

export function setFamilyMemberName(
  snapshot: FamilySnapshot,
  index: number,
  field: FamilyMemberNameField,
  value: string,
): FamilySnapshot {
  if (!hasIndex(snapshot.members.length, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    members: snapshot.members.map((member, position) => {
      if (position !== index) {
        return member;
      }
      const renamed = { ...member, [field]: value };
      return { ...renamed, name: formatCharacterDisplayName(renamed.firstName, renamed.lastName) };
    }),
  };
}

export function removeFamilyMember(snapshot: FamilySnapshot, index: number): FamilySnapshot {
  if (!hasIndex(snapshot.members.length, index)) {
    return snapshot;
  }
  const removedId = snapshot.members[index].id;
  const { headId, ...rest } = snapshot;
  return {
    ...rest,
    ...(headId === undefined || headId === removedId ? {} : { headId }),
    members: snapshot.members.filter((_member, position) => position !== index),
    memberIds: snapshot.memberIds.filter((id) => id !== removedId),
    relationships: snapshot.relationships.filter(
      (edge) => edge.originatorId !== removedId && edge.recipientId !== removedId,
    ),
  };
}
