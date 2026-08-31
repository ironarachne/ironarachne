/**
 * A character arranged for reading, and the two formats it is written in.
 *
 * Requirement 6.3 in docs/workshop.md wants a presentation export a user can take to the table,
 * which is a different thing from artifact export: this is the character as a page, not as a
 * payload. The document model sits between the character and the formats so that requirement
 * 6.4 — no stray blank sections — is a property of the model rather than something two renderers
 * have to remember separately. A character with no titles, no equipment and no arms prints no
 * headings for them; it does not print empty ones.
 *
 * The export controls ship with this module rather than after it. `settlement_presentation.ts`
 * built the document model and wired no control to it, so nothing on the site renders it and 6.3 is
 * met there only on paper — see decision 8 of docs/fantasy-character.md, which is that mistake
 * named so as not to be repeated.
 */

import * as Measurements from '$lib/measurements';

import type { Character, Title } from './character_types.js';

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type CharacterSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A character arranged for reading, independent of the format it is finally written in. */
export type CharacterDocument = {
  title: string;
  sections: CharacterSection[];
};

function section(heading: string, paragraphs: string[], items: string[] = []): CharacterSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: CharacterSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

/** A title as it is worn, which depends on who is wearing it. */
export function characterTitleLine(title: Title, genderName: string): string {
  const worn = genderName.toLowerCase() === 'female' ? title.femaleTitle : title.maleTitle;
  return title.hasLands && isPrintable(title.landName) ? `${worn} of ${title.landName}` : worn;
}

/**
 * Height, weight and length in both the units the sheet shows.
 *
 * Both, because the screen shows both and an export that dropped one would be a different document
 * from the one the user was looking at. Length only when there is one: it is zero for every upright
 * species, and a line reading "Length: 0 ft." is exactly the stray content 6.4 is about.
 */
function buildLines(character: Character): string[] {
  const feet = Measurements.inchesToFeetExpression(Measurements.cmToInches(character.height));
  const pounds = Math.round(Measurements.kgToPounds(character.weight));
  return [
    `Height: ${feet} (${character.height} cm)`,
    `Weight: ${pounds} lb. (${character.weight} kg)`,
    character.length > 0
      ? `Length: ${Measurements.inchesToFeetExpression(Measurements.cmToInches(character.length))}`
      : '',
  ];
}

/**
 * What the character is, in the terms the stat block on screen uses.
 *
 * The archetype line is omitted rather than written as "Archetype: none": most characters this
 * generator makes are ordinary people, and a sheet that announced the absence of an occupation for
 * every child in a village would be noise.
 */
function identityLines(character: Character): string[] {
  return [
    `Species: ${character.species.name}`,
    `Gender: ${character.gender.name}`,
    `Age: ${character.age} years (${character.ageCategory.name})`,
    character.archetype === undefined ? '' : `Archetype: ${character.archetype.name}`,
    character.creatureTypes.length === 0 ? '' : `Type: ${character.creatureTypes.join(', ')}`,
  ];
}

/** Arrange a character for reading. Every empty section is dropped here, once. */
export function characterToDocument(character: Character): CharacterDocument {
  const sections = [
    section('Description', [character.description]),
    section('At a Glance', [], identityLines(character)),
    section('Build', [], buildLines(character)),
    section(
      'Titles',
      [],
      (character.titles ?? []).map((title) => characterTitleLine(title, character.gender.name)),
    ),
    section(
      'Physical Traits',
      [],
      character.physicalTraits.map((trait) => `${trait.name}: ${trait.description}`),
    ),
    section('Personality', [], character.personalityTraits),
    section(
      'Abilities',
      [],
      character.abilities.map((ability) => `${ability.name}: ${ability.description}`),
    ),
    section(
      'Equipment',
      [],
      character.carried.map((item) => item.name),
    ),
    // The blazon rather than the drawing: this is a text document, and a coat of arms written in
    // the language heralds use is the form of it a page can carry. The SVG is the generator's own
    // download.
    section('Heraldry', [character.heraldry?.blazon ?? '']),
  ];

  return {
    title: isPrintable(character.name) ? character.name : 'Character',
    sections: sections.filter(hasContent),
  };
}

/** A character as Markdown, for a user who wants them in their own notes. */
export function characterToMarkdown(character: Character): string {
  const document = characterToDocument(character);
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
 * A character as plain text, for the PDF export.
 *
 * Separate from the Markdown because `#` and `-` are punctuation a PDF reader has to see past
 * rather than formatting it renders — the same content, written for a page instead of an editor.
 */
export function characterToPlainText(character: Character): string {
  const document = characterToDocument(character);
  const blocks: string[] = [];

  for (const entry of document.sections) {
    blocks.push(entry.heading.toUpperCase());
    blocks.push(...entry.paragraphs);
    blocks.push(...entry.items);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** A filename stem for an exported character: their name, reduced to something a filesystem takes. */
export function characterFileStem(character: Character): string {
  const stem = character.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'character' : stem;
}
