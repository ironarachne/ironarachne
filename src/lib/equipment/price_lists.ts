/**
 * The fantasy equipment price lists, priced, filtered and written out.
 *
 * All of this used to live in `EquipmentPriceLists.svelte`, where it could not be tested and where
 * three things had quietly drifted apart: the key on the page listed denominations the table never
 * printed (electrum, platinum, a crown that exists in no currency system here), the table printed
 * one the key never mentioned (guineas, and `farthing` spelled out because the denomination
 * carries no symbol), and an item costing nothing printed an empty cell. Requirement 6.4 is the
 * one that catches the last of those, and the key is only honest if it is derived from the same
 * system the prices are.
 *
 * The costs in `fantasylist/` are stored in copper pieces, which is also one farthing — the page
 * has always said so, and `baseUnitPerCopper` is where that claim now lives.
 */

import { HISTORICAL_BRITISH, STANDARD_FANTASY, valueToString } from '$lib/currency';
import type { CurrencyDenomination, CurrencySystem } from '$lib/currency';

import { all } from './fantasylist/index.js';
import type { EquipmentList } from './list.js';
import type {
  PriceCurrency,
  PriceLegendEntry,
  PriceListDocument,
  PricedList,
} from './price_list_types.js';

/** What an item with no price shows, rather than the empty string `valueToString` returns for 0. */
export const FREE_LABEL = 'Free';

/** The document's own title, shared by the page heading and both exports. */
export const PRICE_LIST_TITLE = 'Fantasy Equipment Price Lists';

/**
 * How each denomination is written in the key.
 *
 * The currency systems name a metal (`copper`) where a price list names a coin (`copper piece`),
 * and English has one plural nothing can derive (`penny` → `pence`). Keyed by denomination name,
 * so a system growing a denomination shows up here as a missing key rather than as silently
 * wrong copy.
 */
const DENOMINATION_NAMES: Record<string, { singular: string; plural: string }> = {
  copper: { singular: 'copper piece', plural: 'copper pieces' },
  silver: { singular: 'silver piece', plural: 'silver pieces' },
  gold: { singular: 'gold piece', plural: 'gold pieces' },
  farthing: { singular: 'farthing', plural: 'farthings' },
  penny: { singular: 'penny', plural: 'pence' },
  shilling: { singular: 'shilling', plural: 'shillings' },
  pound: { singular: 'pound', plural: 'pounds' },
};

/**
 * D&D money as a price list quotes it.
 *
 * Electrum and platinum are dropped rather than kept and hoped against: `valueToString` spends
 * every denomination it is given, so leaving electrum in prices a 60-copper item at "1 ep 1 cp",
 * which no rulebook does. Both coins are rare by their own tables, which is the reason they are
 * absent from the key too.
 */
const DND_SYSTEM: CurrencySystem = {
  ...STANDARD_FANTASY,
  denominations: STANDARD_FANTASY.denominations.filter(
    (denomination) => denomination.name !== 'electrum' && denomination.name !== 'platinum',
  ),
};

/**
 * Pre-decimal English money as a price list quotes it.
 *
 * The guinea goes for the same reason electrum does — at 252 pence against the pound's 240 it
 * outranks the pound, so every price over a pound was quoted in guineas. The farthing is given a
 * symbol because it has none in `$lib/currency` and `valueToString` falls back to the
 * denomination's name, which printed "3 farthing" in a column of `cp` and `sp`. Historically the
 * farthing was written as a fraction of a penny; `f` is what this page's key has always called it.
 */
const ENGLISH_SYSTEM: CurrencySystem = {
  ...HISTORICAL_BRITISH,
  denominations: HISTORICAL_BRITISH.denominations
    .filter((denomination) => denomination.name !== 'guinea')
    .map((denomination) =>
      denomination.name === 'farthing' ? { ...denomination, symbol: 'f' } : denomination,
    ),
};

function denominationSymbol(denomination: CurrencyDenomination): string {
  return denomination.symbol ?? denomination.name;
}

function denominationName(denomination: CurrencyDenomination, count: number): string {
  const names = DENOMINATION_NAMES[denomination.name];
  if (names === undefined) {
    return denomination.name;
  }
  return count === 1 ? names.singular : names.plural;
}

/**
 * The key, derived from the system the prices are quoted in.
 *
 * Each denomination is described against the next one down rather than against the base unit,
 * because "worth 12 pence" is how a reader holds a shilling and "worth 48 farthings" is not.
 */
