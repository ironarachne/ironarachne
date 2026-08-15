import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { generateCulture, getDefaultCultureGenerationConfig } from './culture_generation';
import {
  cultureFileStem,
  cultureToDocument,
  cultureToMarkdown,
  cultureToPlainText,
} from './culture_presentation';
import type { Culture } from './culture_types';
import { getFantasyNameGeneratorSet } from '$lib/names';
import type { Religion } from '$lib/religion';

function sampleCulture(religionSource: 'generate' | 'reference' = 'generate'): Culture {
  const config = getDefaultCultureGenerationConfig();
  config.nameGenerators = getFantasyNameGeneratorSet('elf', new RNG('culture-presentation'));
  config.religionSource = religionSource;
  return generateCulture('culture-presentation', config);
}

const referencedReligion = {
  name: 'The Ashen Path',
  description: 'They keep the embers of the first hearth.',
  realms: [],
  pantheon: null,
} as unknown as Religion;

describe('cultureToDocument', () => {
  it('titles the document after the culture', () => {
    const culture = sampleCulture();
    expect(cultureToDocument(culture).title).toBe(`The ${culture.name} Culture`);
  });

  /** Requirement 6.4: an absent section is absent, not an empty heading with nothing under it. */
  it('drops sections with nothing in them', () => {
    const culture = { ...sampleCulture(), taboos: [], musicStyle: '   ' };
    const headings = cultureToDocument(culture).sections.map((entry) => entry.heading);

    expect(headings).not.toContain('Taboos');
    expect(headings).not.toContain('Music');
    expect(headings).toContain('Greetings');
  });

  it('includes only the name lists it was given', () => {
    const culture = sampleCulture();
    const headings = cultureToDocument(culture, {
      sampleNames: { male: ['Aelor'], town: ['Highreach'] },
    }).sections.map((entry) => entry.heading);

    expect(headings).toContain('Male Names');
    expect(headings).toContain('Town Names');
    expect(headings).not.toContain('Female Names');
  });

  it('prints a referenced religion when the caller has resolved it', () => {
    const culture = sampleCulture('reference');
    const document = cultureToDocument(culture, { religion: referencedReligion });
    const religion = document.sections.find((entry) => entry.heading === 'Religion');

    expect(religion?.paragraphs).toEqual([referencedReligion.name, referencedReligion.description]);
  });

  /**
   * A composed culture whose religion the caller did not resolve says nothing about religion,
   * rather than an empty heading or a line about a religion the library was never handed.
   */
  it('omits religion entirely when there is none to print', () => {
    const culture = sampleCulture('reference');
    const headings = cultureToDocument(culture).sections.map((entry) => entry.heading);

    expect(headings).not.toContain('Religion');
  });

  it('prints the culture’s own religion when the caller supplies no override', () => {
    const culture = sampleCulture();
    const religion = cultureToDocument(culture).sections.find(
      (entry) => entry.heading === 'Religion',
    );

    expect(religion?.paragraphs[0]).toBe(culture.religion?.name);
  });
});

describe('cultureToMarkdown', () => {
  it('writes a heading per section and a bullet per list item', () => {
    const culture = sampleCulture();
    const markdown = cultureToMarkdown(culture, { sampleNames: { male: ['Aelor', 'Baen'] } });

    expect(markdown).toContain(`# The ${culture.name} Culture`);
    expect(markdown).toContain('## Male Names');
    expect(markdown).toContain('- Aelor');
    expect(markdown).toContain('- Baen');
    expect(markdown).toContain('## Greetings');
  });

  it('leaves no blank line runs behind a dropped section', () => {
    const markdown = cultureToMarkdown({ ...sampleCulture(), taboos: [], musicStyle: '' });

    expect(markdown).not.toContain('\n\n\n');
    expect(markdown).not.toContain('## Taboos');
    expect(markdown.endsWith('\n')).toBe(true);
  });
});

describe('cultureToPlainText', () => {
  it('writes headings without markup and items without bullets', () => {
    const text = cultureToPlainText(sampleCulture(), { sampleNames: { male: ['Aelor'] } });

    expect(text).toContain('MALE NAMES');
    expect(text).toContain('Aelor');
    expect(text).not.toContain('# ');
    expect(text).not.toContain('- Aelor');
  });

  it('leaves no blank line runs behind a dropped section', () => {
    const text = cultureToPlainText({ ...sampleCulture(), taboos: [] });

    expect(text).not.toContain('\n\n\n');
    expect(text).not.toContain('TABOOS');
  });
});

describe('cultureFileStem', () => {
  it('reduces a culture name to something a filesystem takes', () => {
    expect(cultureFileStem({ ...sampleCulture(), name: 'The Ember Folk' })).toBe('the-ember-folk');
    expect(cultureFileStem({ ...sampleCulture(), name: "Ael'or — Kin" })).toBe('ael-or-kin');
  });

  it('falls back rather than producing an empty filename', () => {
    expect(cultureFileStem({ ...sampleCulture(), name: '???' })).toBe('culture');
    expect(cultureFileStem({ ...sampleCulture(), name: '' })).toBe('culture');
  });
});
