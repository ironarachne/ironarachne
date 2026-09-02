/**
 * A star system arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no text export of any kind, which is requirement 6.3. What a referee takes to the
 * table is the bodies and their figures — the previews are pictures of them — so 2.5 rests on the
 * same document: a machine that cannot draw a single one of these still gets every number, on
 * screen and in a file.
 *
 * 6.4 has teeth in three places. A star's surface pressure and its albedo are meaningless, and a
 * planet's luminosity is always zero; each is a field an `AstronomicalBody` carries because one of
 * the two kinds of body needs it, and printing all three on every sheet is the blank section 6.4
 * is about wearing a number. The star and planet lists are dropped when empty, which an edited
 * system can be.
 *
 * The planet lines are `planetStatisticsSection`'s, reached with an empty moon list: a planet in a
 * system is the same body as a planet on its own page, and two spellings of "mass in Earths" is
 * one of them going stale.
 */

import { formatNumber } from '$lib/format';

import type { AstronomicalBody } from './astronomical_bodies.js';
import { planetStatisticsSection, type PlanetLine } from './planet_presentation.js';
import type { StarSystemSnapshot } from './star_system_snapshot.js';

/** The Sun, as a star's figures are compared against it. */
const SOLAR_RADIUS_KM = 695700;
const SOLAR_MASS_1E30_KG = 1.9891;

/** A titled list of lines; dropped entirely when it has no lines. */
export type StarSystemSection = {
  heading: string;
  lines: PlanetLine[];
};

/** A star system arranged for reading, independent of the format it is finally written in. */
export type StarSystemDocument = {
  title: string;
  paragraphs: string[];
  sections: StarSystemSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function labelled(label: string, value: string): PlanetLine {
  return { label, value };
}

/** A line as one string, which is what both exports write. */
export function starSystemLineToString(line: PlanetLine): string {
  return line.label === undefined ? line.value : `${line.label}: ${line.value}`;
}

/** What to head the document with: the system's name, or the kind when it has none. */
export function starSystemDisplayName(system: { name: string }): string {
  const name = system.name.trim();
  return name === '' ? 'Star System' : `The ${name} System`;
}

function asPercentageOf(value: number, reference: number): string {
  return `${formatNumber(Math.floor((value / reference) * 100), 0)}%`;
}

/**
 * One star's figures.
 *
 * Deliberately not `planetStatisticsSection`'s: a star's surface pressure and albedo mean nothing,
 * and what a referee wants instead is its luminosity and how it compares to the Sun.
 */
function starSection(star: AstronomicalBody, index: number): StarSystemSection {
  return {
    heading: isPrintable(star.name) ? star.name.trim() : `Star ${index + 1}`,
    lines: [
      ...(isPrintable(star.classification) ? [labelled('Type', star.classification)] : []),
      ...(isPrintable(star.description) ? [{ value: star.description }] : []),
      labelled(
        'Radius',
        `${formatNumber(Math.floor(star.radius))} km (${asPercentageOf(star.radius, SOLAR_RADIUS_KM)} of the Sun)`,
      ),
      labelled(
        'Mass',
        `${formatNumber(star.mass)} × 10^30 kg (${asPercentageOf(star.mass, SOLAR_MASS_1E30_KG)} of the Sun)`,
      ),
      labelled('Luminosity', `${formatNumber(star.luminosity)} × 10^26 W`),
      labelled('Surface temperature', `${formatNumber(star.surface_temperature, 0)} K`),
    ],
  };
}

/**
 * One planet's figures, from the planet tool's own section.
 *
 * The empty moon list is not a placeholder: `generateStarSystem` gives its planets no moons, so
 * there are none to print, and the planet page's own document would drop the section anyway.
 */
function planetSection(planet: AstronomicalBody, index: number): StarSystemSection {
  const section = planetStatisticsSection({ ...planet, moons: [] });
  return {
    heading: isPrintable(planet.name) ? planet.name.trim() : `Planet ${index + 1}`,
    lines: [
      ...(isPrintable(planet.description) ? [{ value: planet.description }] : []),
      ...section.lines,
    ],
  };
}

/** Arrange a star system for reading. */
export function starSystemToDocument(snapshot: StarSystemSnapshot): StarSystemDocument {
  return {
    title: starSystemDisplayName(snapshot),
    paragraphs: [snapshot.description].filter(isPrintable),
    sections: [...snapshot.stars.map(starSection), ...snapshot.planets.map(planetSection)].filter(
      (section) => section.lines.length > 0,
    ),
  };
}

/** A star system as Markdown, for a referee who wants it in their own notes. */
export function starSystemToMarkdown(snapshot: StarSystemSnapshot): string {
  const document = starSystemToDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(
      `## ${section.heading}`,
      section.lines.map((line) => `- ${starSystemLineToString(line)}`).join('\n'),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function starSystemToText(snapshot: StarSystemSnapshot): string {
  const document = starSystemToDocument(snapshot);
  const blocks = [...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(
      [section.heading.toUpperCase(), ...section.lines.map(starSystemLineToString)].join('\n'),
    );
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported system, reduced to something a filesystem takes. */
export function starSystemFileStem(system: { name: string }): string {
  const stem = system.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'star-system' : `star-system-${stem}`;
}
