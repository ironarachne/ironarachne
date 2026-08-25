/**
 * The single path from a seed to an AD&D 2E character, and the record of how it was rolled.
 *
 * Modelled on `settlement_roll.ts`, and here for the same reason: requirement 2.2 in
 * docs/workshop.md wants the same seed and configuration to give the same character, and a
 * generator whose configuration is assembled inline in a Svelte component satisfies that only for
 * as long as nobody edits the component. Once an artifact can be re-rolled, "reproduce this" also
 * needs somewhere to read the settings back from.
 */

import { RNG } from '@ironarachne/rng';

import {
  generateCharacterName,
  peopleNameGeneratorsFromNameSet,
  type NamingGender,
} from '$lib/characters';
import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';

import { generateCharacter } from './adndcharactergenerator.js';
import { getDefaultConfig } from './adndcharactergeneratorconfig.js';
import { toAdndCharacterSnapshot, type AdndCharacterSnapshot } from './adnd_character_snapshot.js';
import type ADNDCharacter from './adndcharacter.js';

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type rather than read field by field at the call site so the two ends — what is
 * written as provenance and what a re-roll expects to find — are in one place and drift loudly
 * instead of quietly.
 */
export type AdndCharacterGeneratorConfigRecord = {
  /**
   * The name pattern set the character was named from.
   *
   * A character named from a saved culture records that culture's own pattern set here rather
   * than the culture's id, so a re-roll produces a name of the same tongue without reaching back
   * into the store for an artifact it has no way to ask for. The link to the culture is an
   * artifact reference and lives beside the payload, not in this record.
   */
  nameGeneratorSet?: string;
  /** Which name to draw. `random` lets the seed decide, as the page's picker does. */
  namingGender?: NamingGender;
  includeProficiencies?: boolean;
  includeKits?: boolean;
};

/**
 * A rolled character and the pattern set its name actually came from.
 *
 * The resolved set travels back out because a roll may choose one itself, and provenance has to
 * record what was used rather than what was asked for. "Any set" stored as provenance would make
 * a re-roll a fresh draw, which is not what re-rolling an artifact means.
 */
export type AdndCharacterRoll = {
  character: ADNDCharacter;
  nameGeneratorSet: string;
};

function readBoolean(value: unknown, key: string): Record<string, boolean> {
  return typeof value === 'boolean' ? { [key]: value } : {};
}

const NAMING_GENDERS: NamingGender[] = ['male', 'female', 'random'];

/**
 * The pattern set a roll should name from, or `''` for a character the user left unnamed.
 *
 * Unnamed is the ordinary case and not a failure: the generator's naming control defaults to
 * offering no names at all, and an AD&D character is perfectly usable as "a level 1 elf thief".
 * So an absent set means "do not name this one" rather than "pick one for me" — which is the
 * opposite of what `$lib/settlements` does with the same field, because a settlement is a place
 * that must be called something and a character here need not be.
 *
 * A set this build no longer has also lands here, and is dropped rather than substituted. Naming
 * a character in a tongue nobody asked for is worse than leaving the name the payload already
 * carries, and on the re-roll path the payload is what the user is about to overwrite.
 */
function resolveNameGeneratorSet(requested: string | undefined): string {
  if (requested === undefined || requested === '') {
    return '';
  }
  return getFantasyNameGeneratorSetNames().includes(requested) ? requested : '';
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool puts in it,
 * so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather
 * than coerced: a config written by a build that spelled these differently should fall back to
 * the defaults, not roll a character from a field it misread.
 */
export function readAdndCharacterGeneratorConfig(
  config: Record<string, unknown>,
): AdndCharacterGeneratorConfigRecord {
  return {
    ...(typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== ''
      ? { nameGeneratorSet: config.nameGeneratorSet }
      : {}),
    ...(NAMING_GENDERS.includes(config.namingGender as NamingGender)
      ? { namingGender: config.namingGender as NamingGender }
      : {}),
    ...readBoolean(config.includeProficiencies, 'includeProficiencies'),
    ...readBoolean(config.includeKits, 'includeKits'),
  };
}

/**
 * Roll a character from a seed and a set of options — the one path the generator page and a
 * re-roll both take.
 *
 * The name is drawn from a stream of its own, derived from the seed rather than taken off the
 * character's. Two reasons, and both matter. A name drawn off the main stream would shift every
 * roll after it, so choosing a pattern set explicitly and having one chosen would produce
 * different characters. And the page used to draw its name from a clock-seeded RNG, which meant
 * the same seed did not in fact produce the same character — 2.2 was already broken here, and
 * this is the fix.
 */
export function rollAdndCharacter(
  seed: string,
  config: AdndCharacterGeneratorConfigRecord = {},
): AdndCharacterRoll {
  const rng = new RNG(seed);
  const generatorConfig = getDefaultConfig(rng);
  generatorConfig.includeProficiencies = config.includeProficiencies === true;
  generatorConfig.includeKits = config.includeKits === true;

  const character = generateCharacter(generatorConfig);
  const nameGeneratorSet = resolveNameGeneratorSet(config.nameGeneratorSet);

  if (nameGeneratorSet !== '') {
    const nameRng = new RNG(`${seed}-adnd-name`);
    const nameSet = getFantasyNameGeneratorSet(nameGeneratorSet, nameRng);
    const name = generateCharacterName(
      nameRng,
      peopleNameGeneratorsFromNameSet(nameSet),
      config.namingGender ?? 'random',
    );
    character.firstName = name.firstName;
    character.lastName = name.lastName;
  }

  return { character, nameGeneratorSet };
}

/**
 * Roll a fresh character snapshot from a seed and the settings it was first made with — the
 * destructive half of editing (requirement 4.3) for a character that came from the generator.
 *
 * A character that came from the builder re-rolls a different way; see
 * `adnd_character_build.ts`, which reads the build record instead.
 */
export function rollAdndCharacterSnapshot(
  seed: string,
  config: AdndCharacterGeneratorConfigRecord = {},
): AdndCharacterSnapshot {
  return toAdndCharacterSnapshot(rollAdndCharacter(seed, config).character);
}
