import type { CurrencySystem } from '$lib/currency';

/** The currencies the fantasy price lists can be read in. */
export type PriceCurrencyId = 'dnd' | 'english';

/** One line of the key that tells a reader what `sp` or `£` means. */
export type PriceLegendEntry = {
  /** What appears in the Cost column. */
  symbol: string;
  /** What the symbol stands for, singular. */
  name: string;
  /**
   * What it is worth in the next denomination down, or the empty string for the smallest, which
   * is worth nothing but itself. 6.4: the empty string is dropped rather than rendered as an
   * empty parenthetical.
   */
  worth: string;
};

/**
 * A currency the lists can be priced in.
 *
 * The `system` is a display system rather than one of `$lib/currency`'s own: the lists quote a
 * price in every denomination it carries, so a denomination that should never appear in a price
 * has to be absent rather than merely unlikely. See `PRICE_CURRENCIES`.
 */
export type PriceCurrency = {
  id: PriceCurrencyId;
  /** The name of the currency, as the select offers it. */
  label: string;
  system: CurrencySystem;
  /** What one copper piece of a list's stored cost is worth in this system's base unit. */
  baseUnitPerCopper: number;
  legend: PriceLegendEntry[];
};

/** An equipment item with its cost already rendered in a currency. */
export type PricedItem = {
  name: string;
  cost: string;
};

/** One titled table of priced items. */
export type PricedList = {
  title: string;
  items: PricedItem[];
};

/** The whole reference, arranged for reading, independent of the format it is written in. */
export type PriceListDocument = {
  title: string;
  currency: PriceCurrency;
  lists: PricedList[];
};
