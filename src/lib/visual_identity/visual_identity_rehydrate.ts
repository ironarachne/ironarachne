/**
 * A stored visual identity, live again. Kept apart from the writing half because resolving a coat
 * of arms reaches `$lib/charges` — 18 MB of glyph art, measured — and nothing that merely stores or
 * validates an identity needs it.
 *
 * An emblem whose arms are `null` comes back as no emblem at all, which is the whole point of that
 * value: the arms are a referenced artifact, and the caller that holds the reference is the one
 * that can resolve it. The stored form keeps the `null`, so a payload read and written again does
 * not lose the statement.
 */

import { armsFromStored } from '$lib/heraldry';

import type { StoredVisualIdentity } from './visual_identity_snapshot.js';
import type { VisualIdentity } from './visual_identity_types.js';

export function visualIdentityFromStored(stored: StoredVisualIdentity): VisualIdentity {
  const { emblem } = stored;
  if (emblem.kind !== 'heraldry') {
    return { ...stored, emblem };
  }
  return {
    ...stored,
    emblem:
      emblem.arms === null
        ? { kind: 'none' }
        : { kind: 'heraldry', arms: armsFromStored(emblem.arms) },
  };
}
