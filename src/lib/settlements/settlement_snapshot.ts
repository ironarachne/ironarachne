/**
 * Writing a settlement snapshot, and the shapes one is made of. Reading one back is
 * `settlement_rehydrate.ts`, split off for the reason heraldry's is: turning stored names back
 * into charges reaches `$lib/charges`, which is 18 MB of glyph art, and nothing that merely
 * stores, lists, or validates a settlement needs it.
 *
 * A settlement is the first artifact payload on the site built against the kind contract from
 * scratch rather than retrofitted, and three things in it are not plain data. Each is handled
 * explicitly here rather than left to a blanket strip, because requirement 3.2 in
 * docs/workshop.md asks for exactly that — stripped *or reconstructed*, and named either way:
 *
 * - **An organization's hierarchy is three `Map`s.** `JSON.stringify` turns a `Map` into `{}`
 *   without complaining, so a settlement stored naively came back with every organization's
 *   structure silently emptied. They are stored as entry arrays.
 * - **A coat of arms carries a render function.** `arrangement.renderSVG` is a function on every
 *   charge group, which `structuredClone` — what IndexedDB stores with — refuses outright. Arms
 *   are stored the way the heraldry kind stores them, by the names of their parts.
 * - **An archetype carries its own generator tables.** `equipmentGenerationConfigs` is 66 KB per
 *   character, measured, and it is the input a character was rolled *from* rather than anything
 *   about the character. Kept, one enriched settlement is a megabyte and a campaign's worth is a
 *   storage-quota problem; dropped and rebuilt from the archetype's name, the same settlement is
 *   about forty kilobytes. That is the trade the heraldry kind already makes with charge names.
 */

import type { Archetype } from '$lib/archetypes';
import type { Character } from '$lib/characters';
import { toStoredArms, type StoredArms } from '$lib/heraldry';
import type { OrganizationHierarchy, Organization, RoleId, RoleInfo } from '$lib/organizations';
import { stripFunctionValuesDeep } from '$lib/persistent_save';
import type { VisualEmblem, VisualIdentity } from '$lib/visual_identity';

import type { Settlement, SettlementImportantPerson } from './settlement_types.js';

/**
 * An archetype without the equipment tables it was rolled from. See the module comment: they are
 * generator input, not content, and they are rebuilt from the archetype's name on the way back.
 */
export type StoredArchetype = Omit<Archetype, 'equipmentGenerationConfigs'>;

/** A character with the two parts of it that are not plain data stored as names. */
export type StoredCharacter = Omit<Character, 'archetype' | 'heraldry'> & {
  archetype?: StoredArchetype;
  heraldry?: StoredArms;
};

export type StoredSettlementNotable = Omit<SettlementImportantPerson, 'character'> & {
  character: StoredCharacter;
};

/** The three `Map`s of an {@link OrganizationHierarchy} as entry arrays, in their own order. */
export type StoredOrganizationHierarchy = {
  childToParent: [RoleId, RoleId | null][];
  idToOrder: [RoleId, number][];
  roleById: [RoleId, RoleInfo][];
};

/** Every emblem variant but heraldry is already plain data and travels as it is. */
export type StoredVisualEmblem =
  | Exclude<VisualEmblem, { kind: 'heraldry' }>
  | { kind: 'heraldry'; arms: StoredArms };

export type StoredVisualIdentity = Omit<VisualIdentity, 'emblem'> & {
  emblem: StoredVisualEmblem;
};

export type StoredOrganization = Omit<
  Organization,
  'hierarchy' | 'leader' | 'notableMembers' | 'visualIdentity'
> & {
  hierarchy: StoredOrganizationHierarchy;
  leader: StoredCharacter;
  notableMembers: StoredCharacter[];
  visualIdentity: StoredVisualIdentity;
};

/**
 * A settlement as it is stored. Everything the settlement itself holds travels straight through;
 * only what it borrows from `$lib/characters`, `$lib/organizations`, and `$lib/heraldry` is
 * rewritten, and only where those carry something JSON does not have.
 */
export type SettlementSnapshot = Omit<Settlement, 'importantPeople' | 'organizations'> & {
  importantPeople?: StoredSettlementNotable[];
  organizations?: StoredOrganization[];
};

function toStoredArchetype(archetype: Archetype): StoredArchetype {
  const { equipmentGenerationConfigs: _configs, ...rest } = archetype;
  return rest;
}

function toStoredCharacter(character: Character): StoredCharacter {
  const { archetype, heraldry, ...rest } = character;
  return {
    ...rest,
    ...(archetype === undefined ? {} : { archetype: toStoredArchetype(archetype) }),
    ...(heraldry === undefined ? {} : { heraldry: toStoredArms(heraldry) }),
  };
}

function toStoredNotable(notable: SettlementImportantPerson): StoredSettlementNotable {
  return { ...notable, character: toStoredCharacter(notable.character) };
}

function toStoredHierarchy(hierarchy: OrganizationHierarchy): StoredOrganizationHierarchy {
  return {
    childToParent: [...hierarchy.childToParent],
    idToOrder: [...hierarchy.idToOrder],
    roleById: [...hierarchy.roleById],
  };
}

function toStoredVisualIdentity(identity: VisualIdentity): StoredVisualIdentity {
  const { emblem } = identity;
  return {
    ...identity,
    emblem:
      emblem.kind === 'heraldry' ? { kind: 'heraldry', arms: toStoredArms(emblem.arms) } : emblem,
  };
}

function toStoredOrganization(organization: Organization): StoredOrganization {
  return {
    ...organization,
    hierarchy: toStoredHierarchy(organization.hierarchy),
    leader: toStoredCharacter(organization.leader),
    notableMembers: organization.notableMembers.map(toStoredCharacter),
    visualIdentity: toStoredVisualIdentity(organization.visualIdentity),
  };
}

/**
 * A settlement as an artifact payload.
 *
 * The final strip is a net rather than the mechanism: everything this module knows to be a
 * function has already been converted by name above, and the strip is what keeps a function
 * added to some borrowed type later from turning a save into a `DataCloneError` the user meets
 * instead of a settlement. It runs after the conversions, so the `Map`s are already arrays by the
 * time it walks them.
 */
export function toSettlementSnapshot(settlement: Settlement): SettlementSnapshot {
  const { importantPeople, organizations, ...rest } = settlement;
  const converted: SettlementSnapshot = {
    ...rest,
    ...(importantPeople === undefined
      ? {}
      : { importantPeople: importantPeople.map(toStoredNotable) }),
    ...(organizations === undefined
      ? {}
      : { organizations: organizations.map(toStoredOrganization) }),
  };
  return stripFunctionValuesDeep(converted) as SettlementSnapshot;
}
