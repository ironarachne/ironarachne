/**
 * A visual identity as it is stored, and the writing half of the conversion.
 *
 * Declared here, in the library that owns the concept, since #56. `StoredVisualIdentity` and
 * `StoredVisualEmblem` lived in `src/lib/settlements/settlement_snapshot.ts` until then, because
 * a settlement's organizations were the first identities anything stored — the move the stored
 * vocabulary in docs/tool-readiness.md called for. The settlement kind re-exports them.
 *
 * **Imagery round-trips as parameters, never as a rendered SVG.** A merchant mark, a pattern
 * lattice and a disc emblem are already plain data — a charge name and some hex colours, a grid of
 * cells — and travel as they are. A coat of arms carries a render function on every charge group,
 * so it travels the way the heraldry kind stores it, by the names of its parts. A stored SVG would
 * be a fossil: it cannot be re-themed, cannot be re-rendered at another size, and pins the payload
 * to the renderer that made it.
 *
 * **`arms: null` is a statement, not a gap.** It says the arms are a referenced artifact — a saved
 * coat of arms someone may edit later — and the artifact reference beside the payload says which.
 * Copying the arms in would fork them at the moment of saving, which is the opposite of what
 * composition is for. It is the same convention `StoredCharacter.heraldry` uses.
 */

import { toStoredArms, type StoredArms } from '$lib/heraldry';

import type { VisualEmblem, VisualIdentity } from './visual_identity_types.js';

/** Every emblem variant but heraldry is already plain data and travels as it is. */
export type StoredVisualEmblem =
  | Exclude<VisualEmblem, { kind: 'heraldry' }>
  | { kind: 'heraldry'; arms: StoredArms | null };

export type StoredVisualIdentity = Omit<VisualIdentity, 'emblem'> & {
  emblem: StoredVisualEmblem;
};

/**
 * An identity with its arms, if any, written as names.
 *
 * `referencedArms` says the heraldic emblem is a saved artifact rather than this identity's own,
 * and stores `null` in its place. It is ignored for every other emblem kind, which have nothing to
 * reference.
 */
export function toStoredVisualIdentity(
  identity: VisualIdentity,
  referencedArms = false,
): StoredVisualIdentity {
  const { emblem } = identity;
  return {
    ...identity,
    emblem:
      emblem.kind === 'heraldry'
        ? { kind: 'heraldry', arms: referencedArms ? null : toStoredArms(emblem.arms) }
        : emblem,
  };
}
