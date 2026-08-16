import { describe, expect, it } from 'vitest';

import { divineRulerTitle } from './religion_generation';
import {
  deityTitleLine,
  religionFileStem,
  religionToDocument,
  religionToMarkdown,
  religionToPlainText,
} from './religion_presentation';
import { rollReligionSnapshot } from './religion_roll';
import type { Deity } from './deities';
import type { Religion } from './religion_types';

const withGods = rollReligionSnapshot('presentation-pantheon', {
  selectedCategories: ['polytheism'],
}).religion;

const withoutGods = rollReligionSnapshot('presentation-animism', {
  selectedCategories: ['animism'],
}).religion;

function headings(religion: Religion): string[] {
  return religionToDocument(religion).sections.map((entry) => entry.heading);
}

describe('religionToDocument', () => {
  it('leads with the religion, its overview, its realms and its gods', () => {
    const document = religionToDocument(withGods);

    expect(document.title).toBe(withGods.name);
    expect(document.sections[0].heading).toBe('Overview');
    expect(headings(withGods)).toContain('Realms');
    expect(headings(withGods)).toContain('Deities');
  });

  it('gives every deity a section of their own', () => {
    const names = withGods.pantheon?.members.map((member) => member.name) ?? [];

    expect(headings(withGods)).toEqual(expect.arrayContaining(names));
  });

  it('prints a tradition instead of a pantheon when there are no gods', () => {
    expect(headings(withoutGods)).toContain('Tradition');
    expect(headings(withoutGods)).not.toContain('Deities');
  });

  /** Requirement 6.4: an absent section is absent, not an empty heading. */
  it('drops sections with nothing under them', () => {
    const bare: Religion = { name: 'The Quiet', description: '', realms: [], pantheon: null };

    expect(religionToDocument(bare).sections).toEqual([]);
  });

  it('leaves out the holy item line for a god who has none', () => {
    const pantheon = withGods.pantheon;
    expect(pantheon).not.toBeNull();
    const barehanded: Religion = {
      ...withGods,
      pantheon: {
        ...pantheon!,
        members: [{ ...pantheon!.members[0], holyItem: null, holySymbol: null }],
      },
    };
    const deity = religionToDocument(barehanded).sections.find(
      (entry) => entry.heading === barehanded.pantheon?.members[0].name,
    );

    expect(deity?.paragraphs.some((line) => line.startsWith('Holy'))).toBe(false);
  });
});

describe('deityTitleLine', () => {
  it('writes a title in the deity’s own gender, not as an object', () => {
    const goddess = {
      gender: { name: 'female' },
      titles: [divineRulerTitle],
    } as unknown as Deity;

    expect(deityTitleLine(goddess)).toBe('Queen of the Gods');
  });

  it('is empty for a deity with no titles at all', () => {
    expect(deityTitleLine({ gender: { name: 'male' } } as unknown as Deity)).toBe('');
  });
});

describe('religionToMarkdown', () => {
  it('writes headings and lists a reader can paste into their notes', () => {
    const markdown = religionToMarkdown(withGods);

    expect(markdown.startsWith(`# ${withGods.name}\n`)).toBe(true);
    expect(markdown).toContain('## Realms');
    expect(markdown).toContain(`- ${withGods.realms[0].name}: `);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('has no blank section left where an absent one would have been', () => {
    expect(religionToMarkdown(withoutGods)).not.toMatch(/\n\n\n/);
  });
});

describe('religionToPlainText', () => {
  it('writes headings without Markdown punctuation', () => {
    const text = religionToPlainText(withGods);

    expect(text).toContain('REALMS');
    expect(text).not.toContain('# ');
    expect(text).not.toMatch(/^- /m);
  });
});

describe('religionFileStem', () => {
  it('reduces a name to something a filesystem takes', () => {
    expect(religionFileStem({ ...withGods, name: 'The Ashen Path' })).toBe('the-ashen-path');
    expect(religionFileStem({ ...withGods, name: "Vethra's Own!" })).toBe('vethra-s-own');
  });

  it('falls back rather than producing an empty filename', () => {
    expect(religionFileStem({ ...withGods, name: '???' })).toBe('religion');
  });
});
