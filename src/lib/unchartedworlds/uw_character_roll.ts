/**
 * The single path from a seed to an Uncharted Worlds character, and the record of how it was
 * rolled.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same character.
 * `UnchartedWorldsCharacterGenerator.svelte` satisfied that for the character and not for the
 * person: it named from `` new RNG(`${Date.now()}-uw-name`) ``, so a locked seed reproduced a
 * career, an origin and a hand of assets belonging to somebody with a different name every time.
 * Pressing Generate now draws a *new seed* from the page's own RNG, and the roll itself is a pure
 * function of seed and config.
 *
 * The name is drawn from `` `${seed}-uw-name` `` rather than off the character's own stream, so
 * choosing a naming source cannot shift which careers or assets the same seed produces.
 *
 * **A rolled character always has a name**, for the reason `swn_character_roll.ts` gives: the page
 * used to blank both names whenever no naming source was chosen, which is most of the time, and an
 * unnamed character is an artifact nobody can pick out of a vault listing (requirement 3.5).
 */

import {
  generateCharacterName,
  peopleNameGeneratorsFromNameSet,
  type NamingGender,
} from '$lib/characters';
import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';
import { RNG } from '@ironarachne/rng';

import { generate, type UWCharacter } from './character.js';
import { toUwCharacterSnapshot, type UwCharacterSnapshot } from './uw_character_snapshot.js';

/** The pattern set a character is named from when nothing else has been asked for. */
export const UW_DEFAULT_NAME_SET = 'human' as const;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type rather than read field by field at the call site so the two ends — what is
 * written as provenance and what a re-roll expects to find — are in one place and drift loudly
 * instead of quietly. There is nothing else in it because the page has no other setting: an
 * Uncharted Worlds character is two careers and an origin drawn from the whole table, and the tool
 * offers no way to narrow that.
 */
export type UwCharacterGeneratorConfigRecord = {
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
export type UwCharacterRoll = {
  character: UWCharacter;
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
export function readUwCharacterGeneratorConfig(
  config: Record<string, unknown>,
): UwCharacterGeneratorConfigRecord {
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
export function resolveUwNameGeneratorSet(requested: string | undefined): string {
  if (requested === undefined || requested === '') {
    return UW_DEFAULT_NAME_SET;
  }
  return getFantasyNameGeneratorSetNames().includes(requested) ? requested : UW_DEFAULT_NAME_SET;
}

/**
 * Roll a character from a seed and a set of options — the one path the generator page and a re-roll
 * both take.
 */
export function rollUwCharacter(
  seed: string,
  config: UwCharacterGeneratorConfigRecord = {},
): UwCharacterRoll {
  const character = generate(new RNG(seed));

  const nameGeneratorSet = resolveUwNameGeneratorSet(config.nameGeneratorSet);
  const nameRng = new RNG(`${seed}-uw-name`);
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
export function rollUwCharacterSnapshot(
  seed: string,
  config: UwCharacterGeneratorConfigRecord = {},
): UwCharacterSnapshot {
  return toUwCharacterSnapshot(rollUwCharacter(seed, config).character);
}
