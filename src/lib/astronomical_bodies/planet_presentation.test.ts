import { describe, expect, it } from 'vitest';

import { removeCivilization, removeMoon, setPlanetText } from './planet_editing';
import {
  planetDisplayName,
  planetFileStem,
  planetLineToString,
  planetStatisticsSection,
  planetToDocument,
  planetToMarkdown,
  planetToText,
} from './planet_presentation';
import { rollPlanet } from './planet_roll';
import { toPlanetSnapshot, type PlanetSnapshot } from './planet_snapshot';

function inhabitedSnapshot(): PlanetSnapshot {
  for (let index = 0; index < 60; index++) {
    const roll = rollPlanet(`presentation-${index}`);
    if (roll.civilization !== undefined && roll.moons.length > 0) {
      return toPlanetSnapshot(roll);
    }
  }
  throw new Error('no seed in range produced an inhabited planet with moons');
}

const snapshot = inhabitedSnapshot();

describe('arranging a planet for reading', () => {
  const document = planetToDocument(snapshot);

  it('is headed by the planet and opens with its description', () => {
    expect(document.title).toEqual(snapshot.name);
    expect(document.paragraphs).toEqual([snapshot.description]);
  });

  it('leads with the statistics, then the civilization, then the moons', () => {
    expect(document.sections[0].heading).toEqual('Statistics');
    expect(document.sections[1].heading).toEqual('Civilization');
    expect(document.sections.length).toEqual(2 + snapshot.moons.length);
  });

  it('prints the figures with their units and their Earth comparisons', () => {
    const stats = planetStatisticsSection(snapshot);
    expect(stats.lines.find((line) => line.label === 'Gravity')?.value).toMatch(
      /m\/s² \(\d+% Earth\)/,
    );
    expect(stats.lines.find((line) => line.label === 'Average temperature')?.value).toMatch(
      /K \(-?\d+ °C, -?\d+ °F\)/,
    );
  });

  it('says whether the planet has an atmosphere and rings', () => {
    const stats = planetStatisticsSection(snapshot);
    expect(stats.lines.some((line) => line.label === 'Atmosphere')).toBe(true);
    expect(stats.lines.some((line) => line.label === 'Rings')).toBe(true);
  });

  it('never prints a planet luminosity, because a planet has none', () => {
    // A field an AstronomicalBody carries because a star needs it. "Luminosity: 0" on every planet
    // ever exported is the blank section 6.4 is about, wearing a number.
    expect(snapshot.luminosity).toEqual(0);
    expect(
      planetStatisticsSection(snapshot).lines.some((line) => line.label === 'Luminosity'),
    ).toBe(false);
  });
});

describe('dropping what is empty (6.4)', () => {
  it('prints no Civilization section for an uninhabited planet', () => {
    // Most planets are uninhabited, so this heading would be empty on the majority of sheets.
    const empty = removeCivilization(snapshot);
    expect(
      planetToDocument(empty).sections.some((section) => section.heading === 'Civilization'),
    ).toBe(false);
  });

  it('prints no moon sections once the last moon is removed', () => {
    let stripped = snapshot;
    for (let index = snapshot.moons.length - 1; index >= 0; index--) {
      stripped = removeMoon(stripped, index);
    }
    expect(planetToDocument(stripped).sections.map((section) => section.heading)).toEqual([
      'Statistics',
      'Civilization',
    ]);
  });

  it('prints no blank paragraph for a description that has been emptied', () => {
    expect(planetToDocument(setPlanetText(snapshot, 'description', '  ')).paragraphs).toEqual([]);
  });

  it('drops the type line rather than printing a bare label', () => {
    const untyped = setPlanetText(snapshot, 'classification', '');
    expect(planetStatisticsSection(untyped).lines.some((line) => line.label === 'Type')).toBe(
      false,
    );
  });

  it('names a moon that has been left nameless', () => {
    const nameless = { ...snapshot, moons: [{ ...snapshot.moons[0], name: '  ' }] };
    expect(planetToDocument(nameless).sections.at(-1)?.heading).toEqual('Moon 1');
  });
});

describe('writing a line', () => {
  it('joins a label to its value, and leaves a bare sentence alone', () => {
    expect(planetLineToString({ label: 'Mass', value: '5' })).toEqual('Mass: 5');
    expect(planetLineToString({ value: 'A cold place.' })).toEqual('A cold place.');
  });
});

describe('exporting a planet (6.3)', () => {
  it('writes Markdown a referee can drop into their notes', () => {
    const markdown = planetToMarkdown(snapshot);
    expect(markdown).toContain(`# ${snapshot.name}`);
    expect(markdown).toContain('## Statistics');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = planetToText(snapshot);
    expect(text).toContain('STATISTICS');
    expect(text.startsWith(snapshot.name)).toBe(false);
  });

  it('never leaves a blank line where a part had nothing to say', () => {
    const bare = removeCivilization(setPlanetText(snapshot, 'description', ''));
    expect(planetToMarkdown(bare)).not.toContain('\n\n\n');
    expect(planetToText(bare)).not.toContain('\n\n\n');
  });

  it('carries an edit straight into the export', () => {
    expect(planetToMarkdown(setPlanetText(snapshot, 'name', 'Kesh'))).toContain('# Kesh');
  });
});

describe('naming a planet for a file', () => {
  it('uses the planet name', () => {
    expect(planetDisplayName(snapshot)).toEqual(snapshot.name);
    expect(planetFileStem({ name: 'Kesh Prime' })).toEqual('planet-kesh-prime');
  });

  it('falls back to the bare stem for a planet with no name', () => {
    expect(planetDisplayName({ name: '  ' })).toEqual('Planet');
    expect(planetFileStem({ name: '' })).toEqual('planet');
  });

  it('reduces punctuation a filesystem would not take', () => {
    expect(planetFileStem({ name: '!!Kesh IV!!' })).toEqual('planet-kesh-iv');
  });
});
