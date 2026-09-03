/**
 * An item arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export at all, and the page showed a card that dropped half of what it had
 * rolled: the material, refinement, enchantment and decoration were folded into one sentence and
 * never named, so a user could see that a sword was *"finely balanced"* and not that the refinement
 * applied was called "master-forged".
 *
 * 6.4 applies line by line here rather than section by section: every line is dropped when the
 * field behind it is empty, which an edited item can be in a dozen places. What never drops is the
 * four facts always true of an item — what it is, how rare, what it is worth and what it weighs —
 * and a value of zero is written out rather than left blank, which is the fault #65 found in the
 * price lists seen from the other side.
 */

import { COMMON_FANTASY, valueToString } from '$lib/currency';
import { convertPowerToDice, convertToDnDArmorClass } from '$lib/combat_system';
import { kgToPounds } from '$lib/measurements';

import type { ItemSnapshot } from './item_snapshot';

/** Which numbers the page and the exports quote. */
export type ItemDisplaySystem = 'dnd5e' | 'ironarachne';

/** One line of the sheet: a label and what it says. */
export type ItemLine = {
  label: string;
  value: string;
};

/** An item arranged for reading, independent of the format it is finally written in. */
export type ItemDocument = {
  title: string;
  /** The generated paragraph, or nothing when it has been emptied. */
  description: string;
  lines: ItemLine[];
  /** The item's own tags, as the card shows them. */
  properties: string[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** What to head the document with: the item's unique name, else its name, else the kind. */
export function itemDisplayName(item: Pick<ItemSnapshot, 'name' | 'uniqueName'>): string {
  const unique = (item.uniqueName ?? '').trim();
  if (unique !== '') {
    return unique;
  }
  const name = item.name.trim();
  return name === '' ? 'Item' : name;
}

/**
 * An item's value, in the currency the rest of the site quotes prices in.
 *
 * Zero is written out rather than left to `valueToString`, which returns the empty string for it —
 * the same 6.4 fault #65 found in the price lists, where three free items printed an empty cost. An
 * item a user has priced at nothing has been priced; a dropped line reads as unknown.
 */
export function itemValueText(item: ItemSnapshot): string {
  return item.value <= 0 ? '0 cp' : valueToString(item.value, COMMON_FANTASY);
}

/** An item's weight, in pounds, to one decimal. */
export function itemWeightText(item: ItemSnapshot): string {
  return `${kgToPounds(item.weight).toFixed(1)} lbs`;
}

/**
 * The line naming an item's damage or its armour class.
 *
 * The one place the display system reaches: D&D quotes damage as dice and armour as a class, and
 * this site's own numbers are the raw power and defence the combat profile carries. Both describe
 * the same rolled item, which is why the choice is not part of the roll.
 */
export function itemCombatLines(item: ItemSnapshot, system: ItemDisplaySystem): ItemLine[] {
  const lines: ItemLine[] = [];
  const attack = item.actions?.[0];

  if (attack !== undefined) {
    const base = attack.baseDamage ?? 0;
    const damage =
      system === 'dnd5e'
        ? `${convertPowerToDice(base)} (${attack.damageType})`
        : `${base} (${attack.damageType})`;
    lines.push({ label: 'Damage', value: damage });

    for (const bonus of attack.bonusDamage ?? []) {
      const value =
        system === 'dnd5e'
          ? `${convertPowerToDice(bonus.power)} (${bonus.type})`
          : `${bonus.power} (${bonus.type})`;
      lines.push({ label: 'Bonus damage', value });
    }
  }

  if (item.itemMajorType === 'armor' && item.combatProfile !== undefined) {
    lines.push(
      system === 'dnd5e'
        ? {
            label: 'Armour class',
            value: String(convertToDnDArmorClass(item.combatProfile.defense)),
          }
        : { label: 'Defence', value: String(item.combatProfile.defense) },
    );
  }

  return lines;
}

/** Arrange an item for reading. */
export function itemToDocument(
  item: ItemSnapshot,
  system: ItemDisplaySystem = 'dnd5e',
): ItemDocument {
  const lines: ItemLine[] = [
    { label: 'Type', value: item.itemMinorType ?? item.itemMajorType },
    { label: 'Rarity', value: item.rarity },
    { label: 'Value', value: itemValueText(item) },
    { label: 'Weight', value: itemWeightText(item) },
    ...itemCombatLines(item, system),
    // The composition, named rather than only described. This is what storing the records buys
    // that storing the paragraph would not.
    { label: 'Material', value: item.material?.name ?? '' },
    { label: 'Refinement', value: item.refinement?.name ?? '' },
    { label: 'Enchantment', value: item.enchantment?.name ?? '' },
    { label: 'Decoration', value: item.decoration?.name ?? '' },
  ];

  return {
    title: itemDisplayName(item),
    description: item.description.trim(),
    lines: lines.filter((line) => isPrintable(line.value)),
    properties: item.properties.filter(isPrintable),
  };
}

/** An item as Markdown, for a player who keeps their gear in their own notes. */
export function itemToMarkdown(item: ItemSnapshot, system: ItemDisplaySystem = 'dnd5e'): string {
  const document = itemToDocument(item, system);
  const blocks = [`# ${document.title}`];

  if (isPrintable(document.description)) {
    blocks.push(document.description);
  }
  if (document.lines.length > 0) {
    blocks.push(document.lines.map((line) => `- ${line.label}: ${line.value}`).join('\n'));
  }
  if (document.properties.length > 0) {
    blocks.push(`Properties: ${document.properties.join(', ')}`);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document without the title the PDF draws itself. */
export function itemToText(item: ItemSnapshot, system: ItemDisplaySystem = 'dnd5e'): string {
  const document = itemToDocument(item, system);
  const blocks: string[] = [];

  if (isPrintable(document.description)) {
    blocks.push(document.description);
  }
  if (document.lines.length > 0) {
    blocks.push(document.lines.map((line) => `${line.label}: ${line.value}`).join('\n'));
  }
  if (document.properties.length > 0) {
    blocks.push(`Properties: ${document.properties.join(', ')}`);
  }

  return blocks.join('\n\n');
}

/**
 * A whole press as Markdown — the list on screen, which is what a referee stocking a table wants.
 *
 * Beside `itemToMarkdown` rather than instead of it: the page offers both, because a user wants
 * either the ten items they just rolled or the one they are about to give a player.
 */
export function itemListToMarkdown(
  items: ItemSnapshot[],
  system: ItemDisplaySystem = 'dnd5e',
): string {
  const blocks = ['# Equipment'];

  for (const item of items) {
    const document = itemToDocument(item, system);
    const entry = [`## ${document.title}`];
    if (isPrintable(document.description)) {
      entry.push(document.description);
    }
    if (document.lines.length > 0) {
      entry.push(document.lines.map((line) => `- ${line.label}: ${line.value}`).join('\n'));
    }
    blocks.push(entry.join('\n\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The same list as plain text, for the PDF. */
export function itemListToText(items: ItemSnapshot[], system: ItemDisplaySystem = 'dnd5e'): string {
  return items
    .map((item) => {
      const document = itemToDocument(item, system);
      const body = itemToText(item, system);
      return isPrintable(body) ? `${document.title}\n\n${body}` : document.title;
    })
    .join('\n\n');
}

/** A filename stem for an exported item, reduced to something a filesystem takes. */
export function itemFileStem(item: Pick<ItemSnapshot, 'name' | 'uniqueName'>): string {
  const stem = itemDisplayName(item)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'item' ? 'item' : `item-${stem}`;
}
