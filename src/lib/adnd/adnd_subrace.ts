/**
 * Choosing, applying, and naming a subrace.
 *
 * The whole mechanism, and it is deliberately three small functions rather than a system. What
 * makes it worth having is not its size but where it writes: `applyAdndSubrace` puts the chosen
 * variety on the **character**, where the previous arrangement put it on the shared race table by
 * renaming it in place. See docs/adnd-subraces.md, decision 2.
 */

import type { RNG } from '@ironarachne/rng';

import type ADNDCharacter from './adndcharacter.js';
import type ADNDRace from './adndrace.js';
import type ADNDSubrace from './adndsubrace.js';

/**
 * Draw one of a race's varieties, or nothing when it has none.
 *
 * The `length === 0` guard is load-bearing rather than defensive: five of the six races have no
 * varieties, and taking a draw for them — even one immediately discarded — would shift every roll
 * that follows and change the character every existing seed produces. Decision 7 of
 * docs/adnd-subraces.md is this line.
 */
export function pickAdndSubrace(subraces: ADNDSubrace[], rng: RNG): ADNDSubrace | null {
  if (subraces.length === 0) {
    return null;
  }
  return rng.item(subraces);
}

/** Apply a variety to a character, recording which one it was. A `null` subrace does nothing. */
export function applyAdndSubrace(
  character: ADNDCharacter,
  subrace: ADNDSubrace | null,
  rng: RNG,
): ADNDCharacter {
  if (subrace === null) {
    return character;
  }
  character.subraceName = subrace.name;
  return subrace.apply(character, rng);
}

/** A race's variety by name, or `null` — resolved within the race, never across all of them. */
export function findAdndSubrace(race: ADNDRace, name: string): ADNDSubrace | null {
  return race.subraces.find((subrace) => subrace.name === name) ?? null;
}

/**
 * What to call this character's race: `Stout halfling`, or just `halfling`.
 *
 * An accessor rather than a stored string, and that is the correction #99 asked for. Composing the
 * name at the point of display is precisely the job the old `character.race.name = ...` was doing,
 * which is why it was tempting — writing into the race made every display site work without
 * knowing subraces existed. It also put a value in the race name that no lookup could resolve, so
 * a saved halfling came back with no racial rules at all.
 */
export function adndRaceDisplayName(character: {
  race: { name: string };
  subraceName: string;
}): string {
  if (character.subraceName === '') {
    return character.race.name;
  }
  return `${character.subraceName} ${character.race.name}`;
}
