/**
 * A planet arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no text export of any kind, which is requirement 6.3, and it is the one the design
 * cares most about here: the page's picture is a preview, and what a referee takes to the table is
 * the numbers and the prose. 2.5 rests on the same document — a machine that cannot draw the planet
 * still gets every figure the page prints, on screen and in a file.
 *
 * 6.4 has teeth in two places. Most planets are uninhabited and most have no moons, so a document
 * that printed those headings would print them empty on the majority of sheets; both sections are
 * dropped when there is nothing in them. `luminosity` is the third: a planet's is always zero — it
 * is a field an `AstronomicalBody` carries because a star needs it — and "Luminosity: 0" on every
 * planet ever exported is the blank section 6.4 is about, wearing a number.
 *
 * Presentation works on the **stored** shape rather than the live one: the page converts for saving
 * anyway and the editor holds a snapshot, so one model both can print is cheaper than two.
 */

import { getFriendlyPopulation, type Civilization } from '$lib/civilizations';
import { formatNumber } from '$lib/format';
import * as Measurements from '$lib/measurements';
import { getTechnologyLevelByLevel } from '$lib/technology_levels';

import { convertAUToKM, type AstronomicalBody } from './astronomical_bodies.js';
import type { PlanetSnapshot } from './planet_snapshot.js';

/** Earth, and the Moon, as the page compares against them. */
const EARTH_MASS = 5.9722;
const EARTH_RADIUS_KM = 6378;
const EARTH_GRAVITY = 9.81;
const MOON_MASS = 0.0735;
const MOON_RADIUS_KM = 1737.4;
const MOON_GRAVITY = 1.62;

/** One line of a section: a measurement with its label, or a bare sentence. */
export type PlanetLine = {
  /** Absent for a sentence that is not a measurement. */
  label?: string;
  value: string;
};

/** A titled list of lines; dropped entirely when it has no lines. */
export type PlanetSection = {
  heading: string;
  lines: PlanetLine[];
};

