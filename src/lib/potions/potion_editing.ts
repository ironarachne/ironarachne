/**
 * Editing a saved potion, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction, and it is what lets the editing
 * framework compare what is on screen against what was read to decide whether anything needs
 * saving.
 *
 * **Nothing here recomputes anything.** Two temptations, both refused for the reason 4.2 gives:
 *
 * - `describePotion` in `potion_descriptor.ts` builds the prose out of the name, the sensory
 *   profile and the effect, so a form that re-ran it on every change would throw away a
 *   hand-written description on the next keystroke elsewhere. It is offered as a button instead,
 *   the shape the drug and item editors both use.
 * - **Changing the magnitude does not reprice the potion.** `resolveCatalogValue` derives the value
 *   from the catalog entry and the effect, and re-running it here would be arithmetic on a number a
 *   referee may have set deliberately. The value is a field of its own and is edited directly.
 *
 * **A modification is removed, not re-picked.** The modifications are what the roll did to the base
 * formula — a potency tier, a duration change — and they were already applied to the effect when it
 * was generated. Dropping a new one in from nowhere would claim a change that never happened to the
 * numbers; removing one says the referee has decided it did not.
 */

import { describePotion } from './potion_descriptor.js';
import { potionForm } from './potion_presentation.js';
import { potionFromSnapshot, type PotionSnapshot } from './potion_snapshot.js';
import type { Rarity } from '$lib/equipment';

/** The potion's own text fields, all of which a referee may rewrite. */
export type PotionTextField = 'displayName' | 'canonicalName';

/** The four sensory fields. */
export type PotionSensoryField = 'appearance' | 'viscosity' | 'flavor' | 'scent';

export function setPotionText(
  snapshot: PotionSnapshot,
  field: PotionTextField,
  value: string,
): PotionSnapshot {
  // The base formula is removed rather than stored empty: a potion whose canonical name has been
  // cleared has no base formula, and the sheet drops the line rather than printing a blank one.
  if (field === 'canonicalName' && value.trim() === '') {
    const next = { ...snapshot };
    delete next.canonicalName;
    return next;
  }
  return { ...snapshot, [field]: value };
}

/** The composed prose, which lives on the liquid. */
export function setPotionDescription(snapshot: PotionSnapshot, value: string): PotionSnapshot {
  return { ...snapshot, liquid: { ...snapshot.liquid, description: value } };
}

export function setPotionSensory(
  snapshot: PotionSnapshot,
  field: PotionSensoryField,
  value: string,
): PotionSnapshot {
  return { ...snapshot, sensory: { ...snapshot.sensory, [field]: value } };
}

/** The effect's name or its sentence. */
export function setPotionEffectText(
  snapshot: PotionSnapshot,
  field: 'name' | 'description',
  value: string,
): PotionSnapshot {
  return { ...snapshot, effect: { ...snapshot.effect, [field]: value } };
}

/** The effect's magnitude, floored at zero. */
export function setPotionMagnitude(snapshot: PotionSnapshot, magnitude: number): PotionSnapshot {
  const usable = Number.isFinite(magnitude) && magnitude > 0 ? magnitude : 0;
  return { ...snapshot, effect: { ...snapshot.effect, magnitude: usable } };
}

/** The liquid's value, floored at zero. */
export function setPotionValue(snapshot: PotionSnapshot, value: number): PotionSnapshot {
  const usable = Number.isFinite(value) && value > 0 ? value : 0;
  return { ...snapshot, liquid: { ...snapshot.liquid, value: usable } };
}

export function setPotionRarity(snapshot: PotionSnapshot, rarity: Rarity): PotionSnapshot {
  return { ...snapshot, liquid: { ...snapshot.liquid, rarity } };
}

/** The container's name or its description. */
export function setPotionContainerText(
  snapshot: PotionSnapshot,
  field: 'name' | 'description',
  value: string,
): PotionSnapshot {
  return { ...snapshot, container: { ...snapshot.container, [field]: value } };
}

/** Drop one modification. See the header for why nothing adds one. */
export function removePotionModification(snapshot: PotionSnapshot, index: number): PotionSnapshot {
  if (index < 0 || index >= snapshot.modifications.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    modifications: snapshot.modifications.filter((_modification, at) => at !== index),
  };
}

/**
 * The description the generator would write for this potion as it now stands.
 *
 * Offered rather than applied, and never called automatically. The liquid's `name`, `effect` and
 * `sensory` are rebuilt from the potion's own by `potionFromSnapshot`, which is why the composer
 * can be handed a live potion here and see the edits.
 */
export function describePotionSnapshot(snapshot: PotionSnapshot): string {
  return describePotion(potionFromSnapshot(snapshot), potionForm(snapshot));
}
