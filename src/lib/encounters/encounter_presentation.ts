/**
 * An encounter arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This is the point of the tool, per docs/readiness-factions.md: an encounter is a thing a GM
 * prints and puts on the table, and it had no export of any kind before requirement 6.3. What the
 * table needs is each band with its numbers and each combatant's name, species and role — the page,
 * on paper — and the one document model is written once as Markdown and once as plain text for the
 * PDF so the two cannot drift.
 *
 * 6.4 has teeth here. The generator writes an empty description and a difficulty of zero today
 * (both are marked TODO in the generator), so a document that printed them would print a blank
 * paragraph and "Difficulty: 0" on every encounter ever made. Both are dropped when empty, a group
 * with no mobs prints its heading and nothing under it, and an encounter with no groups prints its
 * title alone.
 *
 * Presentation works on the *stored* shape rather than the live one, deliberately: the page holds
 * a live `Encounter` and the editor holds a snapshot, and one model that both can print is
 * cheaper than two. `describeEncounterMob` is where a stored mob's species name and a live mob's
 * species object meet.
 */

import type { Character } from '$lib/characters';
import type { Mob } from '$lib/mobs';

import { isEncounterCharacter, type StoredEncounterMob } from './encounter_snapshot.js';

/** One combatant, as a line on the sheet. */
export type EncounterMobLine = {
  name: string;
  /** "human fighter", "wolf" — species and, for a character, archetype. */
  kind: string;
};

/** One band arranged for reading. */
export type EncounterGroupSection = {
  heading: string;
  mobs: EncounterMobLine[];
};

/** An encounter arranged for reading, independent of the format it is finally written in. */
export type EncounterDocument = {
  title: string;
  paragraphs: string[];
  groups: EncounterGroupSection[];
};

/** The parts of an encounter the presentation reads, which both the live and stored shapes have. */
export type PresentableEncounter = {
  name: string;
  description: string;
  difficulty: number;
  groups: { name?: string; mobs: (Mob | StoredEncounterMob)[] }[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** What to head the document with: the encounter's name, or the kind when it has none. */
export function encounterDisplayName(encounter: { name: string }): string {
  const name = encounter.name.trim();
  return name === '' ? 'Encounter' : capitalize(name);
}

/**
 * The words after a combatant's name: its species and, for a character, its archetype.
 *
 * Reads either shape. A live mob carries a species object; a stored one carries the name it will
 * be resolved from. Either way the sheet prints the name, which is all a table needs.
 */
export function describeEncounterMob(mob: Mob | StoredEncounterMob): EncounterMobLine {
  const speciesName =
    'speciesName' in mob ? mob.speciesName : ((mob as Partial<Character>).species?.name ?? '');
  const archetypeName = (mob as Partial<Character>).archetype?.name ?? '';
  const kind = [speciesName, archetypeName].filter(isPrintable).join(' ');
  const name = isPrintable(mob.name) ? mob.name.trim() : 'An unnamed combatant';
  return { name, kind };
}

/** The heading a band gets: its name and how many are in it. */
export function encounterGroupHeading(
  group: { name?: string; mobs: unknown[] },
  index: number,
): string {
  const name =
    group.name !== undefined && isPrintable(group.name) ? group.name.trim() : `Group ${index + 1}`;
  return `${capitalize(name)} (${group.mobs.length})`;
}

/**
 * Arrange an encounter for reading.
 *
 * The difficulty line is printed only when the generator has set one: it never does today, and a
 * "Difficulty: 0" on every sheet is the blank section 6.4 is about, wearing a number.
 */
export function encounterToDocument(encounter: PresentableEncounter): EncounterDocument {
  const paragraphs = [encounter.description].filter(isPrintable);
  if (encounter.difficulty > 0) {
    paragraphs.push(`Difficulty: ${encounter.difficulty}`);
  }
  return {
    title: encounterDisplayName(encounter),
    paragraphs,
    groups: encounter.groups.map((group, index) => ({
      heading: encounterGroupHeading(group, index),
      mobs: group.mobs.map(describeEncounterMob),
    })),
  };
}

function mobLine(mob: EncounterMobLine): string {
  return isPrintable(mob.kind) ? `${mob.name} — ${mob.kind}` : mob.name;
}

/** An encounter as Markdown, for a GM who wants it in their own notes. */
export function encounterToMarkdown(encounter: PresentableEncounter): string {
  const document = encounterToDocument(encounter);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const group of document.groups) {
    blocks.push(`## ${group.heading}`);
    if (group.mobs.length > 0) {
      blocks.push(group.mobs.map((mob) => `- ${mobLine(mob)}`).join('\n'));
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function encounterToText(encounter: PresentableEncounter): string {
  const document = encounterToDocument(encounter);
  const blocks = [...document.paragraphs];

  for (const group of document.groups) {
    blocks.push([group.heading.toUpperCase(), ...group.mobs.map(mobLine)].join('\n'));
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported encounter, reduced to something a filesystem takes. */
export function encounterFileStem(encounter: { name: string }): string {
  const stem = encounterDisplayName(encounter)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'encounter' : `encounter-${stem}`;
}

/** Whether a live encounter's mob is a character, re-exported so the page has one import. */
export { isEncounterCharacter };