/** A planet arranged for reading, independent of the format it is finally written in. */
export type PlanetDocument = {
  title: string;
  paragraphs: string[];
  sections: PlanetSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function labelled(label: string, value: string): PlanetLine {
  return { label, value };
}

/** A line as one string, which is what both exports write. */
export function planetLineToString(line: PlanetLine): string {
  return line.label === undefined ? line.value : `${line.label}: ${line.value}`;
}

/** What to head the document with: the planet's name, or the kind when it has none. */
export function planetDisplayName(planet: { name: string }): string {
  const name = planet.name.trim();
  return name === '' ? 'Planet' : name.trim();
}

/** A percentage of some reference body, the way the page prints one. */
function asPercentageOf(value: number, reference: number): string {
  return `${formatNumber(Math.floor((value / reference) * 100), 0)}%`;
}

function temperatureLine(kelvin: number): string {
  return `${formatNumber(kelvin)} K (${Math.round(Measurements.kToC(kelvin))} °C, ${Math.round(Measurements.kToF(kelvin))} °F)`;
}

/**
 * The planet's own figures.
 *
 * `luminosity` is deliberately absent: a planet's is always zero, and printing it would put a
 * meaningless line on every sheet. It stays editable, because a payload carries it and a user
 * looking at the editor should see what the payload holds.
 */
export function planetStatisticsSection(snapshot: PlanetSnapshot): PlanetSection {
  return {
    heading: 'Statistics',
    lines: [
      ...(isPrintable(snapshot.classification) ? [labelled('Type', snapshot.classification)] : []),
      labelled('Distance from star', `${formatNumber(snapshot.orbital_distance)} AU`),
      labelled(
        'Mass',
        `${formatNumber(snapshot.mass)} × 10^24 kg (${asPercentageOf(snapshot.mass, EARTH_MASS)} Earth)`,
      ),
      labelled(
        'Radius',
        `${formatNumber(Math.floor(snapshot.radius))} km (${asPercentageOf(snapshot.radius, EARTH_RADIUS_KM)} Earth)`,
      ),
      labelled(
        'Gravity',
        `${formatNumber(snapshot.gravity)} m/s² (${asPercentageOf(snapshot.gravity, EARTH_GRAVITY)} Earth)`,
      ),
      labelled('Orbital period', `${formatNumber(Math.floor(snapshot.orbital_period), 0)} days`),
      labelled('Length of day', `${formatNumber(Math.floor(snapshot.rotation_period), 0)} hours`),
      labelled('Axial tilt', `${formatNumber(snapshot.axis_of_rotation, 0)}°`),
      labelled('Surface pressure', `${formatNumber(snapshot.surface_pressure)} atm`),
      labelled('Average temperature', temperatureLine(snapshot.surface_temperature)),
      labelled('Albedo', formatNumber(snapshot.albedo)),
      labelled('Atmosphere', snapshot.has_atmosphere ? 'yes' : 'none'),
      labelled('Rings', snapshot.has_ring_system ? 'yes' : 'none'),
    ],
  };
}

/** Whoever lives here, when anyone does. */
function civilizationSection(civilization: Civilization | undefined): PlanetSection[] {
  if (civilization === undefined) {
    return [];
  }
  const technology = getTechnologyLevelByLevel(civilization.technology_level);
  return [
    {
      heading: 'Civilization',
      lines: [
        ...(isPrintable(civilization.name) ? [labelled('Name', civilization.name)] : []),
        ...(isPrintable(civilization.description) ? [{ value: civilization.description }] : []),
        labelled('Population', getFriendlyPopulation(civilization.population)),
        labelled('Government', civilization.government_type.name),
        labelled('Economy', civilization.economy_type.name),
        labelled('Technology', `${technology.name} — ${technology.description}`),
      ],
    },
  ];
}

/** One moon, compared against ours the way the page compares it. */
function moonSection(moon: AstronomicalBody, index: number): PlanetSection {
  return {
    heading: isPrintable(moon.name) ? moon.name.trim() : `Moon ${index + 1}`,
    lines: [
      ...(isPrintable(moon.classification) ? [labelled('Type', moon.classification)] : []),
      ...(isPrintable(moon.description) ? [{ value: moon.description }] : []),
      labelled('Orbital distance', `${formatNumber(convertAUToKM(moon.orbital_distance))} km`),
      labelled(
        'Mass',
        `${formatNumber(moon.mass)} × 10^24 kg (${asPercentageOf(moon.mass, MOON_MASS)} of the Moon)`,
      ),
      labelled(
        'Radius',
        `${formatNumber(Math.floor(moon.radius))} km (${asPercentageOf(moon.radius, MOON_RADIUS_KM)} of the Moon)`,
      ),
      labelled(
        'Gravity',
        `${formatNumber(moon.gravity)} m/s² (${asPercentageOf(moon.gravity, MOON_GRAVITY)} of the Moon, ${asPercentageOf(moon.gravity, EARTH_GRAVITY)} Earth)`,
      ),
      labelled('Orbital period', `${formatNumber(Math.floor(moon.orbital_period), 0)} days`),
      labelled('Length of day', `${formatNumber(Math.floor(moon.rotation_period), 0)} hours`),
    ],
  };
}

/** Arrange a planet for reading. */
export function planetToDocument(snapshot: PlanetSnapshot): PlanetDocument {
  return {
    title: planetDisplayName(snapshot),
    paragraphs: [snapshot.description].filter(isPrintable),
    sections: [
      planetStatisticsSection(snapshot),
      ...civilizationSection(snapshot.civilization),
      ...snapshot.moons.map(moonSection),
    ].filter((section) => section.lines.length > 0),
  };
}

/** A planet as Markdown, for a referee who wants it in their own notes. */
export function planetToMarkdown(snapshot: PlanetSnapshot): string {
  const document = planetToDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(
      `## ${section.heading}`,
      section.lines.map((line) => `- ${planetLineToString(line)}`).join('\n'),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function planetToText(snapshot: PlanetSnapshot): string {
  const document = planetToDocument(snapshot);
  const blocks = [...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(
      [section.heading.toUpperCase(), ...section.lines.map(planetLineToString)].join('\n'),
    );
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported planet, reduced to something a filesystem takes. */
export function planetFileStem(planet: { name: string }): string {
  const stem = planetDisplayName(planet)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'planet' ? 'planet' : `planet-${stem}`;
}
