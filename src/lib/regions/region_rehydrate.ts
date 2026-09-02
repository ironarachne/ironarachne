/**
 * Rebuilding a region from a snapshot.
 *
 * Split from `region_snapshot.ts` for what this import costs. Reading a region reaches the culture,
 * settlement, organization and character rehydrators, and through a character's arms it reaches the
 * charge art — 18 MB of it. Writing a region, listing one, or validating one reaches none of that.
 *
 * **Nothing here is recomputed.** Every name, every description, every tile comes back exactly as
 * it was stored, per requirement 4.2 in docs/workshop.md. What is rebuilt rather than copied is
 * what the stored vocabulary rebuilds by name: a species, an archetype, a charge, and — new here —
 * a realm's type.
 *
 * **A region whose culture was referenced reads back with `null`.** The payload holds nothing where
 * the culture would be, because the culture is a separate artifact, and `Region.dominantCulture` is
 * nullable for exactly this — the same position `$lib/culture` takes for a referenced religion.
 * The reference is what says which culture it actually was, and resolving it is the consumer's job.
 */

import type { RNG } from '@ironarachne/rng';

import { characterFromStored } from '$lib/characters';
import { cultureFromSnapshot } from '$lib/culture';
import { armsFromStored } from '$lib/heraldry';
import { organizationFromStored } from '$lib/organizations';
import { RealmTypes, type Realm, type RealmType } from '$lib/realms';
import { settlementFromSnapshot } from '$lib/settlements';

import type Region from './region.js';
import type { RegionSnapshot, StoredRealm } from './region_snapshot.js';

/**
 * The realm type a stored name refers to, or an inert stand-in when this build no longer has it.
 *
 * A placeholder rather than a refusal, matching how an unknown species is handled: a region saved
 * against a build that had a realm type this one dropped is still a region, and losing the label on
 * one realm is a smaller loss than losing the map.
 */
export function realmTypeFromStoredName(name: string): RealmType {
  const known = RealmTypes.getByName(name);
  if (known !== undefined) {
    return known;
  }
  return {
    name,
    minTiles: 0,
    maxTiles: 0,
    grantedTitle: {
      tags: [],
      femaleTitle: '',
      maleTitle: '',
      femaleHonorific: '',
      maleHonorific: '',
      hasLands: false,
      isHereditary: false,
      isNoble: false,
      isRoyal: false,
      landName: '',
      precedence: 0,
    },
    commonality: 0,
    isStandalone: true,
    parentType: null,
  };
}

function realmFromStored(stored: StoredRealm): Realm {
  const { heraldry, authority, realmTypeName, ...rest } = stored;
  return {
    ...rest,
    heraldry: armsFromStored(heraldry),
    authority: characterFromStored(authority),
    realmType: realmTypeFromStoredName(realmTypeName),
  };
}

export function regionFromSnapshot(snapshot: RegionSnapshot, rng: RNG): Region {
  return {
    name: snapshot.name,
    description: snapshot.description,
    environment: snapshot.environment,
    dominantCulture:
      snapshot.dominantCulture === null ? null : cultureFromSnapshot(snapshot.dominantCulture, rng),
    settlements: snapshot.settlements.map(settlementFromSnapshot),
    mainRealm: snapshot.mainRealm,
    realms: snapshot.realms.map(realmFromStored),
    authority: characterFromStored(snapshot.authority),
    organizations: snapshot.organizations.map(organizationFromStored),
    map: snapshot.map,
  };
}
