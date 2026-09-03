/**
 * Writing a merchant for storage, and reading one back.
 *
 * `Merchant` is already plain — strings, numbers, two string lists, a `{ chargeName, fillHex }`
 * mark and a list of five-field stock rows — so the codec is a deep copy rather than a conversion.
 * That is not an accident: `MerchantMark` was already stored as the *name* of its charge and a
 * fill, which is the treatment
 * [decision 5 of the factions document](../../../docs/readiness-factions.md) asks of generated
 * imagery, done before this pass reached the tool.
 *
 * **The stock is stored, not regenerated.** #67 worries that duplicated item records would make a
 * merchant the largest object in the vault, and it would be right about `Item`: a
 * `MerchantStockItem` is five fields, so a fifty-line inventory is a few kilobytes. Storing it is
 * also the only honest option — a referee who has crossed two things off the list has edited the
 * shop, and 4.2 says the payload remembers that.
 *
 * **The payload's `seed` and the artifact's provenance seed are the same value.** `Merchant`
 * carries its own `seed` field, which pre-dates this pass, and a second one would be a shape where
 * two answers to "what rolled this" can disagree. `merchantSeedMatchesProvenance` is what says so
 * out loud, and the roll module is what keeps it true.
 */

import type { Merchant } from './merchant_types.js';

/** A merchant as it is stored: the type as it stands. */
export type MerchantSnapshot = Merchant;

export function toMerchantSnapshot(merchant: Merchant): MerchantSnapshot {
  return {
    seed: merchant.seed,
    proprietor: {
      ...merchant.proprietor,
      personalityTraits: [...merchant.proprietor.personalityTraits],
    },
    shop: { ...merchant.shop },
    mark: merchant.mark === null ? null : { ...merchant.mark },
    honesty: merchant.honesty,
    priceLevel: merchant.priceLevel,
    priceModifier: merchant.priceModifier,
    honestyNotes: merchant.honestyNotes,
    hagglingAdvice: merchant.hagglingAdvice,
    stock: merchant.stock.map((item) => ({ ...item })),
  };
}

/**
 * Nothing is recomputed on read.
 *
 * A stored merchant is finished. Re-deriving the ask prices from the price modifier would
 * overwrite whatever a referee changed by hand — requirement 4.2 exactly — and re-drawing the
 * haggling advice would replace a line they may have rewritten.
 */
export function merchantFromSnapshot(snapshot: MerchantSnapshot): Merchant {
  return toMerchantSnapshot(snapshot);
}

/** The codec's reading half, with the signature the registry hands it. The RNG is unused. */
export function merchantFromSnapshotWithRng(snapshot: MerchantSnapshot, _rng: unknown): Merchant {
  return merchantFromSnapshot(snapshot);
}

/** Whether a stored merchant agrees with the provenance recorded beside it. */
export function merchantSeedMatchesProvenance(snapshot: MerchantSnapshot, seed: string): boolean {
  return snapshot.seed === seed;
}
