/**
 * The single path from a seed to a fantasy character, and the record of how it was rolled.
 *
 * Modelled on `adnd_character_roll.ts` and `settlement_roll.ts`, and here for the same reason:
 * requirement 2.2 in docs/workshop.md wants the same seed and configuration to give the same
 * character, and a generator whose configuration is assembled inline in a Svelte component
 * satisfies that only for as long as nobody edits the component. Once an artifact can be
 * re-rolled, "reproduce this" also needs somewhere to read the settings back from.
 *
 * **The clock leaves the generation path here.** `CharacterGenerator.svelte` used to reseed from
 * `Date.now()` inside the roll, and to name from `` `${Date.now()}-character-name` ``, so the same
 * seed did not in fact produce the same character — 2.2 was already failing before anything was
 * saved. Pressing Generate now draws a *new seed* from the page's own RNG and the roll itself is a
 * pure function of seed and config.
 */

import { RNG } from '@ironarachne/rng';

import { getAllFantasyArchetypes, type Archetype } from '$lib/archetypes';
import { getCategoryList } from '$lib/age';
import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';
import { human, sentientSpeciesList } from '$lib/species_sentients';
import type { Species } from '$lib/species';

import { generate } from './character_generation.js';
import {
  applyGeneratedCharacterName,
  generateCharacterName,
  peopleNameGeneratorsFromNameSet,
  type NamingGender,
} from './character_name_generation.js';
import { toCharacterSnapshot, type CharacterSnapshot } from './character_snapshot.js';
import type { Character } from './character_types.js';

/** The generator's own value for "let the seed choose", in every select that has one. */
export const CHARACTER_ANY = 'Random' as const;

/**
 * What the character generator records about how it rolled, and what a re-roll reads back.
 *
 * It is exactly what the page's four selects and its naming section say, stated as a type rather
 * than read field by field at the call site, so the two ends — what the generator writes and what a
 * re-roll expects — are in one place and drift loudly instead of quietly.
 */
export type CharacterGeneratorConfigRecord = {
  /** The species to roll, or absent for whichever one the page's default names. */
  speciesName?: string;
  /** A single archetype to roll from, or absent to draw from all of them. */
  archetypeName?: string;
  /** `male` or `female` to fix the character's gender, or absent to let the seed choose. */
  genderName?: string;
  /** An age category by name, or absent to let the seed choose. */
  ageCategoryName?: string;
  /**
   * The name pattern set the character's names were built from.
   *
   * A character named from a culture records that culture's own pattern set here rather than the
   * culture's id, so a re-roll produces names of the same tongue without reaching back into the
   * store for an artifact it has no way to ask for. The link to the culture is an artifact
   * reference and lives beside the payload, not in this record.
   */
  nameGeneratorSet?: string;
  /** Which name to draw. `random` follows the character's own gender, as the page does. */
  namingGender?: NamingGender;
};

/** A part of the roll that the recorded config asked for and this build could not supply. */
export type CharacterRollSubstitution = 'species' | 'archetype' | 'nameGeneratorSet';

/**
 * A rolled character, and what the roll actually used.
 *
 * The resolved values travel back out because provenance has to record what was *used* rather than
 * what was asked for: a pattern set this build has since dropped, recorded as it was requested, is
 * provenance a re-roll cannot honour.
 *
 * `substitutions` is what the editing surface tells the user about after a re-roll. A character
 * whose species was removed between saving and re-rolling is not re-rolled out of empty tables —
 * it falls back to the default and says which part it substituted.
 */
export type CharacterRoll = {
  character: Character;
  nameGeneratorSet: string;
  substitutions: CharacterRollSubstitution[];
};

const NAMING_GENDERS: NamingGender[] = ['male', 'female', 'random'];

