/**
 * Rebuilding an organization from its stored form.
 *
 * **Nothing here is recomputed.** The maps are rebuilt from their entries, the people come back
 * through `$lib/characters` — species and archetype by name, unknown names becoming placeholders —
 * and the identity through `$lib/visual_identity`. `kindId` stays a string: the kind is a table of
 * closures the generator used, and an organization that has been rolled needs nothing from it.
 */

import type { RNG } from '@ironarachne/rng';

import { characterFromStored } from '$lib/characters';
import { visualIdentityFromStored } from '$lib/visual_identity';

import type {
  OrganizationSnapshot,
  StoredOrganization,
  StoredOrganizationHierarchy,
} from './organization_snapshot.js';
import type { Organization, OrganizationHierarchy } from './organization_types.js';

export function hierarchyFromStored(stored: StoredOrganizationHierarchy): OrganizationHierarchy {
  return {
    childToParent: new Map(stored.childToParent),
    idToOrder: new Map(stored.idToOrder),
    roleById: new Map(stored.roleById),
  };
}

export function organizationFromStored(stored: StoredOrganization): Organization {
  return {
    ...stored,
    hierarchy: hierarchyFromStored(stored.hierarchy),
    leader: characterFromStored(stored.leader),
    notableMembers: stored.notableMembers.map(characterFromStored),
    visualIdentity: visualIdentityFromStored(stored.visualIdentity),
    relationships: stored.relationships.map((relationship) => ({ ...relationship })),
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: an organization is finished
 * when it is stored, and drawing anything from a seed on the way back would be regenerating over
 * the user's edits.
 */
export function organizationFromSnapshot(snapshot: OrganizationSnapshot, _rng: RNG): Organization {
  return organizationFromStored(snapshot);
}
