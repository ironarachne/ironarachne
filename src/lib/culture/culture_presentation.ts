import type { Religion } from '$lib/religion';

import type { Culture } from './culture_types';

/**
 * Example names to print alongside a culture, as the caller drew them.
 *
 * Passed in rather than generated here, and that is the point: a culture's name generators produce
 * something different on every call, so an export that rolled its own would hand the user a sheet
 * that does not match the screen they exported it from.
 */
export type CultureSampleNames = {
  male?: string[];
  female?: string[];
  family?: string[];
  country?: string[];
  town?: string[];
};

export type CulturePresentationOptions = {
  sampleNames?: CultureSampleNames;
  /**
   * The religion to print when the culture's own is `null` — a referenced religion the caller has
   * resolved. Left out, a composed culture simply has no religion section, which is honest: the
   * library was not given one and inventing a line about it would be worse than silence.
   */
  religion?: Religion | null;
};

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type CultureSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A culture arranged for reading, independent of the format it is finally written in. */
export type CultureDocument = {
  title: string;
  sections: CultureSection[];
};

function section(heading: string, paragraphs: string[], items: string[] = []): CultureSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: CultureSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

function nameSections(sampleNames: CultureSampleNames): CultureSection[] {
  return [
    section('Male Names', [], sampleNames.male ?? []),
    section('Female Names', [], sampleNames.female ?? []),
    section('Family Names', [], sampleNames.family ?? []),
    section('Country Names', [], sampleNames.country ?? []),
    section('Town Names', [], sampleNames.town ?? []),
  ];
}

function religionSection(religion: Religion | null): CultureSection {
  return religion === null
    ? section('Religion', [])
    : section('Religion', [religion.name, religion.description]);
}

/**
 * Arrange a culture for reading.
 *
 * Every empty section is dropped here, once, rather than in each renderer — which is what makes
 * requirement 6.4 (no stray blank lines from empty sections) a property of the model instead of
 * something two formats have to remember separately. A culture with no taboos has no Taboos
 * heading; it does not have an empty one.
 */
export function cultureToDocument(
  culture: Culture,
  options: CulturePresentationOptions = {},
): CultureDocument {
  const religion = options.religion === undefined ? culture.religion : options.religion;
  const sections = [
    ...nameSections(options.sampleNames ?? {}),
    section('Organization', [culture.organization.description]),
    religionSection(religion),
    section('Taboos', [], culture.taboos),
    section('Greetings', [culture.greeting]),
    section('Meals', [culture.eatingTrait]),
    section('Design', [culture.designTrait]),
    section('Music', [culture.musicStyle]),
  ];

  return {
    title: `The ${culture.name} Culture`,
    sections: sections.filter(hasContent),
  };
}

/** A culture as Markdown, for a user who wants it in their own notes. */
export function cultureToMarkdown(
  culture: Culture,
  options: CulturePresentationOptions = {},
): string {
  const document = cultureToDocument(culture, options);
  const blocks = [`# ${document.title}`];

  for (const entry of document.sections) {
    blocks.push(`## ${entry.heading}`);
    blocks.push(...entry.paragraphs);
    if (entry.items.length > 0) {
      blocks.push(entry.items.map((item) => `- ${item}`).join('\n'));
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/**
 * A culture as plain text, for the PDF export.
 *
 * Separate from the Markdown because `#` and `-` are punctuation a PDF reader has to see past
 * rather than formatting it renders — the same content, written for a page instead of an editor.
 */
export function cultureToPlainText(
  culture: Culture,
  options: CulturePresentationOptions = {},
): string {
  const document = cultureToDocument(culture, options);
  const blocks: string[] = [];

  for (const entry of document.sections) {
    blocks.push(entry.heading.toUpperCase());
    blocks.push(...entry.paragraphs);
    blocks.push(...entry.items);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** A filename stem for an exported culture: its name, reduced to something a filesystem takes. */
export function cultureFileStem(culture: Culture): string {
  const stem = culture.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'culture' : stem;
}
