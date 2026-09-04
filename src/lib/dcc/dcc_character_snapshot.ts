/**
 * Writing a DCC character snapshot, and reading one back.
 *
 * A DCC character is almost entirely plain data already: six attributes as `{ value, modifier }`,
 * four saves, `specialRules: string[]`, `currency`, and arrays of items and weapons. Exactly two
 * fields are not storable, and `dcc_types.ts` names them: `DCCOccupation.apply` and
 * `DCCLuckyRoll.apply` are functions held in data.
 *
 * So the conversion is narrow — the two rule objects travel without their handler, and everything
 * else travels as it is. Requirement 3.2 in docs/workshop.md asks for non-serialisable values to be
 * stripped **or reconstructed explicitly**, and this is the second: the handler is put back on read
 * by resolving the row's name against the tables.
 *
 * **Why the whole row rather than just its name.** `docs/readiness-characters.md` proposed storing
 * `occupationName` and `luckyRollName` alone, in the shape AD&D stores its race and class. That is
 * lossy here, in two ways AD&D does not have:
 *
 * - **A drawn row carries per-character data.** `randomLuckyRoll` copies its row and overwrites
 *   `modifier` with the character's own luck modifier, so the table's row is not the character's
 *   row. Rebuilt from the name, every saved character's lucky sign would come back reading `+0`.
 * - **An `apply` handler may rewrite the row's own name.** The human farmer replaces its
 *   `occupation.name` with the crop it rolled (`human_occupation_data.ts:372`), so the stored name
 *   of a `potato farmer` matches nothing in the table, and resolving it would lose the pitchfork
 *   and the hen with it.
 *
 * Storing the row minus its handler keeps the payload authoritative (4.2) and still keeps every
 * closure out of it, which is what the design was actually protecting. The name lookup is retained
 * for the one thing it is good for: putting the handler back, and saying so when it cannot.
 *
 * **Every derived number stays in the payload.** The saves, the spell levels, the attack modifier,
 * the armour class — all of it, even though all of it could be recomputed from six attributes. A
 * judge who edits a save has made a decision no recomputation may overrule, and a character saved
 * under one printing of the tables must still be that character after the tables change.
 */

import type { RNG } from '@ironarachne/rng';
import type { RulesetRef } from '$lib/rulesets';

import type { DCCCharacter, DCCLuckyRoll, DCCOccupation } from './dcc_types.js';
import * as DwarfOccupations from './dwarf_occupations.js';
import * as ElfOccupations from './elf_occupations.js';
import * as HalflingOccupations from './halfling_occupations.js';
import * as HumanOccupations from './human_occupations.js';
import * as LuckyRolls from './lucky_rolls.js';

/** An occupation as it is stored: the row the character drew, without its handler. */
export type StoredDccOccupation = Omit<DCCOccupation, 'apply'>;

/** A lucky sign as it is stored, carrying the character's own modifier rather than the table's. */
export type StoredDccLuckyRoll = Omit<DCCLuckyRoll, 'apply'>;

/** A DCC character as it is stored. */
/** Stable identity for the pre-audit tables; it asserts no source or licence provenance. */
export const DCC_CHARACTER_RULESET_REF = {
  id: 'dcc',
  release: 'legacy',
} as const satisfies RulesetRef;

export type DccCharacterSnapshot = Omit<DCCCharacter, 'occupation' | 'luckyRoll'> & {
  ruleset: RulesetRef;
  occupation: StoredDccOccupation;
  luckyRoll: StoredDccLuckyRoll;
};

/** Every occupation this build has, across all four ancestries. Built on demand, never mutated. */
function allOccupations(): DCCOccupation[] {
  return [
    ...DwarfOccupations.all(),
    ...ElfOccupations.all(),
    ...HalflingOccupations.all(),
    ...HumanOccupations.all(),
  ];
}

/**
 * The handler an occupation of this name carries, or one that does nothing.
 *
 * Inert rather than absent, and inert rather than a throw. A handler is what *made* this character
 * — it already ran, and its results are in the payload — so re-running it is never something
 * reading a saved character does. What the field is for is a re-roll, and a re-roll draws a fresh
 * row from the table rather than reaching through a rehydrated one.
 *
 * The identity function is therefore the honest value for a name this build no longer has, and for
 * a name an `apply` handler rewrote on its way past — `potato farmer` matches no row, and never
 * did.
 */
function occupationApplyFor(name: string): DCCOccupation['apply'] {
  return allOccupations().find((row) => row.name === name)?.apply ?? ((character) => character);
}

function luckyRollApplyFor(name: string): DCCLuckyRoll['apply'] {
  return LuckyRolls.all().find((row) => row.name === name)?.apply ?? ((character) => character);
}

/** Whether a stored occupation name is one this build's tables still have. */
export function isUnknownDccOccupationName(name: string): boolean {
  return !allOccupations().some((row) => row.name === name);
}

/** Whether a stored lucky sign is one this build's table still has. */
export function isUnknownDccLuckyRollName(name: string): boolean {
  return !LuckyRolls.all().some((row) => row.name === name);
}

export function toDccCharacterSnapshot(character: DCCCharacter): DccCharacterSnapshot {
  const { occupation, luckyRoll, ...rest } = character;
  const { apply: _occupationApply, ...storedOccupation } = occupation;
  const { apply: _luckyApply, ...storedLuckyRoll } = luckyRoll;
  return {
    ...rest,
    ruleset: DCC_CHARACTER_RULESET_REF,
    occupation: storedOccupation,
    luckyRoll: storedLuckyRoll,
  };
}

/**
 * A stored character back into the live one the library works with.
 *
 * Nothing is recomputed and nothing is re-rolled: every number comes back as it was stored, and the
 * only thing added is the two handlers, resolved by name. The payload is the truth, per
 * docs/workshop.md.
 */
export function dccCharacterFromSnapshot(snapshot: DccCharacterSnapshot): DCCCharacter {
  const { ruleset: _ruleset, occupation, luckyRoll, ...rest } = snapshot;
  return {
    ...rest,
    occupation: { ...occupation, apply: occupationApplyFor(occupation.name) },
    luckyRoll: { ...luckyRoll, apply: luckyRollApplyFor(luckyRoll.name) },
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a character is finished when it is stored, and drawing anything from a seed on
 * the way back would be regenerating over the user's edits.
 */
export function dccCharacterFromSnapshotWithRng(
  snapshot: DccCharacterSnapshot,
  _rng: RNG,
): DCCCharacter {
  return dccCharacterFromSnapshot(snapshot);
}
