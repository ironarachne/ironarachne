/**
 * Editing a saved organization, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming the guild must not
 * disturb its guildmaster — and it is what lets the editing framework compare what is on screen
 * against what was read to decide whether anything needs saving.
 *
 * **What is editable is what the page shows** (4.1): the name and description, the motto, the
 * profile's traits, goal, weakness, standing and hook, and each person's names and description.
 * The emblem's parameters are shown — drawn, from the stored parameters — and the palette's
 * colours can be changed; the emblem itself is what a re-roll is for, since a merchant mark or a
 * coat of arms is a whole generated thing rather than a field.
 *
 * **Nothing here recomputes anything.** The description was composed from the profile at roll
 * time; changing a trait's label does not rewrite the paragraph that mentions it, because the two
 * are separate decisions and a form that silently rewrote a user's prose would overrule them.
 * Renaming a person sets the two parts and derives the display name from them through the same
 * helper the character editor uses.
 */

import { formatCharacterDisplayName, type StoredCharacter } from '$lib/characters';

import type { OrganizationSnapshot } from './organization_snapshot.js';

export type OrganizationTextField = 'name' | 'description';
export type OrganizationFacetField = 'goal' | 'weakness' | 'publicStanding';
export type OrganizationColorSlot = 'primary' | 'secondary' | 'accent';
/** The leader, or a notable member by position. */
export type OrganizationPerson = 'leader' | number;
export type OrganizationPersonField = 'firstName' | 'lastName' | 'description';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

export function setOrganizationText(
  snapshot: OrganizationSnapshot,
  field: OrganizationTextField,
  value: string,
): OrganizationSnapshot {
  return { ...snapshot, [field]: value };
}

export function setOrganizationMotto(
  snapshot: OrganizationSnapshot,
  motto: string,
): OrganizationSnapshot {
  const { motto: _motto, ...identity } = snapshot.visualIdentity;
  return {
    ...snapshot,
    visualIdentity: motto.trim() === '' ? identity : { ...identity, motto },
  };
}

/**
 * One colour of the palette.
 *
 * A palette needs a primary; clearing it removes the palette, and clearing a secondary or an
 * accent removes that slot. The value is stored as typed — it is a CSS colour string and the page
 * renders whatever it is given.
 */
export function setOrganizationColor(
  snapshot: OrganizationSnapshot,
  slot: OrganizationColorSlot,
  value: string,
): OrganizationSnapshot {
  const { colors: existing, ...identity } = snapshot.visualIdentity;
  const colors = { ...(existing ?? { primary: '' }) };
  if (value.trim() === '') {
    delete colors[slot];
  } else {
    colors[slot] = value;
  }
  // A palette with no primary is no palette: clearing the primary drops it, and clearing an accent
  // on an organization that never had a palette must not invent one with an empty primary.
  if ((colors.primary ?? '').trim() === '') {
    return { ...snapshot, visualIdentity: identity };
  }
  return { ...snapshot, visualIdentity: { ...identity, colors } };
}

export function setOrganizationHook(
  snapshot: OrganizationSnapshot,
  hook: string,
): OrganizationSnapshot {
  return { ...snapshot, profile: { ...snapshot.profile, hook } };
}

export function setOrganizationFacetLabel(
  snapshot: OrganizationSnapshot,
  facet: OrganizationFacetField,
  label: string,
): OrganizationSnapshot {
  return {
    ...snapshot,
    profile: { ...snapshot.profile, [facet]: { ...snapshot.profile[facet], label } },
  };
}

export function setOrganizationTraitLabel(
  snapshot: OrganizationSnapshot,
  index: number,
  label: string,
): OrganizationSnapshot {
  const traits = snapshot.profile.personalityTraits;
  if (!hasIndex(traits.length, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    profile: {
      ...snapshot.profile,
      personalityTraits: traits.map((trait, position) =>
        position === index ? { ...trait, label } : trait,
      ),
    },
  };
}

/** A blank trait: the id is the user's, since no table row produced it. */
export function addOrganizationTrait(snapshot: OrganizationSnapshot): OrganizationSnapshot {
  return {
    ...snapshot,
    profile: {
      ...snapshot.profile,
      personalityTraits: [...snapshot.profile.personalityTraits, { id: 'custom', label: '' }],
    },
  };
}

export function removeOrganizationTrait(
  snapshot: OrganizationSnapshot,
  index: number,
): OrganizationSnapshot {
  const traits = snapshot.profile.personalityTraits;
  if (!hasIndex(traits.length, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    profile: {
      ...snapshot.profile,
      personalityTraits: traits.filter((_trait, position) => position !== index),
    },
  };
}

function withPersonField(
  person: StoredCharacter,
  field: OrganizationPersonField,
  value: string,
): StoredCharacter {
  const changed = { ...person, [field]: value };
  return field === 'description'
    ? changed
    : { ...changed, name: formatCharacterDisplayName(changed.firstName, changed.lastName) };
}

export function setOrganizationPersonField(
  snapshot: OrganizationSnapshot,
  person: OrganizationPerson,
  field: OrganizationPersonField,
  value: string,
): OrganizationSnapshot {
  if (person === 'leader') {
    return { ...snapshot, leader: withPersonField(snapshot.leader, field, value) };
  }
  if (!hasIndex(snapshot.notableMembers.length, person)) {
    return snapshot;
  }
  return {
    ...snapshot,
    notableMembers: snapshot.notableMembers.map((member, position) =>
      position === person ? withPersonField(member, field, value) : member,
    ),
  };
}

/** The leader cannot be removed — an organization has one by construction — but a notable can. */
export function removeOrganizationNotable(
  snapshot: OrganizationSnapshot,
  index: number,
): OrganizationSnapshot {
  if (!hasIndex(snapshot.notableMembers.length, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    notableMembers: snapshot.notableMembers.filter((_member, position) => position !== index),
  };
}
