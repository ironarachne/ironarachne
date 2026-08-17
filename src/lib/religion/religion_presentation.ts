import { getTitleForGender } from '$lib/characters';

import {
  ALL_RELIGION_DIMENSION_IDS,
  type ReligionDimensionId,
} from './comparative_dimension_types';
import { summaryTextForReligionDimension } from './compose_religion_narrative';
import { listDomains } from './domains';
import type { Deity } from './deities';
import type { Religion } from './religion_types';

/** The heading each comparative dimension is printed under, in the order Smart lists them. */
const DIMENSION_HEADINGS: Record<ReligionDimensionId, string> = {
  ritual: 'Ritual',
  experiential: 'Experiential',
  mythological: 'Mythological',
  doctrinal: 'Doctrinal',
  ethical: 'Ethical',
  institutional: 'Institutional',
  material: 'Material',
};

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type ReligionSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A religion arranged for reading, independent of the format it is finally written in. */
export type ReligionDocument = {
  title: string;
  sections: ReligionSection[];
};

function section(heading: string, paragraphs: string[], items: string[] = []): ReligionSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: ReligionSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

/**
 * A deity's title as it should be spoken of them, or nothing.
 *
 * `Title` is a record with a form per gender, not a string. The page used to print the array
 * straight, which reads as `[object Object]` the moment a god has one — the King of the Gods
 * always does.
 */
export function deityTitleLine(deity: Deity): string {
  return (deity.titles ?? [])
    .map((title) => getTitleForGender(deity.gender.name, title))
    .filter(isPrintable)
    .join(', ');
}

function deityParagraphs(deity: Deity): string[] {
  const holy = [
    deity.holyItem === null ? '' : `Holy item: ${deity.holyItem}`,
    deity.holySymbol === null ? '' : `Holy symbol: ${deity.holySymbol}`,
  ];
  return [
    deityTitleLine(deity),
    `Domains: ${listDomains(deity.domains)}`,
    ...holy,
    deity.description,
  ];
}

function deitySections(religion: Religion): ReligionSection[] {
  const pantheon = religion.pantheon;
  if (pantheon === null) {
    return [];
  }
  return [
    section('Deities', [pantheon.description]),
    ...pantheon.members.map((deity) =>
      section(
        deity.name,
        deityParagraphs(deity),
        deity.relationships.map((relationship) => relationship.description),
      ),
    ),
  ];
}

function dimensionSections(religion: Religion): ReligionSection[] {
  const dimensions = religion.dimensions;
  if (dimensions === undefined) {
    return [];
  }
  return ALL_RELIGION_DIMENSION_IDS.map((id) =>
    section(DIMENSION_HEADINGS[id], [summaryTextForReligionDimension(id, dimensions[id])]),
  );
}

function cosmologySections(religion: Religion): ReligionSection[] {
  const cosmology = religion.cosmology;
  if (cosmology === undefined) {
    return [];
  }
  return [
    section(
      'Spirit Cosmology',
      [cosmology.summary],
      cosmology.echelons.map((echelon) => `${echelon.label}: ${echelon.summary}`),
    ),
  ];
}

function traditionSections(religion: Religion): ReligionSection[] {
  const detail = religion.nonTheisticDetail;
  if (detail === undefined) {
    return [];
  }
  return [section('Tradition', [detail.mediationSummary, detail.pollutionOrPurityNotes])];
}

/**
 * Arrange a religion for reading.
 *
 * Every empty section is dropped here, once, rather than in each renderer — which is what makes
 * requirement 6.4 (no stray blank lines from empty sections) a property of the model instead of
 * something two formats have to remember separately. A non-theistic tradition has no Deities
 * heading; it does not have an empty one, and neither does a god with no holy symbol have a blank
 * line where the symbol would be.
 */
export function religionToDocument(religion: Religion): ReligionDocument {
  const sections = [
    section('Overview', [religion.description]),
    ...traditionSections(religion),
    ...dimensionSections(religion),
    ...cosmologySections(religion),
    section(
      'Realms',
      [],
      religion.realms.map((realm) => `${realm.name}: ${realm.description}`),
    ),
    ...deitySections(religion),
  ];

  return { title: religion.name, sections: sections.filter(hasContent) };
}

/** A religion as Markdown, for a user who wants it in their own notes. */
export function religionToMarkdown(religion: Religion): string {
  const document = religionToDocument(religion);
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
 * A religion as plain text, for the PDF export.
 *
 * Separate from the Markdown because `#` and `-` are punctuation a PDF reader has to see past
 * rather than formatting it renders — the same content, written for a page instead of an editor.
 */
export function religionToPlainText(religion: Religion): string {
  const document = religionToDocument(religion);
  const blocks: string[] = [];

  for (const entry of document.sections) {
    blocks.push(entry.heading.toUpperCase());
    blocks.push(...entry.paragraphs);
    blocks.push(...entry.items);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** A filename stem for an exported religion: its name, reduced to something a filesystem takes. */
export function religionFileStem(religion: Religion): string {
  const stem = religion.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'religion' : stem;
}
