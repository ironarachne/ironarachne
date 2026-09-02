/**
 * A star nation arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export before requirement 6.3 asked for one. What a referee wants at the table
 * is the page on paper: the nation as a paragraph, its figures as a short list, and the home
 * system as a paragraph of its own. The same document is written once as Markdown and once as
 * plain text for the PDF so the two cannot drift.
 *
 * 6.4 is the reason the document model exists rather than a template string: a nation whose
 * description has been emptied prints its name without a blank paragraph, a nation that holds one
 * system prints no territory sentence, and a nation whose planet region is missing prints its
 * home system without a population it does not have.
 */

import * as Words from '@ironarachne/words';

import { getTechnologyLevelByLevel, type TechnologyLevel } from '$lib/technology_levels';

import { getFriendlyPopulation } from './civilizations';
import {
  homePlanetOf,
  homePlanetRegionOf,
  homeSystemRegionOf,
  starNationDisplayName,
} from './star_nation';
import type { StarNation } from './star_nation_types';

/** One labelled figure. */
export type StarNationFigure = {
  label: string;
  value: string;
};

/** A nation arranged for reading, independent of the format it is finally written in. */
export type StarNationDocument = {
  title: string;
  paragraphs: string[];
  figures: StarNationFigure[];
  homeSystem: {
    heading: string;
    paragraphs: string[];
  };
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** The territory sentence, for a nation that holds more than its home system. */
export function starNationTerritorySentence(nation: StarNation): string {
  if (nation.systemsControlled <= 1) {
    return '';
  }
  return `The nation controls ${nation.systemsControlled} star systems, with a total of ${nation.populatedPlanets} populated planets.`;
}

/** The table row for the nation's technology level — the page's tooltip reads its description. */
export function starNationTechnologyLevel(nation: StarNation): TechnologyLevel {
  return getTechnologyLevelByLevel(nation.civilization.technology_level);
}

/** The technology level as the page prints it: the number, and the table's name for it. */
export function starNationTechnologyLabel(nation: StarNation): string {
  return `${nation.civilization.technology_level} (${starNationTechnologyLevel(nation).name})`;
}

/** The home system's heading: the system's name, or a placeholder when it has been emptied. */
export function starNationHomeSystemHeading(nation: StarNation): string {
  const name = nation.homeSystem.name.trim();
  return name === '' ? 'The home system' : `The ${name} System`;
}

/**
 * The home system as the page describes it: how many planets are populated, which is the
 * homeworld, and how many people live there. Each sentence stands on its own so that a missing
 * part drops its sentence and nothing else.
 */
export function starNationHomeSystemParagraph(nation: StarNation): string {
  const sentences: string[] = [];
  const planet = homePlanetOf(nation);
  const region = homePlanetRegionOf(nation);
  const count = nation.homeSystemPopulatedPlanets;
  sentences.push(
    `There ${count === 1 ? 'is' : 'are'} ${count} populated ${count === 1 ? 'planet' : 'planets'} in this system.`,
  );
  if (planet !== undefined && isPrintable(planet.name)) {
    const position = nation.homePlanetIndex + 1;
    sentences.push(`${planet.name} is the ${position}${Words.getOrdinal(position)} planet.`);
  }
  if (region !== undefined) {
    sentences.push(`It has a population of ${getFriendlyPopulation(region.population)}.`);
  }
  return sentences.join(' ');
}

/** Arrange a nation for reading. */
export function starNationToDocument(nation: StarNation): StarNationDocument {
  const civilization = nation.civilization;
  const planet = homePlanetOf(nation);
  const systemRegion = homeSystemRegionOf(nation);
  const figures: StarNationFigure[] = [
    { label: 'Government', value: civilization.government_type.name },
    { label: 'Economy', value: civilization.economy_type.name },
    { label: 'Military', value: `${civilization.military.quality}` },
    { label: 'Technology', value: starNationTechnologyLabel(nation) },
    { label: 'Population', value: getFriendlyPopulation(civilization.population) },
    { label: 'Home planet', value: planet?.name ?? '' },
    {
      label: 'Home system population',
      value: systemRegion === undefined ? '' : getFriendlyPopulation(systemRegion.population),
    },
  ].filter((figure) => isPrintable(figure.value));

  return {
    title: starNationDisplayName(nation),
    paragraphs: [civilization.description, starNationTerritorySentence(nation)].filter(isPrintable),
    figures,
    homeSystem: {
      heading: starNationHomeSystemHeading(nation),
      paragraphs: [starNationHomeSystemParagraph(nation)].filter(isPrintable),
    },
  };
}

/** A nation as Markdown, for a referee who wants it in their own notes. */
export function starNationToMarkdown(nation: StarNation): string {
  const document = starNationToDocument(nation);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  if (document.figures.length > 0) {
    blocks.push(
      document.figures.map((figure) => `- **${figure.label}:** ${figure.value}`).join('\n'),
    );
  }

  blocks.push(`## ${document.homeSystem.heading}`);
  blocks.push(...document.homeSystem.paragraphs);

  return `${blocks.join('\n\n')}\n`;
}

/**
 * The body of the PDF: the same document as plain text, without the title, which the PDF draws
 * as its own heading.
 */
export function starNationToText(nation: StarNation): string {
  const document = starNationToDocument(nation);
  const blocks = [...document.paragraphs];

  if (document.figures.length > 0) {
    blocks.push(document.figures.map((figure) => `${figure.label}: ${figure.value}`).join('\n'));
  }

  blocks.push(document.homeSystem.heading.toUpperCase());
  blocks.push(...document.homeSystem.paragraphs);

  return blocks.join('\n\n');
}

/** A filename stem for an exported nation, reduced to something a filesystem takes. */
export function starNationFileStem(nation: StarNation): string {
  const stem = starNationDisplayName(nation)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'star-nation' : stem;
}
