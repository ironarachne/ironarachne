/**
 * An Uncharted Worlds character arranged for reading, and the Markdown export written from it.
 *
 * The library already renders a **character sheet** as a PDF (`render_uw_character_pdf.ts`) — a
 * drawn form, which is what a player wants at the table. That is 6.3 satisfied for the sheet, and
 * this module does not replace it: a document model underneath a drawn form would be a worse form.
 *
 * What was missing is the other half of 6.3 — the character as *text* — and 6.4 with it.
 * `formatAsText` prints an Assets heading over nothing for a character whose assets were all
 * removed, and a Skills heading over nothing for one with no skills. The document model is where a
 * section with neither prose nor items is dropped, once, rather than in each renderer.
 *
 * `formatAsText` is left as it is. It is the library's own long-standing text form, tested as such,
 * and what a reader of a saved `.txt` from an older build expects to see.
 *
 * **A skill and an asset each get a heading of their own**, which is why a section carries a level:
 * a skill's description is several lines and often a list of choices, and running four of those
 * together under one heading is how the plain-text export became hard to read at the table.
 */

import type { Asset, Skill, UWCharacter } from './character.js';

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type UwCharacterSection = {
  heading: string;
  /** 2 for a part of the sheet, 3 for one skill or one asset within it. */
  level: 2 | 3;
  paragraphs: string[];
  items: string[];
};

/** A character arranged for reading, independent of the format it is finally written in. */
export type UwCharacterDocument = {
  title: string;
  sections: UwCharacterSection[];
};

function section(
  heading: string,
  level: 2 | 3,
  paragraphs: string[],
  items: string[] = [],
): UwCharacterSection {
  return {
    heading,
    level,
    paragraphs: paragraphs.filter(isPrintable),
    items: items.filter(isPrintable),
  };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: UwCharacterSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

/** A stat as the sheet prints it: signed, because a -1 and a +1 are read at a glance. */
export function formatUwStat(value: number): string {
  return value < 0 ? `${value}` : `+${value}`;
}

/** What the character is, in the terms Uncharted Worlds uses: what they have done. */
function identityLines(character: UWCharacter): string[] {
  return [
    `Careers: ${character.careers.map((career) => career.name).join(', ')}`,
    `Origin: ${character.origin.name}`,
    `Descriptors: ${character.descriptors}`,
    `Workspace: ${character.workspace.name}`,
    `Advancement: ${character.advancement}`,
  ];
}

function statLines(character: UWCharacter): string[] {
  return [
    `Physique: ${formatUwStat(character.stats.physique)}`,
    `Mettle: ${formatUwStat(character.stats.mettle)}`,
    `Expertise: ${formatUwStat(character.stats.expertise)}`,
    `Influence: ${formatUwStat(character.stats.influence)}`,
    `Interface: ${formatUwStat(character.stats.interface)}`,
  ];
}

/** A skill's own prose, as the lines it was written in. */
function skillSection(skill: Skill): UwCharacterSection {
  return section(
    skill.name,
    3,
    skill.description.split('\n').map((line) => line.trim()),
  );
}

/**
 * One asset: what it is, and the upgrades bolted to it.
 *
 * The workspace is printed with the assets on the character's own sheet, and it is printed in the
 * glance block here instead — it has a name and a line of description, not upgrades, and a heading
 * with one line under it in a list of things that have several reads as a mistake.
 */
function assetSection(asset: Asset): UwCharacterSection {
  return section(
    asset.name,
    3,
    [asset.description],
    asset.upgrades.map((upgrade) => `${upgrade.name}: ${upgrade.description}`),
  );
}

/**
 * Arrange a character for reading.
 *
 * The three summary sections are dropped when they are empty, which is 6.4. The two group headings
 * — Skills and Assets — are printed only when something is under them, which is the same rule
 * stated for a heading that has children rather than lines. A skill with no description still
 * prints its name: the name is the fact, and the prose is the gloss.
 */
export function uwCharacterToDocument(character: UWCharacter): UwCharacterDocument {
  const summary = [
    section('At a Glance', 2, [], identityLines(character)),
    section('Statistics', 2, [], statLines(character)),
    section('Workspace', 2, [character.workspace.description]),
  ].filter(hasContent);

  const skills = character.skills.map(skillSection);
  const assets = character.assets.map(assetSection);

  return {
    title: uwCharacterDisplayName(character),
    sections: [
      ...summary,
      ...(skills.length > 0 ? [section('Skills', 2, [], []), ...skills] : []),
      ...(assets.length > 0 ? [section('Assets', 2, [], []), ...assets] : []),
    ],
  };
}

/** What to head the document with: the character's name, or what they have done. */
export function uwCharacterDisplayName(character: UWCharacter): string {
  const given = `${character.firstName} ${character.lastName}`.trim();
  if (isPrintable(given)) {
    return given;
  }
  const careers = character.careers
    .map((career) => career.name.trim())
    .filter((name) => isPrintable(name));
  return careers.length === 0 ? 'Uncharted Worlds Character' : careers.join(' and ');
}

/** A character as Markdown, for a player who wants them in their own notes. */
export function uwCharacterToMarkdown(character: UWCharacter): string {
  const document = uwCharacterToDocument(character);
  const blocks = [`# ${document.title}`];

  for (const entry of document.sections) {
    blocks.push(`${'#'.repeat(entry.level)} ${entry.heading}`);
    blocks.push(...entry.paragraphs);
    if (entry.items.length > 0) {
      blocks.push(entry.items.map((item) => `- ${item}`).join('\n'));
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/** A filename stem for an exported character: their name, reduced to something a filesystem takes. */
export function uwCharacterFileStem(character: UWCharacter): string {
  const stem = uwCharacterDisplayName(character)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'uw-character' : `uw-${stem}`;
}
