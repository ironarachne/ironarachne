/**
 * A Stars Without Number character arranged for reading, and the Markdown export written from it.
 *
 * The library already renders a **character sheet** as a PDF (`render_swn_character_pdf.ts`) — a
 * drawn form with boxes and rules, which is what a player wants at the table. That is 6.3 satisfied
 * for the sheet, and this module does not replace it: a document model underneath a drawn form
 * would be a worse form.
 *
 * What was missing is the other half of 6.3 — the character as *text*, for a referee's notes — and
 * 6.4 with it. `formatAsText` prints every heading it knows about whether or not anything sits
 * under it, so an unarmoured character with an empty pack gets an Armor heading and an Equipment
 * heading with nothing beneath either. The document model is where a section with neither prose nor
 * items is dropped, once, rather than in each renderer.
 *
 * `formatAsText` is left as it is. It is the library's own long-standing text form, tested as such,
 * and what a reader of a saved `.txt` from an older build expects to see.
 */

import type { Focus, SWNCharacter, Skill, Stat, Weapon } from './character.js';

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type SwnCharacterSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A SWN character arranged for reading, independent of the format it is finally written in. */
export type SwnCharacterDocument = {
  title: string;
  sections: SwnCharacterSection[];
};

function section(heading: string, paragraphs: string[], items: string[] = []): SwnCharacterSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: SwnCharacterSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

/** A signed number, as a sheet prints a modifier. */
export function formatSwnModifier(value: number): string {
  return value < 0 ? `${value}` : `+${value}`;
}

export function formatSwnStat(stat: Stat): string {
  return `${stat.abbreviation} ${stat.score} (${formatSwnModifier(stat.modifier)})`;
}

export function formatSwnSkill(skill: Skill): string {
  return `${skill.name}-${skill.level}`;
}

export function formatSwnFocus(focus: Focus): string {
  return `${focus.name}, level ${focus.currentLevel}`;
}

export function formatSwnWeaponLine(weapon: Weapon, attackBonus: number): string {
  return `${weapon.name}: ${weapon.damage} damage, ${formatSwnModifier(attackBonus)} to hit, ${weapon.range} range`;
}

/** What the character is, in the terms the top of a SWN sheet uses. */
function identityLines(character: SWNCharacter): string[] {
  return [
    `Background: ${character.background.name}`,
    `Class: ${character.characterClass.name}`,
    `Level: ${character.currentLevel}`,
    `Hit points: ${character.hitPoints}`,
    `Armor class: ${character.armorClassEquipped}`,
    `Credits: ${character.credits}`,
  ];
}

function combatLines(character: SWNCharacter): string[] {
  return [
    `Attack bonus: ${formatSwnModifier(character.attackBonus)}`,
    `Melee: ${formatSwnModifier(character.meleeAttackBonus)}`,
    `Ranged: ${formatSwnModifier(character.rangedAttackBonus)}`,
    `Evasion: ${character.savingThrowEvasion}`,
    `Mental: ${character.savingThrowMental}`,
    `Physical: ${character.savingThrowPhysical}`,
  ];
}

/**
 * Psychic training, which most characters have none of.
 *
 * Dropped entirely for a character with no discipline, rather than printed as a heading over
 * nothing: that is the stray content 6.4 is about. Effort belongs here rather than in the block at
 * the top for the same reason — a character with no Effort has nothing to say about it.
 */
function psychicLines(character: SWNCharacter): string[] {
  if (character.psychicPicks.length === 0) {
    return [];
  }
  return [
    `Effort: ${character.effort}`,
    ...character.psychicPicks.map((pick) =>
      isPrintable(pick.abilityName)
        ? `${pick.disciplineName}-${pick.level}: ${pick.abilityName}`
        : `${pick.disciplineName}-${pick.level}`,
    ),
  ];
}

/** Arrange a character for reading. Every empty section is dropped here, once. */
export function swnCharacterToDocument(character: SWNCharacter): SwnCharacterDocument {
  const sections = [
    section('At a Glance', [], identityLines(character)),
    section('Stats', [], character.stats.map(formatSwnStat)),
    section('Combat', [], combatLines(character)),
    section('Skills', [], character.skills.map(formatSwnSkill)),
    section('Foci', [], character.focuses.map(formatSwnFocus)),
    section('Psychic Training', [], psychicLines(character)),
    section(
      'Abilities',
      [],
      character.abilities.map((ability) => ability.description),
    ),
    section(
      'Weapons',
      [],
      [
        ...character.rangedWeapons.map((weapon) =>
          formatSwnWeaponLine(weapon, character.rangedAttackBonus),
        ),
        ...character.meleeWeapons.map((weapon) =>
          formatSwnWeaponLine(weapon, character.meleeAttackBonus),
        ),
      ],
    ),
    section(
      'Armor',
      [],
      character.armor.map((item) => `${item.name}: AC ${item.ac}`),
    ),
    section(
      'Equipment',
      [],
      character.equipment.map((item) => item.name),
    ),
  ];

  return {
    title: swnCharacterDisplayName(character),
    sections: sections.filter(hasContent),
  };
}

/** What to head the document with: the character's name, or what they are when they have none. */
export function swnCharacterDisplayName(character: SWNCharacter): string {
  const given = `${character.firstName} ${character.lastName}`.trim();
  if (isPrintable(given)) {
    return given;
  }
  const what = `${character.background.name} ${character.characterClass.name}`.trim();
  return isPrintable(what) ? what : 'SWN Character';
}

/** A SWN character as Markdown, for a referee who wants them in their own notes. */
export function swnCharacterToMarkdown(character: SWNCharacter): string {
  const document = swnCharacterToDocument(character);
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
export function swnCharacterFileStem(character: SWNCharacter): string {
  const stem = swnCharacterDisplayName(character)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'swn-character' : `swn-${stem}`;
}
