/**
 * A merchant arranged for reading, and the Markdown and PDF exports written from it.
 *
 * 6.3 matters more here than for most tools in the pass: a shop inventory is exactly the thing a
 * referee wants on paper beside them, and this tool had no export at all.
 *
 * 6.4 has teeth for the same reason a hoard's does. A merchant with no mark must not print a mark
 * heading, one whose haggling advice has been cleared must not print a blank line where it was, and
 * an empty shop must not print a table head with nothing under it. Every section is dropped by
 * construction when the field behind it is empty.
 */

import { COMMON_FANTASY, valueToString } from '$lib/currency';

import type { MerchantSnapshot } from './merchant_snapshot';
import type { MerchantStockItem } from './merchant_types';

/** One line of the sheet: a label and what it says. */
export type MerchantLine = {
  label: string;
  value: string;
};

/** A merchant arranged for reading, independent of the format it is finally written in. */
export type MerchantDocument = {
  title: string;
  /** The shop type and venue, as the page's subheading reads them. */
  subtitle: string;
  /** The location blurb, and the settlement when one was referenced. */
  location: string;
  paragraphs: string[];
  proprietor: { name: string; lines: MerchantLine[]; paragraphs: string[] };
  trading: MerchantLine[];
  /** The trading notes, which are sentences rather than labelled values. */
  notes: string[];
  stock: MerchantStockItem[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** A price, in the currency the rest of the site quotes prices in. */
export function merchantPriceText(cost: number): string {
  return cost <= 0 ? '0 cp' : valueToString(cost, COMMON_FANTASY);
}

/** The price modifier as the page and the exports read it. */
export function priceModifierText(modifier: number): string {
  return `${Math.round(modifier * 100)}% of catalog value`;
}

/** What to head the document with: the shop, falling back to the proprietor. */
export function merchantDisplayName(snapshot: MerchantSnapshot): string {
  const shop = snapshot.shop.name.trim();
  if (shop !== '') {
    return shop;
  }
  const proprietor = snapshot.proprietor.fullName.trim();
  return proprietor === '' ? 'Merchant' : proprietor;
}

/**
 * Where the shop stands, in one line.
 *
 * The settlement is appended rather than replacing the blurb: "on the market square" and "in
 * Ashford" answer different halves of the question, and a referee who linked a settlement did not
 * ask to lose the corner it stands on.
 */
export function merchantLocationText(snapshot: MerchantSnapshot): string {
  const blurb = snapshot.shop.locationBlurb.trim();
  const settlement = (snapshot.shop.settlementName ?? '').trim();
  if (settlement === '') {
    return blurb;
  }
  return blurb === '' ? `In ${settlement}.` : `${blurb} In ${settlement}.`;
}

/** Arrange a merchant for reading. */
export function merchantToDocument(snapshot: MerchantSnapshot): MerchantDocument {
  const subtitleParts = [snapshot.shop.shopTypeLabel, snapshot.shop.venueTypeLabel].filter(
    isPrintable,
  );

  return {
    title: merchantDisplayName(snapshot),
    subtitle: subtitleParts.join(' · '),
    location: merchantLocationText(snapshot),
    paragraphs: [snapshot.shop.description].filter(isPrintable),
    proprietor: {
      name: snapshot.proprietor.fullName.trim(),
      lines: [
        {
          label: 'Temperament',
          value: snapshot.proprietor.personalityTraits.filter(isPrintable).join(', '),
        },
      ].filter((line) => isPrintable(line.value)),
      paragraphs: [snapshot.proprietor.description].filter(isPrintable),
    },
    trading: [
      { label: 'Honesty', value: snapshot.honesty },
      { label: 'Price level', value: snapshot.priceLevel },
      { label: 'Price modifier', value: priceModifierText(snapshot.priceModifier) },
    ].filter((line) => isPrintable(line.value)),
    notes: [snapshot.honestyNotes, snapshot.hagglingAdvice].filter(isPrintable),
    stock: snapshot.stock,
  };
}

function stockRows(stock: MerchantStockItem[]): string[] {
  return stock.map(
    (item) =>
      `| ${item.name} | ${item.quantity} | ${merchantPriceText(item.baseCost)} | ${merchantPriceText(item.price)} | ${item.note ?? ''} |`,
  );
}

/** A merchant as Markdown, for a referee who keeps their shops in their own notes. */
export function merchantToMarkdown(snapshot: MerchantSnapshot): string {
  const document = merchantToDocument(snapshot);
  const blocks = [`# ${document.title}`];

  if (isPrintable(document.subtitle)) {
    blocks.push(`*${document.subtitle}*`);
  }
  if (isPrintable(document.location)) {
    blocks.push(document.location);
  }
  blocks.push(...document.paragraphs);

  if (document.proprietor.name !== '') {
    const entry = [`## Proprietor`, `**${document.proprietor.name}**`];
    entry.push(...document.proprietor.paragraphs);
    entry.push(...document.proprietor.lines.map((line) => `- ${line.label}: ${line.value}`));
    blocks.push(entry.join('\n\n'));
  }

  if (document.trading.length > 0 || document.notes.length > 0) {
    const entry = ['## Trading'];
    if (document.trading.length > 0) {
      entry.push(document.trading.map((line) => `- ${line.label}: ${line.value}`).join('\n'));
    }
    entry.push(...document.notes);
    blocks.push(entry.join('\n\n'));
  }

  // 6.4: an empty shop prints no heading at all rather than a table head with nothing under it.
  if (document.stock.length > 0) {
    blocks.push(
      [
        '## Stock',
        '| Item | Qty | Catalog | Ask price | Note |',
        '| --- | ---: | ---: | ---: | --- |',
        ...stockRows(document.stock),
      ].join('\n'),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document without the title the PDF draws itself. */
export function merchantToText(snapshot: MerchantSnapshot): string {
  const document = merchantToDocument(snapshot);
  const blocks: string[] = [];

  if (isPrintable(document.subtitle)) {
    blocks.push(document.subtitle);
  }
  if (isPrintable(document.location)) {
    blocks.push(document.location);
  }
  blocks.push(...document.paragraphs);

  if (document.proprietor.name !== '') {
    const entry = [`Proprietor: ${document.proprietor.name}`];
    entry.push(...document.proprietor.paragraphs);
    entry.push(...document.proprietor.lines.map((line) => `${line.label}: ${line.value}`));
    blocks.push(entry.join('\n'));
  }

  if (document.trading.length > 0 || document.notes.length > 0) {
    const entry = ['Trading'];
    entry.push(...document.trading.map((line) => `  ${line.label}: ${line.value}`));
    entry.push(...document.notes.map((note) => `  ${note}`));
    blocks.push(entry.join('\n'));
  }

  if (document.stock.length > 0) {
    blocks.push(
      [
        'Stock',
        ...document.stock.map(
          (item) =>
            `  ${item.quantity} x ${item.name} - ${merchantPriceText(item.price)}${item.note === undefined ? '' : ` (${item.note})`}`,
        ),
      ].join('\n'),
    );
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported merchant, reduced to something a filesystem takes. */
export function merchantFileStem(snapshot: MerchantSnapshot): string {
  const stem = merchantDisplayName(snapshot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'merchant' ? 'merchant' : `merchant-${stem}`;
}
