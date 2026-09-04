/**
 * Writing a character snapshot, and the shapes one is made of. Reading one back is
 * `character_rehydrate.ts`, split off for the reason settlement's and heraldry's are: resolving an
 * archetype's equipment tables reaches `$lib/archetypes`, and rebuilding a coat of arms reaches
 * `$lib/charges` — 18 MB of glyph art, measured. Nothing that merely stores, lists, or validates a
 * character needs either.
 *
 * Most of a character's bulk is the shared table data it was rolled *from* rather than anything
 * about the character, and requirement 3.2 in docs/workshop.md asks for such values to be stripped
 * **or reconstructed explicitly**. Three are reconstructed here, by name:
 *
 * - **A species is a whole set of generator tables.** Age categories, a size matrix, physical-trait
 *   configs, abilities — none of it is about this person, and every number it produced is already
 *   in the payload. `Species` has no id, so the key is its `name`.
 * - **An archetype carries its own equipment tables.** `equipmentGenerationConfigs` measured 66 KB
 *   per character when the settlement snapshot was designed. A party of six, stored whole, is a
 *   storage-quota problem.
 * - **A coat of arms carries a render function.** `arrangement.renderSVG` is a function on every
 *   charge group, which `structuredClone` — what IndexedDB stores with — refuses outright. Arms
 *   travel the way the heraldry kind stores them, by the names of their parts.
 *
 * The final `stripFunctionValuesDeep` is a net rather than the mechanism, as it is for a
 * settlement: everything this module knows to be a function has already been converted by name, and
 * the strip is what keeps a closure grown somewhere new from turning a save into a `DataCloneError`
 * the user meets instead of a character.
 */

import type { Archetype } from '$lib/archetypes';
import { toStoredArms, type StoredArms } from '$lib/heraldry';
import { stripFunctionValuesDeep } from '$lib/persistent_save';
import { withLegacyActorMechanics, type MechanicsSet } from '$lib/rulesets';

import type { Character } from './character_types.js';

/**
 * An archetype without the equipment tables it was rolled from. See the module comment: they are
 * generator input, not content, and they are rebuilt from the archetype's name on the way back.
 */
export type StoredArchetype = Omit<Archetype, 'equipmentGenerationConfigs'>;

/**
 * A character with the three parts of it that are not this person's own stored as names.
 *
 * Declared here rather than in `$lib/settlements`, which is where it lived until #46. A settlement's
 * notables are characters, and one shape in the library that owns the concept beats two types with
 * one name drifting apart the first time either changes. The move is what
 * `SETTLEMENT_PAYLOAD_VERSION` 2 migrates.
 */
export type StoredCharacter = Omit<
  Character,
  'species' | 'archetype' | 'heraldry' | 'mechanics'
> & {
  speciesName: string;
  mechanics: MechanicsSet;
  archetype?: StoredArchetype;
  /**
   * `undefined` for a character with no arms, a value for one carrying its own, and `null` for one
   * whose arms are a referenced artifact. `null` is a statement rather than a gap: it says the arms
   * are a record of their own that someone may edit later, and the artifact reference beside the
   * payload says which.
   */
  heraldry?: StoredArms | null;
};

/**
 * A character as an artifact payload.
 *
 * Identical to {@link StoredCharacter} today, and named separately all the same: this is the
 * artifact's payload shape, which the kind's `validate` and `migrate` speak, where `StoredCharacter`
 * is what a settlement embeds. They are free to diverge, and the day one does the other should not
 * follow it silently.
 */
export type CharacterSnapshot = StoredCharacter;

export function toStoredArchetype(archetype: Archetype): StoredArchetype {
  const { equipmentGenerationConfigs: _configs, ...rest } = archetype;
  return rest;
}

/**
 * A character with its species, archetype, and arms written as names.
 *
 * No strip here: this is the conversion a settlement composes into a much larger one, and running
 * the net over each notable separately would walk the same tree once per person. `toCharacterSnapshot`
 * below is where a character stored on its own gets it.
 */
export function toStoredCharacter(character: Character): StoredCharacter {
  const { species, archetype, heraldry, ...rest } = character;
  return withLegacyActorMechanics(
    {
      ...rest,
      speciesName: species.name,
      ...(archetype === undefined ? {} : { archetype: toStoredArchetype(archetype) }),
      ...(heraldry === undefined ? {} : { heraldry: toStoredArms(heraldry) }),
    },
    'generated',
  ) as StoredCharacter;
}

/**
 * A character as an artifact payload.
 *
 * `referencedArms` says that this character's coat of arms is a saved artifact rather than its own.
 * The payload then stores `heraldry: null` and the reference beside it says which — copying the arms
 * in would fork them at the moment of saving, so an edit to that coat of arms would never reach the
 * character wearing it, which is the opposite of what composition is for.
 */
export function toCharacterSnapshot(
  character: Character,
  referencedArms = false,
): CharacterSnapshot {
  const stored = toStoredCharacter(character);
  const converted: CharacterSnapshot = referencedArms ? { ...stored, heraldry: null } : stored;
  return stripFunctionValuesDeep(converted) as CharacterSnapshot;
}
