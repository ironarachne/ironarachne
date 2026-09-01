import { describe, expect, it } from 'vitest';

import type { ArmsManufacturer } from './arms_manufacturer.js';
import {
  armsManufacturerDisplayName,
  armsManufacturerFileStem,
  armsManufacturerModelHeading,
  armsManufacturerToDocument,
  armsManufacturerToMarkdown,
  armsManufacturerToText,
} from './arms_manufacturer_presentation.js';
import { rollArmsManufacturer } from './arms_manufacturer_roll.js';

const manufacturer = rollArmsManufacturer('presentation-fixture');

const model = {
  name: 'XR-7 Laser Rifle',
  maker: '',
  damage: 'energy',
  cosmetics: [],
  effects: [],
  description: 'A rifle.',
};

describe('armsManufacturerModelHeading', () => {
  it('names the model and its damage type', () => {
    expect(armsManufacturerModelHeading(model)).toBe('XR-7 Laser Rifle (energy)');
  });

  it('leaves the damage type off when there is none', () => {
    expect(armsManufacturerModelHeading({ ...model, damage: ' ' })).toBe('XR-7 Laser Rifle');
  });

  it('says so for a model with no name, because the row is still a fact', () => {
    expect(armsManufacturerModelHeading({ ...model, name: '' })).toBe('An unnamed model (energy)');
  });
});

describe('the arms manufacturer document', () => {
  it('heads the document with the company', () => {
    expect(armsManufacturerToDocument(manufacturer).title).toBe(
      armsManufacturerDisplayName(manufacturer),
    );
  });

  it('gives every model a section of its own', () => {
    expect(armsManufacturerToDocument(manufacturer).models).toHaveLength(
      manufacturer.models.length,
    );
  });

  /** Requirement 6.4: a heading, yes; a blank line where the prose was, no. */
  it('drops an empty description without dropping the manufacturer or the model', () => {
    const stripped: ArmsManufacturer = {
      name: 'Vex',
      description: '   ',
      models: [{ ...model, description: '' }],
    };
    const document = armsManufacturerToDocument(stripped);

    expect(document.paragraphs).toEqual([]);
    expect(document.models[0].heading).toBe('XR-7 Laser Rifle (energy)');
    expect(document.models[0].paragraphs).toEqual([]);
  });
});

describe('armsManufacturerToMarkdown', () => {
  const markdown = armsManufacturerToMarkdown(manufacturer);

  it('leads with the company and heads every model', () => {
    expect(markdown.startsWith(`# ${manufacturer.name}`)).toBe(true);
    expect(markdown).toContain(manufacturer.description);
    expect(markdown).toContain('## Models');
    for (const entry of manufacturer.models) {
      expect(markdown).toContain(`### ${armsManufacturerModelHeading(entry)}`);
      expect(markdown).toContain(entry.description);
    }
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });

  /** 6.4 again: no "Models" heading over nothing. */
  it('prints no catalogue heading for a manufacturer with no models', () => {
    expect(armsManufacturerToMarkdown({ name: 'Vex', description: 'Guns.', models: [] })).toBe(
      '# Vex\n\nGuns.\n',
    );
  });
});

describe('armsManufacturerToText', () => {
  it('carries the same content as the Markdown, without the title', () => {
    const text = armsManufacturerToText(manufacturer);

    expect(text.startsWith(manufacturer.description)).toBe(true);
    expect(text).toContain('MODELS');
    for (const entry of manufacturer.models) {
      expect(text).toContain(`${armsManufacturerModelHeading(entry)}\n${entry.description}`);
    }
    expect(text).not.toContain('#');
  });

  it('prints nothing but the prose for a manufacturer with no models', () => {
    expect(armsManufacturerToText({ name: 'Vex', description: 'Guns.', models: [] })).toBe('Guns.');
  });
});

describe('armsManufacturerDisplayName', () => {
  it('is the company’s name', () => {
    expect(armsManufacturerDisplayName(manufacturer)).toBe(manufacturer.name);
  });

  it('falls back to the kind for a manufacturer with no name', () => {
    expect(armsManufacturerDisplayName({ name: ' ', description: '', models: [] })).toBe(
      'Arms Manufacturer',
    );
  });
});

describe('armsManufacturerFileStem', () => {
  it('reduces the name to something a filesystem takes', () => {
    expect(
      armsManufacturerFileStem({ name: 'Vex Arms, Limited', description: '', models: [] }),
    ).toBe('vex-arms-limited');
  });

  it('falls back for a name that reduces to nothing', () => {
    expect(armsManufacturerFileStem({ name: '!!!', description: '', models: [] })).toBe(
      'arms-manufacturer',
    );
  });
});
