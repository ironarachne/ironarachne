/**
 * Writing an encounter for storage, and the shapes one is made of. Reading one back is
 * `encounter_rehydrate.ts`, split off for the reason the character's halves are: rebuilding a
 * character's archetype reaches `$lib/archetypes` and its arms reach `$lib/charges`, and nothing
 * that merely stores, lists or validates an encounter needs either.
 *
 * **The payload holds the resolved groups, never the template that produced them.** An
 * `EncounterGroupTemplate` carries three arrays of mutator functions and two tag filters; they are
 * generator input, and what they produced is in the creatures. The template's name is recorded as
 * provenance (`encounter_roll.ts`) so a re-roll can find it again.
 *
 * **Every mob is a character or a creature, and the payload says which.** A `MobGroup` holds
 * `Mob`s, which is the base both share, and a `Character` is a `Creature` with a name, an archetype
 * and titles — so a stored mob is `StoredCharacter` or `StoredCreature` from the stored vocabulary,
 * with a `mobKind` beside it. The discriminator is written on the way in rather than inferred on
 * the way out because inference from field presence is exactly the kind of guess a migration
 * later has to undo.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism, as it is for a
 * settlement: species, archetype and arms have already been converted by name, and the strip is
 * what keeps a closure grown somewhere new from turning a save into a `DataCloneError`.
 */

import { toStoredCharacter, type Character, type StoredCharacter } from '$lib/characters';
import { toStoredCreature, type Creature, type StoredCreature } from '$lib/creatures';
import type { Mob, MobGroup } from '$lib/mobs';
import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type { Encounter } from './encounter_types.js';

/** A stored mob: a character or a creature, and which. */
export type StoredEncounterMob =
  | ({ mobKind: 'character' } & StoredCharacter)
  | ({ mobKind: 'creature' } & StoredCreature);

/** One band in a stored encounter. */
export type StoredEncounterGroup = Omit<MobGroup, 'mobs'> & {
  mobs: StoredEncounterMob[];
};

/** An encounter as it is stored. */
export type EncounterSnapshot = Omit<Encounter, 'groups'> & {
  groups: StoredEncounterGroup[];
};

/**
 * Whether a mob in an encounter is a character.
 *
 * `Mob` itself carries no species, name parts or archetype; the concrete types do. A character is
 * the only mob with a `firstName`, and that is what the generator page and the snapshot both key
 * on rather than two different heuristics.
 */
export function isEncounterCharacter(mob: Mob): mob is Character {
  return typeof (mob as Partial<Character>).firstName === 'string';
}

function toStoredMob(mob: Mob): StoredEncounterMob {
  return isEncounterCharacter(mob)
    ? { mobKind: 'character', ...toStoredCharacter(mob) }
    : { mobKind: 'creature', ...toStoredCreature(mob as Creature) };
}

function toStoredGroup(group: MobGroup): StoredEncounterGroup {
  const { mobs, ...rest } = group;
  return { ...rest, tags: [...group.tags], mobs: mobs.map(toStoredMob) };
}

export function toEncounterSnapshot(encounter: Encounter): EncounterSnapshot {
  const converted: EncounterSnapshot = {
    name: encounter.name,
    description: encounter.description,
    difficulty: encounter.difficulty,
    groups: encounter.groups.map(toStoredGroup),
  };
  return stripFunctionValuesDeep(converted) as EncounterSnapshot;
}
