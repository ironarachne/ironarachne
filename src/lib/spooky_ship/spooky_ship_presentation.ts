/**
 * A derelict arranged for reading, and the Markdown and PDF exports written from it.
 *
 * A paragraph under a heading is the whole document. 6.4 still applies: a ship whose text has been
 * emptied exports its heading and no blank paragraph beneath it.
 */

import type { SpookyShip } from './spooky_ship_types';

/** What the vault and the exports call one; a paragraph has no name of its own. */
export const SPOOKY_SHIP_DISPLAY_NAME = 'Spooky Ship';

/** A derelict arranged for reading, independent of the format it is finally written in. */
export type SpookyShipDocument = {
  title: string;
  paragraphs: string[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

export function spookyShipToDocument(ship: SpookyShip): SpookyShipDocument {
  return { title: SPOOKY_SHIP_DISPLAY_NAME, paragraphs: [ship.text].filter(isPrintable) };
}

/** A derelict as Markdown, for a referee who wants it in their own notes. */
export function spookyShipToMarkdown(ship: SpookyShip): string {
  const document = spookyShipToDocument(ship);
  return `${[`# ${document.title}`, ...document.paragraphs].join('\n\n')}\n`;
}

/** The body of the PDF: the paragraph, without the title the PDF draws as its own heading. */
export function spookyShipToText(ship: SpookyShip): string {
  return spookyShipToDocument(ship).paragraphs.join('\n\n');
}

/** A filename stem for an exported derelict. */
export const SPOOKY_SHIP_FILE_STEM = 'spooky-ship';
