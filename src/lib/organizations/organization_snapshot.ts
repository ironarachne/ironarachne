/**
 * Writing an organization snapshot, and the shapes one is made of. Reading one back is
 * `organization_rehydrate.ts`, split off for the reason the character's halves are: rebuilding a
 * member reaches the archetype tables and rebuilding arms reaches `$lib/charges`, and nothing that
 * merely stores, lists or validates an organization needs either.
 *
 * Declared here since #56. `StoredOrganization` and `StoredOrganizationHierarchy` lived in
 * `src/lib/settlements/settlement_snapshot.ts` until then, because a settlement's organizations
 * were the first anything stored — the move the stored vocabulary in docs/tool-readiness.md called
 * for. The settlement kind composes these now and re-exports the names.
 *
 * Three parts of an `Organization` are not plain data, and each is handled by name:
 *
 * - **The hierarchy is three `Map`s.** `JSON.stringify` turns a `Map` into `{}` without
 *   complaining, which is how a naively stored settlement once came back with every organization's
 *   structure silently emptied. They travel as entry arrays.
 * - **The leader and the notable members are characters**, stored as `StoredCharacter`.
 * - **The visual identity may be heraldic**, stored as `StoredVisualIdentity`.
 *
 * **`kindId` is already the right shape.** An `OrganizationKindDefinition` carries three closures
 * — `buildVisualExtras`, `generateName`, `prepareCharacterConfigForRole` — and the organization
 * has only ever recorded the kind's id. Nothing to convert. Note that this kind registry predates
 * the artifact kind registry and means something else: `kindId` names what sort of organization
 * this is, and `ArtifactKind` names what sort of payload.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism: everything this module
 * knows to be a function has already been converted, and the strip is what keeps a closure grown
 * somewhere new from turning a save into a `DataCloneError`.
 */

import { toStoredCharacter, type StoredCharacter } from '$lib/characters';
import { stripFunctionValuesDeep } from '$lib/persistent_save';
import { toStoredVisualIdentity, type StoredVisualIdentity } from '$lib/visual_identity';

import type {
  Organization,
  OrganizationHierarchy,
  RoleId,
  RoleInfo,
} from './organization_types.js';

/** The three `Map`s of an {@link OrganizationHierarchy} as entry arrays, in their own order. */
export type StoredOrganizationHierarchy = {
  childToParent: [RoleId, RoleId | null][];
  idToOrder: [RoleId, number][];
  roleById: [RoleId, RoleInfo][];
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
 * An organization as an artifact payload.
 *
 * Identical to {@link StoredOrganization} today, and named separately all the same: this is the
 * artifact's payload shape, which the kind's `validate` and `migrate` speak, where
 * `StoredOrganization` is what a settlement embeds. They are free to diverge.
 */
export type OrganizationSnapshot = StoredOrganization;

export function toStoredHierarchy(hierarchy: OrganizationHierarchy): StoredOrganizationHierarchy {
  return {
    childToParent: [...hierarchy.childToParent],
    idToOrder: [...hierarchy.idToOrder],
    roleById: [...hierarchy.roleById],
  };
}

/**
 * An organization with its maps, people and arms written for storage.
 *
 * No strip here: this is the conversion a settlement composes into a much larger one, and running
 * the net over each organization separately would walk the same tree once per organization.
 * `toOrganizationSnapshot` below is where an organization stored on its own gets it.
 */
export function toStoredOrganization(
  organization: Organization,
  referencedArms = false,
): StoredOrganization {
  return {
    ...organization,
    hierarchy: toStoredHierarchy(organization.hierarchy),
    leader: toStoredCharacter(organization.leader),
    notableMembers: organization.notableMembers.map(toStoredCharacter),
    visualIdentity: toStoredVisualIdentity(organization.visualIdentity, referencedArms),
    relationships: organization.relationships.map((relationship) => ({ ...relationship })),
  };
}

/**
 * An organization as an artifact payload.
 *
 * `referencedArms` says the heraldic emblem is a saved coat of arms rather than this
 * organization's own; the payload then stores `arms: null` and the reference beside it says which.
 */
export function toOrganizationSnapshot(
  organization: Organization,
  referencedArms = false,
): OrganizationSnapshot {
  return stripFunctionValuesDeep(
    toStoredOrganization(organization, referencedArms),
  ) as OrganizationSnapshot;
}
