/**
 * A Stars Without Number starship arranged for reading, and the Markdown and PDF exports written
 * from it.
 *
 * The tool already had an export: a `.txt` written by `starships.formatAsText`. That is 6.3 with a
 * hole in it and 6.4 failing outright — `formatAsText` prints a Fittings heading, a Weapons heading
 * and a Defenses heading whether or not anything sits under any of them, so an unarmed free
 * merchant, which is most of what the generator rolls, exports two headings over nothing. The
 * document model is where a section with nothing under it is dropped, once, rather than in each
 * renderer.
 *
 * `formatAsText` is left as it is. It is the library's own long-standing text form, tested as such,
 * and what a reader of a saved `.txt` from an older build expects to see.
 */

import type { SwnStarshipSnapshot } from './swn_starship_snapshot.js';

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type SwnStarshipSection = {
  heading: string;
  items: string[];
};

/** A ship arranged for reading, independent of the format it is finally written in. */
export type SwnStarshipDocument = {
  title: string;
  sections: SwnStarshipSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function section(heading: string, items: string[]): SwnStarshipSection {
  return { heading, items: items.filter(isPrintable) };
}

/** A whole number with thousands separators, which is how a ship's price is read out. */
export function formatSwnCredits(value: number): string {
  return `${new Intl.NumberFormat('en-US').format(Math.round(value))} credits`;
}

/** What a crew of this size costs to keep for a year, at the rulebook's 43,800 credits a head. */
export const SWN_CREW_COST_PER_YEAR = 43800;

/** One budget line: what is spent, out of what, and what is left. */
export function formatSwnBudgetLine(label: string, used: number, total: number): string {
  return `${label}: ${used}/${total} (${total - used} free)`;
}

/** The identity block — what the ship is, before any of its numbers. */
function identityLines(ship: SwnStarshipSnapshot): string[] {
  return [
    `Owner type: ${ship.ownerTypeName}`,
    `Manufacturer: ${ship.manufacturer}`,
    `Model: ${ship.className}`,
    `Hull type: ${ship.hullType.name}`,
    `Hull class: ${ship.hullType.hullClassName}`,
    `Drive: ${ship.drive.name}`,
  ];
}

function budgetLines(ship: SwnStarshipSnapshot): string[] {
  return [
    formatSwnBudgetLine('Mass', ship.usedMass, ship.hullType.mass),
    formatSwnBudgetLine('Power', ship.usedPower, ship.hullType.power),
    formatSwnBudgetLine('Hardpoints', ship.usedHardPoints, ship.hullType.hardPoints),
  ];
}

function hullLines(ship: SwnStarshipSnapshot): string[] {
  return [
    `Speed: ${ship.hullType.speed}`,
    `Armor: ${ship.hullType.armor}`,
    `AC: ${ship.hullType.ac}`,
    `HP: ${ship.hullType.hp}`,
  ];
}

function crewLines(ship: SwnStarshipSnapshot): string[] {
  return [
    `Crew: ${ship.currentCrew} (${ship.hullType.crewMinimum}–${ship.hullType.crewMaximum})`,
    `Crew skill: ${ship.hullType.crewSkill}`,
    `Crew cost: ${formatSwnCredits(ship.currentCrew * SWN_CREW_COST_PER_YEAR)} per year`,
    `Total ship value: ${formatSwnCredits(ship.totalCost)}`,
    `Cargo space: ${ship.tonsOfCargo} tons`,
  ];
}

/** A weapon as a sheet prints it: what it does, and what it does it with. */
export function formatSwnStarshipWeapon(weapon: {
  name: string;
  damage: string;
  qualities: string[];
}): string {
  const qualities = weapon.qualities.filter(isPrintable).join(', ');
  const damage = isPrintable(weapon.damage) ? weapon.damage : 'no damage listed';
  return qualities === '' ? `${weapon.name}: ${damage}` : `${weapon.name}: ${damage}, ${qualities}`;
}

/** A fitting or a defense: what it is and what it does. */
export function formatSwnStarshipFitting(row: { name: string; effect: string }): string {
  return isPrintable(row.effect) ? `${row.name}: ${row.effect}` : row.name;
}

/**
 * Arrange a ship for reading. Every empty section is dropped here, once.
 *
 * This is the whole of 6.4 for this tool: an unarmed merchant prints no Weapons heading and no
 * Defenses heading, and a hull carrying nothing but its drive prints no Fittings heading.
 */
export function swnStarshipToDocument(ship: SwnStarshipSnapshot): SwnStarshipDocument {
  const sections = [
    section('At a Glance', identityLines(ship)),
    section('Budget', budgetLines(ship)),
    section('Hull', hullLines(ship)),
    section('Crew and Cargo', crewLines(ship)),
    section('Fittings', ship.fittings.map(formatSwnStarshipFitting)),
    section('Weapons', ship.weapons.map(formatSwnStarshipWeapon)),
    section('Defenses', ship.defenses.map(formatSwnStarshipFitting)),
  ];

  return {
    title: swnStarshipDisplayName(ship),
    sections: sections.filter((entry) => entry.items.length > 0),
  };
}

/** What to head the document with: the ship's name, or what it is when it has none. */
export function swnStarshipDisplayName(ship: SwnStarshipSnapshot): string {
  if (isPrintable(ship.name)) {
    return ship.name.trim();
  }
  const what = `${ship.ownerTypeName} ${ship.hullType.name}`.trim();
  return isPrintable(what) ? what : 'SWN Starship';
}

/** A ship as Markdown, for a referee who wants it in their own notes. */
export function swnStarshipToMarkdown(ship: SwnStarshipSnapshot): string {
  const document = swnStarshipToDocument(ship);
  const blocks = [`# ${document.title}`];

  for (const entry of document.sections) {
    blocks.push(`## ${entry.heading}`);
    blocks.push(entry.items.map((item) => `- ${item}`).join('\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document without the title the PDF draws as its own heading. */
export function swnStarshipToText(ship: SwnStarshipSnapshot): string {
  const document = swnStarshipToDocument(ship);
  return document.sections
    .map((entry) => [entry.heading, ...entry.items.map((item) => `  ${item}`)].join('\n'))
    .join('\n\n');
}

/** A filename stem for an exported ship: its name, reduced to something a filesystem takes. */
export function swnStarshipFileStem(ship: SwnStarshipSnapshot): string {
  const stem = swnStarshipDisplayName(ship)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'swn-starship' : `swn-starship-${stem}`;
}
