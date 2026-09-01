/**
 * A set of Velgarth Gifts arranged for reading, and the Markdown export written from it.
 *
 * This tool had **no export at all** before requirement 6.3 asked for one — no PDF, no text, no
 * file of any kind — so unlike its neighbours in the pass there is no drawn sheet to sit beneath.
 * What a player wants is the Gifts as prose they can paste into a character's notes, which is what
 * this produces.
 *
 * 6.4 is the reason the document model exists rather than a single template string: a set with no
 * Gifts in it prints no headings at all, and a Gift whose description a user has emptied prints its
 * name and its strength without a blank line where the prose was.
 */

import type Gift from './gift.js';

/** One Gift arranged for reading: its heading, and the lines under it. */
export type VelgarthGiftSection = {
  heading: string;
  paragraphs: string[];
};

/** A set of Gifts arranged for reading, independent of the format it is finally written in. */
export type VelgarthGiftsDocument = {
  title: string;
  sections: VelgarthGiftSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** The heading a Gift gets: its name and the strength it was rolled at. */
export function velgarthGiftHeading(gift: Gift): string {
  const name = isPrintable(gift.name) ? gift.name.trim() : 'An unnamed Gift';
  return `${name} (strength ${gift.strength})`;
}

/**
 * Arrange a set for reading.
 *
 * A Gift with no name and no description still gets a heading, because its strength is a fact about
 * the character and dropping the row would lose it. What is dropped is an empty description, which
 * is the blank content 6.4 is about.
 */
export function velgarthGiftsToDocument(gifts: Gift[]): VelgarthGiftsDocument {
  return {
    title: velgarthGiftsDisplayName(gifts),
    sections: gifts.map((gift) => ({
      heading: velgarthGiftHeading(gift),
      paragraphs: [gift.description].filter(isPrintable),
    })),
  };
}

/**
 * What to head the document with: the Gifts, listed.
 *
 * A set has no name of its own — it is what a person can do — so this reads the way a player would
 * say it out loud, and it matches what the artifact kind calls a saved set.
 */
export function velgarthGiftsDisplayName(gifts: Gift[]): string {
  const names = gifts.map((gift) => gift.name.trim()).filter(isPrintable);
  if (names.length === 0) {
    return 'Velgarth Gifts';
  }
  if (names.length === 1) {
    return names[0];
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** A set of Gifts as Markdown, for a player who wants them in their own notes. */
export function velgarthGiftsToMarkdown(gifts: Gift[]): string {
  const document = velgarthGiftsToDocument(gifts);
  const blocks = [`# ${document.title}`];

  for (const entry of document.sections) {
    blocks.push(`## ${entry.heading}`);
    blocks.push(...entry.paragraphs);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** A filename stem for an exported set, reduced to something a filesystem takes. */
export function velgarthGiftsFileStem(gifts: Gift[]): string {
  const stem = velgarthGiftsDisplayName(gifts)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'velgarth-gifts' : `velgarth-${stem}`;
}
