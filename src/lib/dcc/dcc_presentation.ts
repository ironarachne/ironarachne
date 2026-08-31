/**
 * A DCC character arranged for reading, and the Markdown export written from it.
 *
 * The library already renders a **character sheet** as a PDF (`render_dcc_character_pdf.ts`) — a
 * drawn form with boxes, alignment markers and rules, which is what a player wants at the table.
 * That is 6.3 satisfied for the sheet, and this module does not replace it: a document model
 * underneath a drawn form would be a worse form.
 *
 * What was missing is the other half of 6.3 — the character as *text*, for a judge's notes and a
 * funnel's four peasants in one file — and 6.4 with it: no stray blank sections. The document model
 * is where a section with neither prose nor items is dropped, once, rather than in each renderer.
 */

import {
  formatDccCurrency,
  formatDccLuckySign,
  formatDccModifier,
  formatDccSpellsKnown,
  formatDccWeaponLine,
} from './dcc_format.js';
import type { DCCAttribute, DCCCharacter } from './dcc_types.js';

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type DccCharacterSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A DCC character arranged for reading, independent of the format it is finally written in. */
export type DccCharacterDocument = {
  title: string;
  sections: DccCharacterSection[];
};

function section(heading: string, paragraphs: string[], items: string[] = []): DccCharacterSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: DccCharacterSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

function attributeLine(label: string, attribute: DCCAttribute): string {
  return `${label}: ${attribute.value} (${formatDccModifier(attribute.modifier)})`;
}

/** What the character is, in the terms the top of a DCC sheet uses. */
function identityLines(character: DCCCharacter): string[] {
  return [
    `Occupation: ${character.occupation.name}`,
    `Level: ${character.level}`,
    `Alignment: ${character.alignment}`,
    `Gender: ${character.gender}`,
    `Age: ${character.age}`,
    `Speed: ${character.speed} ft.`,
  ];
}

function combatLines(character: DCCCharacter): string[] {
  return [
    `HP: ${character.hp}`,
    `AC: ${character.armorClass}`,
    `Attack modifier: ${formatDccModifier(character.attackModifier)}`,
    `Fortitude: ${formatDccModifier(character.fortitudeSave)}`,
    `Reflex: ${formatDccModifier(character.reflexSave)}`,
    `Willpower: ${formatDccModifier(character.willpowerSave)}`,
  ];
}

/**
 * Spellcasting, which most zero-level characters have none of.
 *
 * Dropped entirely when the character cannot cast — `formatDccSpellsKnown` renders that state as
 * "No spellcasting possible", and a section saying so under a heading is the stray content 6.4 is
 * about. A peasant's sheet should be silent on spells.
 */
function spellcastingLines(character: DCCCharacter): string[] {
  if (character.spellsKnown === -9) {
    return [];
  }
  return [
    `Spells known: ${formatDccSpellsKnown(character.spellsKnown)}`,
    `Wizard max spell level: ${character.wizardMaxSpellLevel}`,
    `Cleric max spell level: ${character.clericMaxSpellLevel}`,
  ];
}

/** Arrange a character for reading. Every empty section is dropped here, once. */
export function dccCharacterToDocument(character: DCCCharacter): DccCharacterDocument {
  const sections = [
    section('At a Glance', [], identityLines(character)),
    section(
      'Attributes',
      [],
      [
        attributeLine('Strength', character.strength),
        attributeLine('Agility', character.agility),
        attributeLine('Stamina', character.stamina),
        attributeLine('Personality', character.personality),
        attributeLine('Intelligence', character.intelligence),
        attributeLine('Luck', character.luck),
      ],
    ),
    section('Combat', [], combatLines(character)),
    section('Lucky Sign', [formatDccLuckySign(character.luckyRoll)]),
    section('Spellcasting', [], spellcastingLines(character)),
    section(
      'Weapons',
      [],
      character.weapons.map((weapon) => formatDccWeaponLine(weapon, character.attackModifier)),
    ),
    section(
      'Equipment',
      [],
      character.equipment.map((item) => item.name),
    ),
    section('Money', [formatDccCurrency(character.currency)]),
    section('Languages', [], character.languages),
    section('Special Rules', [], character.specialRules),
  ];

  return {
    title: dccCharacterDisplayName(character),
    sections: sections.filter(hasContent),
  };
}

/** What to head the document with: the character's name, or what they are when they have none. */
export function dccCharacterDisplayName(character: DCCCharacter): string {
  const given = `${character.firstName} ${character.lastName}`.trim();
  if (isPrintable(given)) {
    return given;
  }
  const occupation = character.occupation.name.trim();
  return occupation === '' ? 'DCC Character' : occupation;
}

/** A DCC character as Markdown, for a judge who wants them in their own notes. */
export function dccCharacterToMarkdown(character: DCCCharacter): string {
  const document = dccCharacterToDocument(character);
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

/** A filename stem for an exported character: their name, reduced to something a filesystem takes. */
export function dccCharacterFileStem(character: DCCCharacter): string {
  const stem = dccCharacterDisplayName(character)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'dcc-character' : `dcc-${stem}`;
}
