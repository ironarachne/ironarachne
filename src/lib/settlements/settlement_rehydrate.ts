/**
 * Rebuilding a settlement from a snapshot, kept apart from `settlement_snapshot.ts` because of
 * what it costs. Restoring an organization's emblem resolves charge names against
 * `$lib/charges` — 18 MB of glyph art, measured — and restoring a character's archetype and species
 * reaches the fantasy archetype tables and the sentient species list. Writing a snapshot needs
 * none of it, and the kind registry validates one without touching those modules, so the two
 * directions do not belong in the same file.
 *
 * A stored character comes back through `$lib/characters`, which owns that shape since #46. What
 * is left here is what a settlement itself borrows: hierarchies, emblems, and the notables and
 * members those characters hang off.
 */

import { characterFromStored } from '$lib/characters';
import { organizationFromStored } from '$lib/organizations';

import type { SettlementSnapshot, StoredSettlementNotable } from './settlement_snapshot.js';
import type { Settlement, SettlementImportantPerson } from './settlement_types.js';

function notableFromStored(stored: StoredSettlementNotable): SettlementImportantPerson {
  return { ...stored, character: characterFromStored(stored.character) };
}

/**
 * A stored settlement, live again.
 *
 * It takes no RNG and generates nothing: the payload is the truth (docs/workshop.md), and every
 * value here is either what was stored or a lookup from a name that was stored. The kind's codec
 * is handed an RNG all the same, because the contract gives every codec one; this one ignores it.
 */
export function settlementFromSnapshot(snapshot: SettlementSnapshot): Settlement {
  const { importantPeople, organizations, ...rest } = snapshot;
  return {
    ...rest,
    ...(importantPeople === undefined
      ? {}
      : { importantPeople: importantPeople.map(notableFromStored) }),
    ...(organizations === undefined
      ? {}
      : { organizations: organizations.map(organizationFromStored) }),
  };
}
