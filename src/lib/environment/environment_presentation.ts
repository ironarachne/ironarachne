/**
 * An environment arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export of any kind, which is requirement 6.3, and the page it exports from was
 * a debugging readout: raw floats for elevation and humidity, a bare `[0.4, -0.2, 0]` for the wind.
 * The document is what a referee would actually read at the table — the paragraph the generator
 * already writes, then the biome, climate, terrain and water as labelled lines with their units
 * and their compass directions spelled out.
 *
 * 6.4 has teeth here for one reason above all: **`Ecosystems.generate` is a stub**. Every
 * environment on the site carries one nameless ecosystem with no flora and no fauna, so a document
 * that printed an Ecosystem section would print an empty heading on every sheet ever exported. It
 * is dropped when there is nothing in it, along with every other empty list and blank paragraph.
 *
 * Presentation works on the **stored** shape rather than the live one: the page converts for saving
 * anyway and the editor holds a snapshot, so one model both can print is cheaper than two, and the
 * only field the live shape adds is `dominantEcosystem`, which is `ecosystems[0]`.
 */

import { Directions } from '$lib/geometry';
import * as Temperature from '$lib/temperature';

import type { EnvironmentSnapshot } from './environment_snapshot.js';

/**
 * One line of a section: a measurement with its label, or a bare sentence.
 *
 * Structured rather than a pre-joined `"Label: value"` string because two readers need it in two
 * shapes — the page draws a labelled line as a `Stat` and a bare one as a paragraph, and the
 * exports join them — and splitting a joined string back apart in the component is how a biome
 * feature containing a colon ends up mislabelled.
 */
export type EnvironmentLine = {
  /** Absent for a sentence that is not a measurement, such as a biome feature. */
  label?: string;
  value: string;
};

/** A titled list of lines; dropped entirely when it has no lines. */
export type EnvironmentSection = {
  heading: string;
  lines: EnvironmentLine[];
};

