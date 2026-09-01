/**
 * The single path from a seed to a Stars Without Number character, and the record of how it was
 * rolled.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same character.
 * `SwnCharacterGenerator.svelte` satisfied that for the character's own numbers and for nothing
 * else: it named from `` new RNG(`${Date.now()}-swn-name`) ``, so the seed on screen reproduced a
 * body and never the person wearing it. Pressing Generate now draws a *new seed* from the page's
 * own RNG and the roll itself is a pure function of seed and config.
 *
 * The name is drawn from `` `${seed}-swn-name` `` rather than off the character's own stream, so
 * choosing a naming source cannot shift which background, class or focus the same seed produces.
 *
 * **A rolled character always has a name.** The page used to blank `firstName` and `lastName`
 * whenever the user had not picked a naming source, which is most of the time, so the ordinary
 * result of pressing Generate was an anonymous sheet — and an artifact nobody can pick out of a
 * vault listing (requirement 3.5). Absent a chosen source the roll names from the `human` pattern
 * set, which is what every other character tool here does for a character it has no better hint
 * for; the naming section is still how a user asks for a different tongue.
 */

import {
  generateCharacterName,
  peopleNameGeneratorsFromNameSet,
  type NamingGender,
} from '$lib/characters';
import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';
import { RNG } from '@ironarachne/rng';

import { generate, type SWNCharacter } from './character.js';
import { toSwnCharacterSnapshot, type SwnCharacterSnapshot } from './swn_character_snapshot.js';

/** The pattern set a character is named from when nothing else has been asked for. */
export const SWN_DEFAULT_NAME_SET = 'human' as const;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type rather than read field by field at the call site so the two ends — what is
 * written as provenance and what a re-roll expects to find — are in one place and drift loudly
 * instead of quietly.
 */
export type SwnCharacterGeneratorConfigRecord = {
  /**
   * The name pattern set the character was named from.
   *
   * A character named from a culture records that culture's own pattern set here rather than the
   * culture's id, so a re-roll produces names of the same tongue without reaching back into the
   * store for an artifact it has no way to ask for. The link to the culture is an artifact
   * reference and lives beside the payload, not in this record.
   */
  nameGeneratorSet?: string;
  /** Which name to draw. `random` lets the seed choose, as the page's gender picker does. */
  namingGender?: NamingGender;
};

/**
 * A rolled character and the pattern set its name actually came from.
 *
 * The resolved set travels back out because provenance has to record what was *used* rather than
 * what was asked for: a set this build has since dropped, recorded as it was requested, is
 * provenance a re-roll cannot honour.
 */
export type SwnCharacterRoll = {
  character: SWNCharacter;
  nameGeneratorSet: string;
};

const NAMING_GENDERS: NamingGender[] = ['male', 'female', 'random'];

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool puts in it,
 * so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather than
 * coerced: a config written by a build that spelled these differently should fall back to the
 * defaults, not roll a character from a field it misread.
 */
export function readSwnCharacterGeneratorConfig(
  config: Record<string, unknown>,
): SwnCharacterGeneratorConfigRecord {
  return {
    ...(typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== ''
      ? { nameGeneratorSet: config.nameGeneratorSet }
      : {}),
    ...(NAMING_GENDERS.includes(config.namingGender as NamingGender)
      ? { namingGender: config.namingGender as NamingGender }
      : {}),
  };
}

/**
 * The pattern set a roll should name from.
 *
 * A set this build no longer has falls back to the default rather than throwing:
 * `getFantasyNameGeneratorSet` refuses a name it does not know, and a character that cannot be
 * rolled at all is a worse answer than one named in the common tongue.
 */
export function resolveSwnNameGeneratorSet(requested: string | undefined): string {
  if (requested === undefined || requested === '') {
    return SWN_DEFAULT_NAME_SET;
  }
  return getFantasyNameGeneratorSetNames().includes(requested) ? requested : SWN_DEFAULT_NAME_SET;
}

/**
 * Roll a character from a seed and a set of options — the one path the generator page and a re-roll
 * both take.
 */
export function rollSwnCharacter(
  seed: string,
  config: SwnCharacterGeneratorConfigRecord = {},
): SwnCharacterRoll {
  const character = generate(new RNG(seed));

  const nameGeneratorSet = resolveSwnNameGeneratorSet(config.nameGeneratorSet);
  const nameRng = new RNG(`${seed}-swn-name`);
  const nameSet = getFantasyNameGeneratorSet(nameGeneratorSet, nameRng);
  const name = generateCharacterName(
    nameRng,
    peopleNameGeneratorsFromNameSet(nameSet),
    config.namingGender ?? 'random',
  );

  character.firstName = name.firstName;
  character.lastName = name.lastName;

  return { character, nameGeneratorSet };
}

/**
 * Roll a fresh character snapshot from a seed and the settings it was first made with — the
 * destructive half of editing (requirement 4.3), and what `ARTIFACT_EDITORS` registers as this
 * kind's roller.
 */
export function rollSwnCharacterSnapshot(
  seed: string,
  config: SwnCharacterGeneratorConfigRecord = {},
): SwnCharacterSnapshot {
  return toSwnCharacterSnapshot(rollSwnCharacter(seed, config).character);
}
