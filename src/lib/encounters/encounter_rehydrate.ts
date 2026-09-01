/**
 * Rebuilding an encounter from a snapshot.
 *
 * **Nothing here is recomputed.** Every name, every height, every trait comes back exactly as it
 * was stored, per requirement 4.2 in docs/workshop.md. Species and archetypes are resolved by name
 * only, and a name this build no longer has becomes an inert placeholder rather than a refusal —
 * `$lib/characters` and `$lib/creatures` each own that rule for their half.
 */

import type { RNG } from '@ironarachne/rng';

import { characterFromStored } from '$lib/characters';
import { creatureFromStored } from '$lib/creatures';
import type { Mob, MobGroup } from '$lib/mobs';

import type {
  EncounterSnapshot,
  StoredEncounterGroup,
  StoredEncounterMob,
} from './encounter_snapshot.js';
import type { Encounter } from './encounter_types.js';

function mobFromStored(stored: StoredEncounterMob): Mob {
  if (stored.mobKind === 'character') {
    const { mobKind: _kind, ...character } = stored;
    return characterFromStored(character);
  }
  const { mobKind: _kind, ...creature } = stored;
  return creatureFromStored(creature);
}

function groupFromStored(stored: StoredEncounterGroup): MobGroup {
  const { mobs, ...rest } = stored;
  return { ...rest, tags: [...stored.tags], mobs: mobs.map(mobFromStored) };
}

export function encounterFromSnapshot(snapshot: EncounterSnapshot): Encounter {
  return {
    name: snapshot.name,
    description: snapshot.description,
    difficulty: snapshot.difficulty,
    groups: snapshot.groups.map(groupFromStored),
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: an encounter is finished when
 * it is stored, and drawing anything from a seed on the way back would be regenerating over the
 * user's edits.
 */
export function encounterFromSnapshotWithRng(snapshot: EncounterSnapshot, _rng: RNG): Encounter {
  return encounterFromSnapshot(snapshot);
}