function readString(value: unknown, key: string): Record<string, string> {
  return typeof value === 'string' && value !== '' ? { [key]: value } : {};
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool puts in it,
 * so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather than
 * coerced: a config written by a build that spelled these differently should fall back to the
 * defaults, not roll a character from a field it misread.
 */
export function readCharacterGeneratorConfig(
  config: Record<string, unknown>,
): CharacterGeneratorConfigRecord {
  return {
    ...readString(config.speciesName, 'speciesName'),
    ...readString(config.archetypeName, 'archetypeName'),
    ...readString(config.genderName, 'genderName'),
    ...readString(config.ageCategoryName, 'ageCategoryName'),
    ...readString(config.nameGeneratorSet, 'nameGeneratorSet'),
    ...(NAMING_GENDERS.includes(config.namingGender as NamingGender)
      ? { namingGender: config.namingGender as NamingGender }
      : {}),
  };
}

/**
 * The species a roll should use.
 *
 * A name this build no longer has falls back to the default rather than to the placeholder
 * `character_rehydrate.ts` builds. The placeholder exists so a *saved* character stays readable —
 * every number it needs is already in the payload — but a roll would be drawing height, age and
 * traits out of its empty tables, which is not a character anyone asked for.
 */
function resolveSpecies(requested: string | undefined): {
  species: Species;
  substituted: boolean;
} {
  if (requested === undefined || requested === CHARACTER_ANY) {
    return { species: human, substituted: false };
  }
  const found = sentientSpeciesList.find((species) => species.name === requested);
  return found === undefined
    ? { species: human, substituted: true }
    : { species: found, substituted: false };
}

/**
 * The archetypes a roll may draw from: all of them, or the single one that was asked for.
 *
 * An archetype this build no longer has widens back to all of them rather than leaving the list
 * empty, because an empty list is how a character silently comes back with no occupation at all.
 */
function resolveArchetypes(requested: string | undefined): {
  archetypes: Archetype[];
  substituted: boolean;
} {
  const all = getAllFantasyArchetypes();
  if (requested === undefined || requested === CHARACTER_ANY) {
    return { archetypes: all, substituted: false };
  }
  const found = all.find((archetype) => archetype.name === requested);
  return found === undefined
    ? { archetypes: all, substituted: true }
    : { archetypes: [found], substituted: false };
}

/**
 * The pattern set a roll should name from.
 *
 * Absent means "the one that suits this species", which is what the page does when the user has not
 * chosen a naming source — `character_generation.ts` has always derived a hint from the species
 * name. A set this build no longer has lands in the same place and is reported as a substitution,
 * because names in a tongue nobody asked for are worth saying out loud.
 */
function resolveNameGeneratorSet(
  requested: string | undefined,
  speciesName: string,
): { name: string; substituted: boolean } {
  const fallback = fantasyNameSetForSpecies(speciesName);
  if (requested === undefined || requested === '') {
    return { name: fallback, substituted: false };
  }
  return getFantasyNameGeneratorSetNames().includes(requested)
    ? { name: requested, substituted: false }
    : { name: fallback, substituted: true };
}

/** The build's name set for a species, or `human` for one it has no patterns for. */
function fantasyNameSetForSpecies(speciesName: string): string {
  const normalized = speciesName.toLowerCase();
  return getFantasyNameGeneratorSetNames().includes(normalized) ? normalized : 'human';
}

/**
 * Roll a character from a seed and a set of options — the one path the generator page and a
 * re-roll both take.
 *
 * The name is drawn from a stream of its own, `` `${seed}-character-name` ``, rather than off the
 * character's. Two reasons, and both matter. Names drawn from the main stream would shift every
 * roll after them, so choosing a naming source explicitly and having one chosen would produce
 * different *characters*. And the displayed name is written through `applyGeneratedCharacterName`
 * so `firstName`, `lastName` and the derived `name` cannot fall out of step, which is the same
 * helper the editor uses.
 */
export function rollCharacter(
  seed: string,
  config: CharacterGeneratorConfigRecord = {},
): CharacterRoll {
  const substitutions: CharacterRollSubstitution[] = [];

  const species = resolveSpecies(config.speciesName);
  if (species.substituted) {
    substitutions.push('species');
  }
  const archetypes = resolveArchetypes(config.archetypeName);
  if (archetypes.substituted) {
    substitutions.push('archetype');
  }
  const nameSetName = resolveNameGeneratorSet(config.nameGeneratorSet, species.species.name);
  if (nameSetName.substituted) {
    substitutions.push('nameGeneratorSet');
  }

  const nameRng = new RNG(`${seed}-character-name`);
  const nameSet = getFantasyNameGeneratorSet(nameSetName.name, nameRng);

  const character = generate(seed, {
    species: species.species,
    archetypeOptions: archetypes.archetypes,
    maleFirstNameGenerator: nameSet.male,
    femaleFirstNameGenerator: nameSet.female,
    familyNameGenerator: nameSet.family,
    ...(config.genderName === undefined || config.genderName === CHARACTER_ANY
      ? {}
      : { allowedGenderNames: [config.genderName.toLowerCase()] }),
    ...(config.ageCategoryName === undefined || config.ageCategoryName === CHARACTER_ANY
      ? {}
      : { allowedAgeCategoryNames: [config.ageCategoryName] }),
  });

  applyGeneratedCharacterName(
    character,
    generateCharacterName(
      nameRng,
      peopleNameGeneratorsFromNameSet(nameSet),
      config.namingGender ?? 'random',
      character.gender.name,
    ),
  );

  return { character, nameGeneratorSet: nameSetName.name, substitutions };
}

/**
 * Roll a fresh character snapshot from a seed and the settings it was first made with — the
 * destructive half of editing (requirement 4.3), and what `ARTIFACT_EDITORS` registers as this
 * kind's roller.
 */
export function rollCharacterSnapshot(
  seed: string,
  config: CharacterGeneratorConfigRecord = {},
): CharacterSnapshot {
  return toCharacterSnapshot(rollCharacter(seed, config).character);
}

/** The age categories the generator's own select offers, for the editor to offer the same list. */
export function characterAgeCategoryNames(): string[] {
  return getCategoryList();
}
