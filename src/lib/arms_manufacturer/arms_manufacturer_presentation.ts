/**
 * An arms manufacturer arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had **no export at all** before requirement 6.3 asked for one, so there is no drawn
 * sheet to sit beneath this. What a referee wants at the table is the company as a paragraph and
 * its catalogue as a list — the page, on paper — which is what this produces, and the same
 * document is written once as Markdown and once as plain text for the PDF so the two cannot drift.
 *
 * 6.4 is the reason the document model exists rather than a single template string: a manufacturer
 * whose description a user has emptied prints its name without a blank paragraph, a catalogue with
 * nothing in it prints no "Models" heading, and a model whose description has been cleared prints
 * its name and nothing under it.
 */

import type { Weapon } from '$lib/weapons';

import type { ArmsManufacturer } from './arms_manufacturer.js';

/** One model arranged for reading: its heading, and the lines under it. */
export type ArmsManufacturerModelSection = {
  heading: string;
  paragraphs: string[];
};

/** A manufacturer arranged for reading, independent of the format it is finally written in. */
export type ArmsManufacturerDocument = {
  title: string;
  paragraphs: string[];
  models: ArmsManufacturerModelSection[];
};

/** The heading the catalogue gets when there is one. */
export const ARMS_MANUFACTURER_MODELS_HEADING = 'Models';

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/**
 * What to head the document with: the company's name, or the kind when it has none.
 *
 * It matches what the artifact kind calls a saved manufacturer, so the export and the vault agree.
 */
export function armsManufacturerDisplayName(manufacturer: ArmsManufacturer): string {
  const name = manufacturer.name.trim();
  return name === '' ? 'Arms Manufacturer' : name;
}

/** The heading a model gets: its name, and its damage type when it has one. */
export function armsManufacturerModelHeading(model: Weapon): string {
  const name = isPrintable(model.name) ? model.name.trim() : 'An unnamed model';
  return isPrintable(model.damage) ? `${name} (${model.damage.trim()})` : name;
}

/**
 * Arrange a manufacturer for reading.
 *
 * A model with no name and no description still gets a heading, because a row in the catalogue is
 * a fact about the company and dropping it would lose it. What is dropped is empty prose, which is
 * the blank content 6.4 is about.
 */
export function armsManufacturerToDocument(
  manufacturer: ArmsManufacturer,
): ArmsManufacturerDocument {
  return {
    title: armsManufacturerDisplayName(manufacturer),
    paragraphs: [manufacturer.description].filter(isPrintable),
    models: manufacturer.models.map((model) => ({
      heading: armsManufacturerModelHeading(model),
      paragraphs: [model.description].filter(isPrintable),
    })),
  };
}

/** A manufacturer as Markdown, for a referee who wants it in their own notes. */
export function armsManufacturerToMarkdown(manufacturer: ArmsManufacturer): string {
  const document = armsManufacturerToDocument(manufacturer);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  if (document.models.length > 0) {
    blocks.push(`## ${ARMS_MANUFACTURER_MODELS_HEADING}`);
    for (const entry of document.models) {
      blocks.push(`### ${entry.heading}`);
      blocks.push(...entry.paragraphs);
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/**
 * The body of the PDF: the same document as plain text, without the title, which the PDF draws
 * as its own heading.
 */
export function armsManufacturerToText(manufacturer: ArmsManufacturer): string {
  const document = armsManufacturerToDocument(manufacturer);
  const blocks = [...document.paragraphs];

  if (document.models.length > 0) {
    blocks.push(ARMS_MANUFACTURER_MODELS_HEADING.toUpperCase());
    for (const entry of document.models) {
      blocks.push([entry.heading, ...entry.paragraphs].join('\n'));
    }
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported manufacturer, reduced to something a filesystem takes. */
export function armsManufacturerFileStem(manufacturer: ArmsManufacturer): string {
  const stem = armsManufacturerDisplayName(manufacturer)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'arms-manufacturer' : stem;
}