/** An environment arranged for reading, independent of the format it is finally written in. */
export type EnvironmentDocument = {
  title: string;
  paragraphs: string[];
  sections: EnvironmentSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** A 0–1 measure as a percentage, which is how a person reads humidity or cloud cover. */
function asPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** A −1..1 elevation in feet, the way the generator page has always shown it. */
export function elevationToFeet(elevation: number): number {
  return Math.floor(elevation * 30000);
}

function asElevation(value: number): string {
  return `${value.toFixed(2)} (${elevationToFeet(value).toLocaleString('en-US')} ft)`;
}

/**
 * A direction vector as a compass word and a magnitude.
 *
 * The page printed the raw array. "north-north-east, strength 0.42" is the same information in the
 * form a referee can use, and a vector of no length reads as still rather than as a direction.
 */
export function describeVector(vector: number[]): string {
  const [x = 0, y = 0] = vector;
  const magnitude = Math.hypot(x, y);
  if (magnitude === 0) {
    return 'none';
  }
  return `${Directions.getWordForVector(vector)}, strength ${magnitude.toFixed(2)}`;
}

/** What to head the document with, and what the vault calls a saved environment. */
export function environmentDisplayName(snapshot: EnvironmentSnapshot): string {
  const parts = [snapshot.biome.name, snapshot.climate.name]
    .map((part) => part.trim())
    .filter(isPrintable);
  return parts.length === 0 ? 'Environment' : parts.join(', ');
}

function labelled(label: string, value: string): EnvironmentLine {
  return { label, value };
}

/** A line as one string, which is what both exports write. */
export function environmentLineToString(line: EnvironmentLine): string {
  return line.label === undefined ? line.value : `${line.label}: ${line.value}`;
}

function biomeSection(snapshot: EnvironmentSnapshot): EnvironmentSection {
  const { biome } = snapshot;
  return {
    heading: 'Biome',
    lines: [
      ...(isPrintable(biome.name) ? [labelled('Type', biome.name)] : []),
      labelled('Temperature', Temperature.getComparativeString(biome.temperature, 'celsius')),
      labelled('Altitude', asElevation(biome.altitude)),
      labelled('Humidity', asPercentage(biome.humidity)),
      labelled('Water', biome.isAquatic ? 'aquatic' : 'dry land'),
      ...biome.features.filter(isPrintable).map((feature) => ({ value: feature })),
    ],
  };
}

function climateSection(snapshot: EnvironmentSnapshot): EnvironmentSection {
  const { climate } = snapshot;
  return {
    heading: 'Climate',
    lines: [
      ...(isPrintable(climate.name) ? [labelled('Type', climate.name)] : []),
      labelled(
        'Temperature',
        `${Temperature.getComparativeString(climate.temperatureMin, 'celsius')} to ${Temperature.getComparativeString(climate.temperatureMax, 'celsius')}`,
      ),
      labelled('Humidity', asPercentage(climate.humidity)),
      labelled('Cloud cover', asPercentage(climate.cloudCover)),
      labelled('Wind', describeVector(climate.wind)),
      labelled(
        'Precipitation',
        `${asPercentage(climate.precipitationAmount)} amount, ${asPercentage(climate.precipitationFrequency)} of the time`,
      ),
      ...climate.seasons
        .filter((season) => isPrintable(season.name))
        .map((season) =>
          labelled(
            season.name,
            `${season.temperatureAdjustment >= 0 ? '+' : ''}${season.temperatureAdjustment}°C, humidity ${season.humidityAdjustment >= 0 ? '+' : ''}${season.humidityAdjustment}`,
          ),
        ),
    ],
  };
}

function terrainSection(snapshot: EnvironmentSnapshot): EnvironmentSection {
  const { terrain } = snapshot;
  const geology = [...terrain.geologicalMakeup.soilTypes, ...terrain.geologicalMakeup.rockTypes]
    .filter(isPrintable)
    .join(', ');
  return {
    heading: 'Terrain',
    lines: [
      labelled(
        'Elevation',
        `${asElevation(terrain.elevationMin)} to ${asElevation(terrain.elevationMax)}`,
      ),
      labelled('Relief', terrain.reliefEnergy.toFixed(2)),
      labelled('Slope', describeVector(terrain.normalVector)),
      ...(terrain.landforms.filter(isPrintable).length > 0
        ? [labelled('Landforms', terrain.landforms.filter(isPrintable).join(', '))]
        : []),
      ...(isPrintable(geology) ? [labelled('Geology', geology)] : []),
    ],
  };
}

function waterSection(snapshot: EnvironmentSnapshot): EnvironmentSection {
  const water = snapshot.waterSystem;
  return {
    heading: 'Water',
    lines: [
      ...(isPrintable(water.waterType) ? [labelled('Type', water.waterType)] : []),
      labelled('Surface level', asElevation(water.surfaceLevel)),
      labelled('Temperature', Temperature.getComparativeString(water.temperature, 'celsius')),
      labelled('Current', describeVector(water.current)),
    ],
  };
}

/**
 * The living communities, when there are any.
 *
 * There never are today. `Ecosystems.generate` returns a nameless ecosystem with no flora and no
 * fauna, so this yields nothing and the section does not appear — which is 6.4 rather than a
 * missing feature, and the section will fill itself in the day the sub-generator is written.
 */
function ecosystemSections(snapshot: EnvironmentSnapshot): EnvironmentSection[] {
  return snapshot.ecosystems
    .map((ecosystem) => ({
      heading: isPrintable(ecosystem.name) ? ecosystem.name.trim() : 'Ecosystem',
      lines: [
        ...(isPrintable(ecosystem.description) ? [{ value: ecosystem.description.trim() }] : []),
        ...(ecosystem.flora.filter(isPrintable).length > 0
          ? [labelled('Flora', ecosystem.flora.filter(isPrintable).join(', '))]
          : []),
        ...(ecosystem.fauna.filter(isPrintable).length > 0
          ? [labelled('Fauna', ecosystem.fauna.filter(isPrintable).join(', '))]
          : []),
      ],
    }))
    .filter((section) => section.lines.length > 0);
}

/** Arrange an environment for reading. */
export function environmentToDocument(snapshot: EnvironmentSnapshot): EnvironmentDocument {
  return {
    title: environmentDisplayName(snapshot),
    paragraphs: [snapshot.description, snapshot.climate.description].filter(isPrintable),
    sections: [
      biomeSection(snapshot),
      climateSection(snapshot),
      terrainSection(snapshot),
      waterSection(snapshot),
      ...ecosystemSections(snapshot),
    ].filter((section) => section.lines.length > 0),
  };
}

/** An environment as Markdown, for a referee who wants it in their own notes. */
export function environmentToMarkdown(snapshot: EnvironmentSnapshot): string {
  const document = environmentToDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(
      `## ${section.heading}`,
      section.lines.map((line) => `- ${environmentLineToString(line)}`).join('\n'),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function environmentToText(snapshot: EnvironmentSnapshot): string {
  const document = environmentToDocument(snapshot);
  const blocks = [...document.paragraphs];

  for (const section of document.sections) {
    blocks.push(
      [section.heading.toUpperCase(), ...section.lines.map(environmentLineToString)].join('\n'),
    );
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported environment, reduced to something a filesystem takes. */
export function environmentFileStem(snapshot: EnvironmentSnapshot): string {
  const stem = environmentDisplayName(snapshot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'environment' ? 'environment' : `environment-${stem}`;
}