export function priceLegend(system: CurrencySystem): PriceLegendEntry[] {
  const ascending = [...system.denominations].sort((a, b) => a.value - b.value);

  return ascending.map((denomination, index) => {
    const smaller = ascending[index - 1];
    const count = smaller === undefined ? 0 : denomination.value / smaller.value;

    return {
      symbol: denominationSymbol(denomination),
      name: denominationName(denomination, 1),
      worth: smaller === undefined ? '' : `worth ${count} ${denominationName(smaller, count)}`,
    };
  });
}

/** Every currency the lists can be read in, in the order the select offers them. */
export const PRICE_CURRENCIES: PriceCurrency[] = [
  {
    id: 'dnd',
    label: 'D&D currency',
    system: DND_SYSTEM,
    baseUnitPerCopper: 1,
    legend: priceLegend(DND_SYSTEM),
  },
  {
    id: 'english',
    label: 'English currency',
    system: ENGLISH_SYSTEM,
    // A copper piece is a farthing, and the historical system's base unit is the penny.
    baseUnitPerCopper: 0.25,
    legend: priceLegend(ENGLISH_SYSTEM),
  },
];

/**
 * The currency with that id, falling back to the first rather than throwing.
 *
 * The caller is a `<select>` whose value is a string; a value that is not a currency means the
 * markup and this list disagree, and a reference page that shows prices in the wrong currency is
 * a better outcome than one that shows a blank screen.
 */
export function priceCurrency(id: string): PriceCurrency {
  return PRICE_CURRENCIES.find((currency) => currency.id === id) ?? PRICE_CURRENCIES[0];
}

/** One item's cost, written in a currency. */
export function formatCost(costInCopper: number, currency: PriceCurrency): string {
  if (costInCopper <= 0) {
    return FREE_LABEL;
  }
  return valueToString(costInCopper * currency.baseUnitPerCopper, currency.system);
}

/**
 * The lists narrowed to the items whose name matches `query`.
 *
 * Case- and space-insensitive substring matching, which is what a reader typing "rope" into a
 * five-hundred-row reference means. A list with nothing left in it is dropped rather than shown
 * empty — 6.4 for the page as much as for the exports.
 */
export function filterEquipmentLists(lists: EquipmentList[], query: string): EquipmentList[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return lists;
  }

  return lists
    .map((list) => ({
      ...list,
      items: list.items.filter((item) => item.name.toLowerCase().includes(needle)),
    }))
    .filter((list) => list.items.length > 0);
}

/** How many items the lists hold, which is what the page counts when it filters. */
export function countEquipmentItems(lists: EquipmentList[]): number {
  return lists.reduce((total, list) => total + list.items.length, 0);
}

/** The lists with every cost rendered in a currency. */
export function toPricedLists(lists: EquipmentList[], currency: PriceCurrency): PricedList[] {
  return lists.map((list) => ({
    title: list.title,
    items: list.items.map((item) => ({ name: item.name, cost: formatCost(item.cost, currency) })),
  }));
}

/** The whole reference arranged for reading. */
export function priceListDocument(
  currency: PriceCurrency,
  lists: EquipmentList[] = all(),
): PriceListDocument {
  return {
    title: PRICE_LIST_TITLE,
    currency,
    lists: toPricedLists(lists, currency),
  };
}

function legendLine(entry: PriceLegendEntry): string {
  return entry.worth === ''
    ? `${entry.symbol}: ${entry.name}`
    : `${entry.symbol}: ${entry.name} (${entry.worth})`;
}

/** The reference as Markdown, for a referee who keeps their notes in it. */
export function priceListToMarkdown(document: PriceListDocument): string {
  const blocks = [
    `# ${document.title}`,
    `Prices in ${document.currency.label}.`,
    document.currency.legend.map((entry) => `- ${legendLine(entry)}`).join('\n'),
  ];

  for (const list of document.lists) {
    blocks.push(
      [
        `## ${list.title}`,
        '| Item | Cost |',
        '| --- | ---: |',
        ...list.items.map((item) => `| ${item.name} | ${item.cost} |`),
      ].join('\n'),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document without the title the PDF draws itself. */
export function priceListToText(document: PriceListDocument): string {
  const blocks = [
    `Prices in ${document.currency.label}.`,
    document.currency.legend.map(legendLine).join('\n'),
  ];

  for (const list of document.lists) {
    blocks.push(
      [list.title, ...list.items.map((item) => `  ${item.name} - ${item.cost}`)].join('\n'),
    );
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported list, which names the currency it is priced in. */
export function priceListFileStem(currency: PriceCurrency): string {
  return `fantasy-equipment-prices-${currency.id}`;
}
