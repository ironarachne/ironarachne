/**
 * Editing a saved merchant, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction, and it is what lets the editing
 * framework compare what is on screen against what was read to decide whether anything needs
 * saving.
 *
 * **Nothing here recomputes anything**, and the temptation is sharper than usual: every ask price
 * in the stock is the catalog cost times the price modifier, so a form that re-derived the column
 * whenever the modifier changed would be the most natural thing to write. It is also requirement
 * 4.2's exact prohibition — a referee who has marked one sword down to clear it has priced that
 * sword, and the next keystroke elsewhere must not undo that. `repricedStock` is offered as a
 * command instead, the shape the drug editor and the DCC sheet both use.
 *
 * **The stock is a list a referee crosses things off.** Adding, removing and reordering are what an
 * inventory is edited by, and none of them can be expressed as a field, so they are functions
 * rather than a generic list control.
 */

import type { MerchantSnapshot } from './merchant_snapshot.js';
import type { MerchantStockItem } from './merchant_types.js';

/** The merchant's own text fields, all of which a referee may rewrite. */
export type MerchantTextField = 'honestyNotes' | 'hagglingAdvice';

/** The proprietor's text fields. */
export type ProprietorTextField = 'firstName' | 'lastName' | 'fullName' | 'description';

/** The shop's text fields. */
export type ShopTextField = 'name' | 'description' | 'locationBlurb' | 'settlementName';

export function setMerchantText(
  snapshot: MerchantSnapshot,
  field: MerchantTextField,
  value: string,
): MerchantSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * A proprietor's field.
 *
 * `fullName` is not recomputed from the two halves and the two halves are not parsed out of it:
 * the payload keeps all three because the generator wrote all three, and a shopkeeper called
 * "Old Maren" has a full name that no split of a first and a last would produce.
 */
export function setProprietorText(
  snapshot: MerchantSnapshot,
  field: ProprietorTextField,
  value: string,
): MerchantSnapshot {
  return { ...snapshot, proprietor: { ...snapshot.proprietor, [field]: value } };
}

export function setShopText(
  snapshot: MerchantSnapshot,
  field: ShopTextField,
  value: string,
): MerchantSnapshot {
  if (field === 'settlementName' && value.trim() === '') {
    const shop = { ...snapshot.shop };
    delete shop.settlementName;
    return { ...snapshot, shop };
  }
  return { ...snapshot, shop: { ...snapshot.shop, [field]: value } };
}

/** The proprietor's temperament, as one comma-separated line. Blank entries are dropped. */
export function setProprietorTraits(snapshot: MerchantSnapshot, line: string): MerchantSnapshot {
  return {
    ...snapshot,
    proprietor: {
      ...snapshot.proprietor,
      personalityTraits: line
        .split(',')
        .map((trait) => trait.trim())
        .filter((trait) => trait !== ''),
    },
  };
}

/** The temperament as the line the editor shows. */
export function proprietorTraitsLine(snapshot: MerchantSnapshot): string {
  return snapshot.proprietor.personalityTraits.join(', ');
}

/** The price modifier, floored at zero — a shop cannot charge less than nothing. */
export function setPriceModifier(snapshot: MerchantSnapshot, modifier: number): MerchantSnapshot {
  return {
    ...snapshot,
    priceModifier: Number.isFinite(modifier) && modifier > 0 ? modifier : 0,
  };
}

/** One stock row's name or note. */
export function setStockText(
  snapshot: MerchantSnapshot,
  index: number,
  field: 'name' | 'note',
  value: string,
): MerchantSnapshot {
  return updateStock(snapshot, index, (item) =>
    field === 'note' && value.trim() === '' ? stripNote(item) : { ...item, [field]: value },
  );
}

/** One stock row's number, floored at zero. */
export function setStockNumber(
  snapshot: MerchantSnapshot,
  index: number,
  field: 'baseCost' | 'price' | 'quantity',
  value: number,
): MerchantSnapshot {
  const usable = Number.isFinite(value) && value > 0 ? value : 0;
  return updateStock(snapshot, index, (item) => ({ ...item, [field]: usable }));
}

function stripNote(item: MerchantStockItem): MerchantStockItem {
  const next = { ...item };
  delete next.note;
  return next;
}

function updateStock(
  snapshot: MerchantSnapshot,
  index: number,
  change: (item: MerchantStockItem) => MerchantStockItem,
): MerchantSnapshot {
  if (index < 0 || index >= snapshot.stock.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    stock: snapshot.stock.map((item, at) => (at === index ? change(item) : item)),
  };
}

/** A blank row for a referee adding something the generator did not think of. */
export function addStockItem(snapshot: MerchantSnapshot): MerchantSnapshot {
  return {
    ...snapshot,
    stock: [...snapshot.stock, { name: 'New item', baseCost: 0, price: 0, quantity: 1 }],
  };
}

/** Cross a line off the list. */
export function removeStockItem(snapshot: MerchantSnapshot, index: number): MerchantSnapshot {
  if (index < 0 || index >= snapshot.stock.length) {
    return snapshot;
  }
  return { ...snapshot, stock: snapshot.stock.filter((_item, at) => at !== index) };
}

/**
 * Every ask price set back to the catalog cost times the current modifier.
 *
 * Offered rather than done automatically, for the reason the header gives. Rounded to whole copper,
 * which is what the generator does and what a price the site can print has to be.
 */
export function repricedStock(snapshot: MerchantSnapshot): MerchantSnapshot {
  return {
    ...snapshot,
    stock: snapshot.stock.map((item) => ({
      ...item,
      price: Math.max(1, Math.round(item.baseCost * snapshot.priceModifier)),
    })),
  };
}
