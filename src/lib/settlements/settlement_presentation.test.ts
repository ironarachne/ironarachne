import { describe, expect, it } from 'vitest';

import type { Religion } from '$lib/religion';

import {
  settlementFileStem,
  settlementSummaryLine,
  settlementToDocument,
  settlementToMarkdown,
  settlementToPlainText,
} from './settlement_presentation';
import { rollSettlement } from './settlement_roll';
import type { Settlement } from './settlement_types';

const EVERY_LAYER = {
  size: 'large',
  includeTrade: true,
  includeProblems: true,
  includeOrganizations: true,
  includeNotables: true,
} as const;

function enriched(): Settlement {
  return rollSettlement('greyhaven', EVERY_LAYER).settlement;
}

function plain(): Settlement {
  return rollSettlement('greyhaven').settlement;
}

const A_RELIGION = {
  name: 'The Tide-Keepers',
  description: 'They read the water and keep its calendar.',
} as unknown as Religion;

function headings(settlement: Settlement, options = {}): string[] {
  return settlementToDocument(settlement, options).sections.map((entry) => entry.heading);
}

describe('settlementSummaryLine', () => {
  it('says what kind of place it is, how many live there, and how it is doing', () => {
    const settlement = plain();
    const line = settlementSummaryLine(settlement);
    expect(line).toContain(settlement.category.name);
    expect(line).toContain(settlement.economicRole);
    expect(line).toContain(String(settlement.prosperity));
  });
});

describe('settlementToDocument', () => {
  it('gives an enriched settlement every section it has content for', () => {
    const settlement = enriched();
    const person = (settlement.importantPeople ?? [])[0]!;
    expect(headings(settlement)).toEqual(
      expect.arrayContaining([
        'Overview',
        'Facets',
        'Environment',
        'Trade',
        'Acute Problems',
        'Creeping Problems',
        'Organizations',
        `${person.roleDisplay} ${person.character.firstName} ${person.character.lastName}`,
      ]),
    );
  });

  /**
   * Requirement 6.4, and the reason this model exists at all. Enrichment is opt-in four times over,
   * so the plainest settlement the generator makes would print four bare headings if the dropping
   * were left to each renderer.
   */
  it('drops the headings an unenriched settlement has nothing under', () => {
    expect(headings(plain())).toEqual(['Overview', 'Facets', 'Environment']);
  });

  it('prints a faith only when one was supplied', () => {
    expect(headings(plain())).not.toContain('Faith');
    expect(headings(plain(), { religion: null })).not.toContain('Faith');
    expect(headings(plain(), { religion: A_RELIGION })).toContain('Faith');
  });

  it('names the settlement as the title', () => {
    const settlement = plain();
    expect(settlementToDocument(settlement).title).toBe(settlement.name);
  });

  it('never emits a section with nothing in it', () => {
    for (const entry of settlementToDocument(enriched(), { religion: A_RELIGION }).sections) {
      expect(entry.paragraphs.length + entry.items.length).toBeGreaterThan(0);
    }
  });

  it('folds a problem’s detail into its line, and omits it when there is none', () => {
    const settlement = {
      ...plain(),
      acuteProblems: [
        { kind: 'acute' as const, summary: 'The mill has stopped.', detail: 'Since midwinter.' },
        { kind: 'acute' as const, summary: 'The bridge is out.' },
      ],
    };
    const section = settlementToDocument(settlement).sections.find(
      (entry) => entry.heading === 'Acute Problems',
    );
    expect(section?.items).toEqual([
      'The mill has stopped. Since midwinter.',
      'The bridge is out.',
    ]);
  });

  it('falls back to a notable’s role id when the civic title is blank', () => {
    const settlement = enriched();
    const people = settlement.importantPeople ?? [];
    expect(people.length).toBeGreaterThan(0);
    const withoutTitle = {
      ...settlement,
      importantPeople: [{ ...people[0]!, roleDisplay: '  ' }],
    };
    expect(headings(withoutTitle)).toContain(
      `${people[0]!.roleId} ${people[0]!.character.firstName} ${people[0]!.character.lastName}`,
    );
  });
});

describe('settlementToMarkdown', () => {
  it('writes the settlement under its own name, with a heading per section', () => {
    const settlement = enriched();
    const markdown = settlementToMarkdown(settlement);
    expect(markdown.startsWith(`# ${settlement.name}\n`)).toBe(true);
    expect(markdown).toContain('## Facets');
    expect(markdown).toContain('- Law and order:');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('leaves no blank line where an absent section would have been', () => {
    expect(settlementToMarkdown(plain())).not.toMatch(/\n\n\n/);
  });

  it('includes a supplied faith', () => {
    expect(settlementToMarkdown(plain(), { religion: A_RELIGION })).toContain('The Tide-Keepers');
  });
});

describe('settlementToPlainText', () => {
  it('writes headings as plain capitals, with no Markdown punctuation to read past', () => {
    const text = settlementToPlainText(enriched());
    expect(text).toContain('FACETS');
    expect(text).not.toContain('# ');
    expect(text).not.toContain('- ');
  });

  it('leaves no blank line where an absent section would have been', () => {
    expect(settlementToPlainText(plain())).not.toMatch(/\n\n\n/);
  });
});

describe('settlementFileStem', () => {
  it.each([
    ['White Ridge', 'white-ridge'],
    ["Saint Elden's Rest", 'saint-elden-s-rest'],
    ['  Kilitia  ', 'kilitia'],
  ])('reduces %s to something a filesystem takes', (name, expected) => {
    expect(settlementFileStem({ ...plain(), name })).toBe(expected);
  });

  it('falls back rather than producing an empty filename', () => {
    expect(settlementFileStem({ ...plain(), name: '—' })).toBe('settlement');
  });
});
