/**
 * A treasure hoard arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This is the largest piece of display logic the pass has found in a component. The page held the
 * gem-tallying rule — list them individually below twelve, group by name up to twenty-four, and
 * collapse to "N assorted gems" beyond that — plus the loose-item sorting, the container contents
 * lookup and four different value formatters, none of which anything could test. All of it is here.
 *
 * **6.4 has teeth**, which the issue and the design both say. A hoard with no art objects must not
 * print an art heading; nor must an empty container print an empty list under it, or a hoard rolled
 * at a value that produced nothing print a table of nothing. Every section is dropped by
 * construction when what would go under it is empty.
 */

import { COMMON_FANTASY, valueToString } from '$lib/currency';
import { kgToPounds } from '$lib/measurements';
import * as Words from '@ironarachne/words';

import { isArtObject, isGem, isPileOfCoins, isPotion } from './treasure_predicates.js';
import type { HoardItemSnapshot, TreasureHoardSnapshot } from './treasure_hoard_snapshot.js';
import type { Item } from '$lib/equipment';

/** Below this many, gems are listed one by one. */
export const GEM_LIST_LIMIT = 12;

/** Up to this many, gems are grouped by name; beyond it they are one assorted line. */
export const GEM_GROUP_LIMIT = 24;

/** One line of a hoard: what it is and what it is worth. */
export type HoardLine = {
  name: string;
  value: number;
  /** The value in coins, which is how a referee reads it out. */
  valueText: string;
};

/** One container and what is in it. */
export type HoardContainer = {
  name: string;
  /** The container's own weight plus what it holds, in pounds. */
  weightText: string;
  contents: HoardLine[];
};

/** A hoard arranged for reading, independent of the format it is finally written in. */
export type HoardDocument = {
  title: string;
  /** What the hoard is worth all told, which is not always what it was rolled for. */
  totalValueText: string;
  targetValueText: string;
  containers: HoardContainer[];
  /** Everything not packed into a container. */
  loose: HoardLine[];
};

function line(name: string, value: number): HoardLine {
  return { name, value, valueText: valueToString(value, COMMON_FANTASY) || '0 cp' };
}

/** A hoard item as the predicates see it. They read `itemMinorType`, which the snapshot keeps. */
function asItem(item: HoardItemSnapshot): Item {
  return item as unknown as Item;
}

/** Whether an item is a container, which is what having a `contents` list means here. */
export function isHoardContainer(item: HoardItemSnapshot): boolean {
  return Array.isArray(item.contents);
}

/**
 * Gems, tallied the way a referee reads them out.
 *
 * Under twelve they are individual objects a party can sort through; up to twenty-four they are
 * "three emeralds"; beyond that nobody is going to read forty lines aloud and the hoard says how
 * many there are and what the pile is worth. The rule was three branches in the component with no
 * test on any of them.
 */
export function tallyGems(gems: HoardItemSnapshot[]): HoardLine[] {
  if (gems.length === 0) {
    return [];
  }
  if (gems.length < GEM_LIST_LIMIT) {
    return gems.map((gem) => line(gem.name, gem.value));
  }
  if (gems.length <= GEM_GROUP_LIMIT) {
    const groups = new Map<string, { count: number; value: number }>();
    for (const gem of gems) {
      const entry = groups.get(gem.name) ?? { count: 0, value: 0 };
      entry.count += 1;
      entry.value += gem.value;
      groups.set(gem.name, entry);
    }
    return [...groups].map(([name, group]) =>
      line(`${group.count} ${group.count > 1 ? Words.pluralize(name) : name}`, group.value),
    );
  }

  return [
    line(
      `${gems.length} assorted gems`,
      gems.reduce((total, gem) => total + gem.value, 0),
    ),
  ];
}

/**
 * A set of items as lines, with the gems tallied and everything else named.
 *
 * Art objects read by their description where they have one — "a silver ewer chased with herons"
 * says more than "art object" — and a pile of coins says how many of what.
 */
