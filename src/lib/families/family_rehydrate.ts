/**
 * Rebuilding a family from a snapshot.
 *
 * **Nothing here is recomputed.** Every member comes back exactly as stored — `$lib/characters`
 * resolves species and archetypes by name and falls back to inert placeholders — and every edge
 * is copied. The two name generators are the one thing that is *built* rather than copied, from
 * the stored pattern sources and the RNG the codec is handed, exactly as a culture's are. They
 * exist so a family can keep naming new members; they name nobody on the way back.
 */

import * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';

import { characterFromStored } from '$lib/characters';

import type { FamilySnapshot } from './family_snapshot.js';
import type { Family } from './family_types.js';

export function familyFromSnapshot(snapshot: FamilySnapshot, rng: RNG): Family {
  return {
    id: snapshot.id,
    name: snapshot.name,
    ...(snapshot.headId === undefined ? {} : { headId: snapshot.headId }),
    members: snapshot.members.map(characterFromStored),
    memberIds: [...snapshot.memberIds],
    relationships: snapshot.relationships.map((relationship) => ({ ...relationship })),
    femaleNameGenerator: MUN.getNameGeneratorForPatternSet(
      'female',
      snapshot.namePatterns.female,
      rng,
    ),
    maleNameGenerator: MUN.getNameGeneratorForPatternSet('male', snapshot.namePatterns.male, rng),
  };
}
