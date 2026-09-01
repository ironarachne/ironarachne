/**
 * Writing a Stars Without Number character snapshot, and reading one back.
 *
 * **The conversion is the identity function, and that is worth stating rather than leaving a
 * reader to wonder what was missed.** A `SWNCharacter` is plain data all the way down: stats,
 * skills, foci, equipment and armour are records of strings and numbers, and `abilities` is a
 * discriminated union of records — `{ kind: 'effortAbility', description }` and its siblings —
 * rather than the handlers the DCC character holds. A search of this library for a function-typed
 * field on a character returns nothing. So there is no closure to strip and nothing to resolve by
 * name on the way back, and a codec that pretended otherwise would be ceremony.
 *
 * What the module is still for is the contract: the kind's `toSnapshot`/`fromSnapshot` pair has to
 * live somewhere, the copy has to be shallow-but-fresh so an editor cannot write through into a
 * character the page is still showing, and `psychicPicks` needs its default on read — see below.
 *
 * **Every derived number stays in the payload.** The saving throws, the attack bonuses, the three
 * armour classes, hit points and Effort are all stored, even though every one of them could be
 * recomputed from the stats and the class. A referee who has adjusted a save has made a decision no
 * recomputation may overrule, and a character saved under one printing of the tables must still be
 * that character after the tables change. `swn_character_editing.ts` offers the arithmetic as an
 * explicit command instead.
 */

import type { RNG } from '@ironarachne/rng';

import type { PsychicPick, SWNCharacter } from './character.js';

/**
 * A SWN character as it is stored.
 *
 * An alias rather than a mapped type, because there is nothing to map: the stored shape and the
 * live shape are the same shape. Named all the same, so the kind, the validator and the editor
 * speak in snapshots like every other kind, and so the day the two shapes diverge there is a name
 * to diverge.
 */
export type SwnCharacterSnapshot = SWNCharacter;

/**
 * A fresh top-level object over the same arrays.
 *
 * Shallow: the arrays and the records inside them are not copied, because nothing downstream
 * mutates them — the editor replaces entries rather than writing into them, and IndexedDB stores
 * through `structuredClone`, which copies. What the fresh top level buys is that a snapshot handed
 * to a save control is not the object a page is still rendering.
 */
export function toSwnCharacterSnapshot(character: SWNCharacter): SwnCharacterSnapshot {
  return { ...character };
}

/**
 * A stored character back into the live one the library works with.
 *
 * Nothing is recomputed and nothing is re-rolled. The one thing done on read is defaulting
 * `psychicPicks`: it is checked by the kind's validator only when present, so a payload written
 * before this field existed — or hand-edited out of a vault file — comes back as a character with
 * no recorded picks rather than one whose `psychicPicks.length` throws on the first render.
 */
export function swnCharacterFromSnapshot(snapshot: SwnCharacterSnapshot): SWNCharacter {
  return { ...snapshot, psychicPicks: swnPsychicPicks(snapshot) };
}

/** The picks a stored character carries, or none. */
function swnPsychicPicks(snapshot: SwnCharacterSnapshot): PsychicPick[] {
  return Array.isArray(snapshot.psychicPicks) ? snapshot.psychicPicks : [];
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a character is finished when it is stored, and drawing anything from a seed on
 * the way back would be regenerating over the user's edits.
 */
export function swnCharacterFromSnapshotWithRng(
  snapshot: SwnCharacterSnapshot,
  _rng: RNG,
): SWNCharacter {
  return swnCharacterFromSnapshot(snapshot);
}
