/**
 * Editing a saved item, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction, and it is what lets the editing
 * framework compare what is on screen against what was read to decide whether anything needs
 * saving.
 *
 * **Nothing here recomputes anything.** Two temptations, both refused for the reason 4.2 gives:
 *
 * - `generateDescription` in `descriptor.ts` builds the paragraph out of the name, the refinement,
 *   the decoration and the enchantment, so a form that re-ran it on every change would throw away
 *   a hand-written description on the next keystroke elsewhere. It is offered as a button instead,
 *   the shape the drug editor and the DCC sheet both use.
 * - **Changing the material does not recompute the value or the weight.** `applyMaterial`
 *   multiplies both, and re-running it here would be arithmetic on numbers the user may have set
 *   deliberately — a legendary blade priced by hand is not a bug to correct. The three are fields
 *   of their own and each is edited directly.
 *
 * **A composition part is edited, not re-picked.** Dropping a whole `Refinement` in from the table
 * would overwrite the description a user rewrote and the multipliers already baked into the item.
 * What the editor changes is the part's name and description, which are the two fields the sheet
 * shows; removing the part entirely is the other operation, and it is explicit.
 */

import { armorTypes } from './armor.js';
import { generateDescription } from './descriptor.js';
import type { ItemSnapshot } from './item_snapshot.js';
import type { DensityCategory, Rarity } from './equipment_types';
import { weaponTypes } from './weapons.js';

/** The item's own text fields, all of which a user may rewrite. */
export type ItemTextField = 'name' | 'uniqueName' | 'itemMinorType' | 'description';

/** The item's own numeric fields. */
export type ItemNumberField = 'value' | 'weight';

/** The four parts of an item's composition, each optional and each removable. */
export const ITEM_COMPOSITION_PARTS = [
  'material',
  'refinement',
  'enchantment',
  'decoration',
] as const;

export type ItemCompositionPart = (typeof ITEM_COMPOSITION_PARTS)[number];

export function setItemText(
  snapshot: ItemSnapshot,
  field: ItemTextField,
  value: string,
): ItemSnapshot {
  // The two optional names are removed rather than stored empty, so a cleared unique name reverts
  // the item to being called what it is rather than being called nothing.
  if ((field === 'uniqueName' || field === 'itemMinorType') && value.trim() === '') {
    const next = { ...snapshot };
    delete next[field];
    return next;
  }
  return { ...snapshot, [field]: value };
}

/** A numeric field, floored at zero: an item cannot weigh or be worth less than nothing. */
export function setItemNumber(
  snapshot: ItemSnapshot,
  field: ItemNumberField,
  value: number,
): ItemSnapshot {
  const usable = Number.isFinite(value) && value > 0 ? value : 0;
  return { ...snapshot, [field]: usable };
}

export function setItemRarity(snapshot: ItemSnapshot, rarity: Rarity): ItemSnapshot {
  return { ...snapshot, rarity };
}

export function setItemDensity(
  snapshot: ItemSnapshot,
  densityCategory: DensityCategory,
): ItemSnapshot {
  return { ...snapshot, densityCategory };
}

/**
 * The properties, as one comma-separated line.
 *
 * A list control for a row of short tags is more machinery than the thing it edits; the line is
 * how a user reads them on the card, so it is how they are edited. Blank entries are dropped, which
 * is what makes a trailing comma harmless.
 */
export function setItemProperties(snapshot: ItemSnapshot, line: string): ItemSnapshot {
  return {
    ...snapshot,
    properties: line
      .split(',')
      .map((property) => property.trim())
      .filter((property) => property !== ''),
  };
}

/** The properties as the line the editor shows. */
export function itemPropertiesLine(snapshot: ItemSnapshot): string {
  return snapshot.properties.join(', ');
}

/** One part's name, or the empty string when the item has no such part. */
export function itemPartName(snapshot: ItemSnapshot, part: ItemCompositionPart): string {
  return snapshot[part]?.name ?? '';
}

/** One part's description, or the empty string when the item has no such part. */
export function itemPartDescription(snapshot: ItemSnapshot, part: ItemCompositionPart): string {
  const value = snapshot[part];
  // A `Material` carries no description; the other three do. Reading it structurally rather than
  // per-part keeps the editor's four rows identical.
  return value !== undefined && 'description' in value ? (value.description ?? '') : '';
}

/**
 * Rewrite one field of one composition part.
 *
 * Does nothing when the item has no such part: a form cannot name the enchantment of an unenchanted
 * sword, and inventing an empty record here would give it one whose multipliers were never applied.
 */
export function setItemPartField(
  snapshot: ItemSnapshot,
  part: ItemCompositionPart,
  field: 'name' | 'description',
  value: string,
): ItemSnapshot {
  const current = snapshot[part];
  if (current === undefined) {
    return snapshot;
  }
  if (field === 'description' && !('description' in current)) {
    return snapshot;
  }
  return { ...snapshot, [part]: { ...current, [field]: value } };
}

/**
 * Remove a part entirely.
 *
 * The value and weight it contributed stay where they are, for the reason the header gives: they
 * are the item's numbers now, and a user removing a decoration has not asked for the price to
 * change.
 */
export function removeItemPart(snapshot: ItemSnapshot, part: ItemCompositionPart): ItemSnapshot {
  if (snapshot[part] === undefined) {
    return snapshot;
  }
  const next = { ...snapshot };
  delete next[part];
  return next;
}

/**
 * The base type's own description, resolved from the stored type name.
 *
 * `generateDescription` opens with the *base* item's description and appends the composition's
 * three sentences to it — and `generateItem` then writes the result back over that same field. So a
 * stored item's `description` is the composed paragraph, and re-running the composer on it would
 * nest the whole paragraph inside itself. The base sentence is recovered from the table instead,
 * which is what `itemMinorType` is: the type's name. A type this build no longer has yields
 * nothing, and the rewrite is the composition without its opening line rather than a refusal.
 */
export function itemBaseDescription(snapshot: ItemSnapshot): string {
  const name = snapshot.itemMinorType;
  if (name === undefined) {
    return '';
  }
  const table = snapshot.itemMajorType === 'armor' ? armorTypes : weaponTypes;
  return table.find((type) => type.name === name)?.description ?? '';
}

/**
 * The description the generator would write for this item as it now stands.
 *
 * Offered rather than applied, and never called automatically. See the header.
 */
export function describeItem(snapshot: ItemSnapshot): string {
  return generateDescription({ ...snapshot, description: itemBaseDescription(snapshot) });
}