export function hoardLines(items: HoardItemSnapshot[]): HoardLine[] {
  const gems = items.filter((item) => isGem(asItem(item)));
  const art = items.filter((item) => isArtObject(asItem(item)));
  const coins = items.filter((item) => isPileOfCoins(asItem(item)));
  const potions = items.filter((item) => isPotion(asItem(item)));
  const rest = items.filter(
    (item) =>
      !isGem(asItem(item)) &&
      !isArtObject(asItem(item)) &&
      !isPileOfCoins(asItem(item)) &&
      !isPotion(asItem(item)),
  );

  return [
    ...coins.map((pile) =>
      line(
        pile.quantity === undefined || pile.denomination === undefined
          ? pile.name
          : `${pile.quantity} ${pile.denomination}`,
        pile.value,
      ),
    ),
    ...rest.map((item) => line(item.name, item.value)),
    ...potions.map((potion) => line(potion.name, potion.value)),
    ...art.map((object) => line(object.description || object.name, object.value)),
    ...tallyGems(gems),
  ];
}

/** What a hoard is worth all told. */
export function hoardTotalValue(snapshot: TreasureHoardSnapshot): number {
  return snapshot.items.reduce((total, item) => total + item.value, 0);
}

/** Arrange a hoard for reading. */
export function hoardToDocument(
  snapshot: TreasureHoardSnapshot,
  title = 'Treasure Hoard',
): HoardDocument {
  const byId = new Map(snapshot.items.map((item) => [item.id, item]));
  const packed = new Set<string>();

  const containers: HoardContainer[] = [];
  for (const item of snapshot.items) {
    if (!isHoardContainer(item)) {
      continue;
    }
    const contents: HoardItemSnapshot[] = [];
    for (const id of item.contents ?? []) {
      const held = byId.get(id);
      if (held !== undefined) {
        contents.push(held);
        packed.add(id);
      }
    }
    containers.push({
      name: item.description || item.name,
      weightText: `${kgToPounds((item.currentWeight ?? 0) + item.weight).toFixed(1)} lbs`,
      contents: hoardLines(contents),
    });
  }

  const loose = snapshot.items.filter((item) => !isHoardContainer(item) && !packed.has(item.id));

  return {
    title,
    totalValueText: valueToString(hoardTotalValue(snapshot), COMMON_FANTASY) || '0 cp',
    targetValueText: valueToString(snapshot.targetValue, COMMON_FANTASY) || '0 cp',
    containers,
    loose: hoardLines(loose),
  };
}

function linesAsMarkdown(lines: HoardLine[], indent = ''): string {
  return lines.map((entry) => `${indent}- ${entry.name} (${entry.valueText})`).join('\n');
}

/** A hoard as Markdown, for a referee who reads it out and then keeps it. */
export function hoardToMarkdown(snapshot: TreasureHoardSnapshot, title?: string): string {
  const document = hoardToDocument(snapshot, title);
  const blocks = [`# ${document.title}`, `Worth ${document.totalValueText} all told.`];

  for (const container of document.containers) {
    const entry = [`## ${container.name} (${container.weightText})`];
    // 6.4: an empty chest says it is empty rather than heading a list with nothing under it.
    entry.push(container.contents.length === 0 ? 'Empty.' : linesAsMarkdown(container.contents));
    blocks.push(entry.join('\n\n'));
  }

  if (document.loose.length > 0) {
    blocks.push(['## Loose', linesAsMarkdown(document.loose)].join('\n\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document without the title the PDF draws itself. */
export function hoardToText(snapshot: TreasureHoardSnapshot, title?: string): string {
  const document = hoardToDocument(snapshot, title);
  const blocks = [`Worth ${document.totalValueText} all told.`];

  for (const container of document.containers) {
    const entry = [`${container.name} (${container.weightText})`];
    if (container.contents.length === 0) {
      entry.push('  Empty.');
    } else {
      entry.push(...container.contents.map((held) => `  ${held.name} (${held.valueText})`));
    }
    blocks.push(entry.join('\n'));
  }

  if (document.loose.length > 0) {
    blocks.push(
      ['Loose', ...document.loose.map((held) => `  ${held.name} (${held.valueText})`)].join('\n'),
    );
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported hoard, reduced to something a filesystem takes. */
export function hoardFileStem(title = 'Treasure Hoard'): string {
  const stem = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'treasure-hoard' ? 'treasure-hoard' : `treasure-hoard-${stem}`;
}
