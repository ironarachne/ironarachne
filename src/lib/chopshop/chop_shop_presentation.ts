/**
 * A chop shop arranged for reading, and the Markdown and PDF exports written from it.
 *
 * A paragraph under a heading is the whole document. 6.4 still applies: a shop whose text has
 * been emptied exports its heading and no blank paragraph beneath it.
 */

import type { ChopShop } from './chop_shop_types';

/** What the vault and the exports call one; a paragraph has no name of its own. */
export const CHOP_SHOP_DISPLAY_NAME = 'Chop Shop';

/** A shop arranged for reading, independent of the format it is finally written in. */
export type ChopShopDocument = {
  title: string;
  paragraphs: string[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

export function chopShopToDocument(shop: ChopShop): ChopShopDocument {
  return { title: CHOP_SHOP_DISPLAY_NAME, paragraphs: [shop.text].filter(isPrintable) };
}

/** A shop as Markdown, for a referee who wants it in their own notes. */
export function chopShopToMarkdown(shop: ChopShop): string {
  const document = chopShopToDocument(shop);
  return `${[`# ${document.title}`, ...document.paragraphs].join('\n\n')}\n`;
}

/** The body of the PDF: the paragraph, without the title the PDF draws as its own heading. */
export function chopShopToText(shop: ChopShop): string {
  return chopShopToDocument(shop).paragraphs.join('\n\n');
}

/** A filename stem for an exported shop. */
export const CHOP_SHOP_FILE_STEM = 'chop-shop';
