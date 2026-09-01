/**
 * The single path from a seed to a DCC zero-level character, and the record of how it was rolled.
 *
 * Decision 1 of docs/tool-readiness.md, applied here: pressing **Generate** draws a _new seed_ from
 * the page's RNG, and the roll itself is a pure function of seed and config. What it replaces is a
 * component that drew three separate `rng.randomString(13)` values per press off an RNG it reseeded
 * from the seed box, and built its generator config once at module scope — so the seed on screen
 * described only part of what produced the character, and the "generate a name" button reached for
 * `Date.now()` outright.
 *
 * The two derived streams are derived from the seed rather than drawn off a shared RNG, which is
 * what makes the settings independent of each other: turning halflings off cannot change which
 * lucky sign the same seed draws.
 */

import { resolveCharacterNameGeneratorSet } from '$lib/characters';
import { getFantasyNameGeneratorSetNames } from '$lib/names';
import { RNG } from '@ironarachne/rng';

import {
  generateRandomDCCCharacter,
  getDefaultDCCCharacterGeneratorConfig,
} from './dcc_characters.js';
import { toDccCharacterSnapshot, type DccCharacterSnapshot } from './dcc_character_snapshot.js';
import type { DCCCharacter } from './dcc_types.js';

/** The four ancestries whose occupation tables the generator draws from. */
export const DCC_ANCESTRIES = ['dwarf', 'elf', 'halfling', 'human'] as const;

export type DccAncestry = (typeof DCC_ANCESTRIES)[number];

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type rather than read field by field at the call site so the two ends — what is
 * written as provenance and what a re-roll expects to find — are in one place and drift loudly
 * instead of quietly.
 *
 * There is no naming-gender field, because this page has no naming-gender control: a DCC character
 * is named for the gender the dice gave them. Recording a setting the tool cannot express would be
 * provenance describing a page that does not exist.
 */
export type DccCharacterGeneratorConfigRecord = {
  /** The occupation tables in play, as the page's four checkboxes say. */
  allowedOccupations?: DccAncestry[];
  /**
   * The name pattern set the character was named from.
   *
   * A character named from a culture records that culture's own pattern set here rather than the
   * culture's id, so a re-roll produces names of the same tongue without reaching back into the
   * store for an artifact it has no way to ask for. The link to the culture is an artifact
   * reference and lives beside the payload, not in this record.
   *
   * Absent means "the set the occupation implies", which is what the generator does when the user
   * has chosen no naming source: a dwarven apothecarist is named as a dwarf.
   */
  nameGeneratorSet?: string;
};

/**
 * A rolled character and the pattern set its name actually came from.
 *
 * The resolved set travels back out because provenance has to record what was *used* rather than
 * what was asked for: a set this build has since dropped, recorded as it was requested, is
 * provenance a re-roll cannot honour. `''` means the occupation decided, which is the ordinary case
 * and not a failure.
 */
export type DccCharacterRoll = {
  character: DCCCharacter;
  nameGeneratorSet: string;
};

function isAncestry(value: unknown): value is DccAncestry {
  return DCC_ANCESTRIES.includes(value as DccAncestry);
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool puts in it,
 * so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather than
 * coerced: a config written by a build that spelled these differently should fall back to the
 * defaults, not roll a character from a field it misread.
 *
 * An `allowedOccupations` that survives filtering as an empty list is dropped rather than kept.
 * Every table switched off is a setting the page cannot produce and the generator cannot honour —
 * `randomOccupation` would be drawing from nothing — so it reads as "no preference recorded".
 */
export function readDccCharacterGeneratorConfig(
  config: Record<string, unknown>,
): DccCharacterGeneratorConfigRecord {
  const allowed = Array.isArray(config.allowedOccupations)
    ? config.allowedOccupations.filter(isAncestry)
    : [];
  return {
    ...(allowed.length > 0 ? { allowedOccupations: allowed } : {}),
    ...(typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== ''
      ? { nameGeneratorSet: config.nameGeneratorSet }
      : {}),
  };
}

/**
 * The pattern set a roll should name from, or `''` for "let the occupation decide".
 *
 * A set this build no longer has lands on `''` too, and is dropped rather than substituted: naming
 * a character in a tongue nobody asked for is worse than letting their occupation name them, which
 * is what the generator does by default anyway.
 */
export function resolveDccNameGeneratorSet(requested: string | undefined): string {
  if (requested === undefined || requested === '') {
    return '';
  }
  return getFantasyNameGeneratorSetNames().includes(requested) ? requested : '';
}

/**
 * Roll a character from a seed and a set of options — the one path the generator page and a re-roll
 * both take.
 */
export function rollDccCharacter(
  seed: string,
  config: DccCharacterGeneratorConfigRecord = {},
): DccCharacterRoll {
  const generatorConfig = getDefaultDCCCharacterGeneratorConfig(`${seed}-dcc-config`);
  generatorConfig.allowedOccupations = [...(config.allowedOccupations ?? DCC_ANCESTRIES)];

  const nameGeneratorSet = resolveDccNameGeneratorSet(config.nameGeneratorSet);
  const nameSet =
    nameGeneratorSet === ''
      ? undefined
      : resolveCharacterNameGeneratorSet(new RNG(`${seed}-dcc-name`), {
          kind: 'preset',
          setName: nameGeneratorSet,
        });

  return {
    character: generateRandomDCCCharacter(seed, generatorConfig, nameSet),
    nameGeneratorSet,
  };
}

/**
 * Roll a fresh character snapshot from a seed and the settings it was first made with — the
 * destructive half of editing (requirement 4.3), and what `ARTIFACT_EDITORS` registers as this
 * kind's roller.
 */
export function rollDccCharacterSnapshot(
  seed: string,
  config: DccCharacterGeneratorConfigRecord = {},
): DccCharacterSnapshot {
  return toDccCharacterSnapshot(rollDccCharacter(seed, config).character);
}
