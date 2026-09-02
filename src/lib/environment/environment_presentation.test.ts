import { describe, expect, it } from 'vitest';

import {
  addBiomeListEntry,
  removeBiomeListEntry,
  removeTerrainListEntry,
  setBiomeName,
  setClimateText,
  setEnvironmentDescription,
} from './environment_editing';
import {
  describeVector,
  elevationToFeet,
  environmentDisplayName,
  environmentFileStem,
  environmentToDocument,
  environmentToMarkdown,
  environmentToText,
} from './environment_presentation';
import { rollEnvironmentSnapshot } from './environment_roll';

const snapshot = rollEnvironmentSnapshot('presentation-seed');

describe('arranging an environment for reading', () => {
  const document = environmentToDocument(snapshot);

  it('is headed by the biome and the climate', () => {
    expect(document.title).toEqual(`${snapshot.biome.name}, ${snapshot.climate.name}`);
  });

  it('opens with the paragraphs the generator wrote', () => {
    expect(document.paragraphs).toEqual([snapshot.description, snapshot.climate.description]);
  });

  it('has a section for each of the four parts an environment is made of', () => {
    expect(document.sections.map((section) => section.heading)).toEqual([
      'Biome',
      'Climate',
      'Terrain',
      'Water',
    ]);
  });

  it('spells out what the page printed as raw numbers', () => {
    const climate = document.sections.find((section) => section.heading === 'Climate');
    // The page showed `[0.4, -0.2, 0]`; a referee needs a direction and a strength.
    expect(climate?.lines.some((line) => line.label === 'Wind')).toBe(true);
    expect(
      climate?.lines.some((line) => line.label === 'Humidity' && /^\d+%$/.test(line.value)),
    ).toBe(true);
  });

  it('lists a season under the climate', () => {
    const climate = document.sections.find((section) => section.heading === 'Climate');
    const season = snapshot.climate.seasons[0];
    expect(climate?.lines.some((line) => line.label === season.name)).toBe(true);
  });
});

describe('dropping what is empty (6.4)', () => {
  it('prints no Ecosystem section, because every ecosystem this build makes is empty', () => {
    // The reason 6.4 has teeth for this tool: a printed heading over nothing, on every sheet.
    expect(
      environmentToDocument(snapshot).sections.some((section) => section.heading === 'Ecosystem'),
    ).toBe(false);
  });

  it('prints an ecosystem once there is something in it', () => {
    const populated = {
      ...snapshot,
      ecosystems: [
        {
          name: 'Fen',
          description: 'Standing water and sedge.',
          flora: ['sedge'],
          fauna: ['crane'],
        },
      ],
    };
    const fen = environmentToDocument(populated).sections.find(
      (section) => section.heading === 'Fen',
    );
    expect(fen?.lines).toContainEqual({ label: 'Flora', value: 'sedge' });
    expect(fen?.lines).toContainEqual({ label: 'Fauna', value: 'crane' });
  });

  it('prints no blank paragraph for a description that has been emptied', () => {
    const blanked = setClimateText(setEnvironmentDescription(snapshot, '  '), 'description', '');
    expect(environmentToDocument(blanked).paragraphs).toEqual([]);
  });

  it('drops a landform list once its last entry is removed', () => {
    let stripped = snapshot;
    for (let index = snapshot.terrain.landforms.length - 1; index >= 0; index--) {
      stripped = removeTerrainListEntry(stripped, 'landforms', index);
    }
    const terrain = environmentToDocument(stripped).sections.find(
      (section) => section.heading === 'Terrain',
    );
    expect(terrain?.lines.some((line) => line.label === 'Landforms')).toBe(false);
  });

  it('does not print a biome feature the user has emptied', () => {
    const withBlank = addBiomeListEntry(snapshot, 'features');
    const biome = environmentToDocument(withBlank).sections.find(
      (section) => section.heading === 'Biome',
    );
    expect(biome?.lines.every((line) => line.value.trim() !== '')).toBe(true);
  });

  it('drops the biome type line rather than printing a bare label', () => {
    const nameless = setBiomeName(snapshot, '   ');
    const biome = environmentToDocument(nameless).sections.find(
      (section) => section.heading === 'Biome',
    );
    expect(biome?.lines.some((line) => line.label === 'Type')).toBe(false);
  });
});

describe('describing a direction', () => {
  it('gives a compass word and a strength', () => {
    expect(describeVector([1, 1])).toEqual('northwest, strength 1.41');
  });

  it('says a vector of no length is none rather than naming a direction', () => {
    expect(describeVector([0, 0, 0])).toEqual('none');
    expect(describeVector([])).toEqual('none');
  });
});

describe('reading an elevation in feet', () => {
  it('maps the -1 to 1 range onto 30,000 feet either way', () => {
    expect(elevationToFeet(1)).toEqual(30000);
    expect(elevationToFeet(-1)).toEqual(-30000);
    expect(elevationToFeet(0)).toEqual(0);
  });
});

describe('exporting an environment (6.3)', () => {
  it('writes Markdown a referee can drop into their notes', () => {
    const markdown = environmentToMarkdown(snapshot);
    expect(markdown).toContain(`# ${environmentDisplayName(snapshot)}`);
    expect(markdown).toContain('## Climate');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = environmentToText(snapshot);
    expect(text).toContain('CLIMATE');
    expect(text.startsWith(environmentDisplayName(snapshot))).toBe(false);
  });

  it('never leaves a blank line where a part had nothing to say', () => {
    const blanked = setClimateText(setEnvironmentDescription(snapshot, ''), 'description', '');
    expect(environmentToMarkdown(blanked)).not.toContain('\n\n\n');
    expect(environmentToText(blanked)).not.toContain('\n\n\n');
  });

  it('carries an edit straight into the export', () => {
    const edited = setEnvironmentDescription(snapshot, 'A cold place under a low sky.');
    expect(environmentToMarkdown(edited)).toContain('A cold place under a low sky.');
  });
});

describe('naming an environment for a file', () => {
  it('uses the biome and the climate', () => {
    expect(environmentFileStem(snapshot)).toMatch(/^environment-[a-z0-9-]+$/);
  });

  it('falls back to the bare stem when it has no name of its own', () => {
    const nameless = {
      ...snapshot,
      biome: { ...snapshot.biome, name: '' },
      climate: { ...snapshot.climate, name: '' },
    };
    expect(environmentFileStem(nameless)).toEqual('environment');
  });
});

describe('a biome description a user removed entirely', () => {
  it('is gone from the document', () => {
    const first = snapshot.biome.features[0];
    const removed = removeBiomeListEntry(snapshot, 'features', 0);
    const biome = environmentToDocument(removed).sections.find(
      (section) => section.heading === 'Biome',
    );
    expect(biome?.lines).not.toContainEqual({ value: first });
  });
});
