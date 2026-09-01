import { describe, expect, it } from 'vitest';

import {
  familyDisplayName,
  familyFileStem,
  familyGenderSymbol,
  familyMemberName,
  familyMemberSpeciesName,
  familyMemberSummary,
  familyToDocument,
  familyToMarkdown,
  familyToText,
  type PresentableFamily,
} from './family_presentation.js';
import { familyChildrenOf, familyMateOf, familyParentsOf } from './family_relations.js';
import { rollFamily, rollFamilySnapshot } from './family_roll.js';

const live = rollFamily('presentation-live', { speciesName: 'human', generations: 3 }).family;
const stored = rollFamilySnapshot('presentation-stored', { speciesName: 'elf', generations: 2 });

const bare: PresentableFamily = { name: 'Ashford', members: [], relationships: [] };

describe('familyMemberSpeciesName', () => {
  it('reads the live shape and the stored shape alike', () => {
    expect(familyMemberSpeciesName(live.members[0])).toBe('human');
    expect(familyMemberSpeciesName(stored.members[0])).toBe('elf');
  });
});

describe('familyMemberSummary', () => {
  it('reads age, species and life stage, and says when someone has died', () => {
    const member = { ...stored.members[0], age: 42, tags: ['dead'] };
    const summary = familyMemberSummary(member);

    expect(summary.startsWith('42-year-old elf ')).toBe(true);
    expect(summary.endsWith(' (dead)')).toBe(true);
    expect(familyMemberSummary({ ...member, tags: [] })).not.toContain('(dead)');
  });
});

describe('familyMemberName', () => {
  it('joins the two names, and stands in for a member with neither', () => {
    expect(familyMemberName({ firstName: 'Tam', lastName: 'Ashford' })).toBe('Tam Ashford');
    expect(familyMemberName({ firstName: ' ', lastName: '' })).toBe('An unnamed member');
  });
});

describe('familyGenderSymbol', () => {
  it('is the symbol the page has always printed', () => {
    expect(familyGenderSymbol('male')).toBe('♂');
    expect(familyGenderSymbol('female')).toBe('♀');
    expect(familyGenderSymbol('other')).toBe('⚥');
  });
});

describe('the family document', () => {
  const document = familyToDocument(live);

  it('heads the document with the house and gives every member a section', () => {
    expect(document.title).toBe(familyDisplayName(live));
    expect(document.members).toHaveLength(live.members.length);
  });

  it('prints each member’s relations from the same edges the page reads', () => {
    for (const [index, member] of live.members.entries()) {
      const section = document.members[index];
      const mate = familyMateOf(live, member);
      const children = familyChildrenOf(live, member);
      const parents = familyParentsOf(live, member);

      expect(section.relations.some((line) => line.startsWith('Mate: '))).toBe(mate !== undefined);
      expect(section.relations.some((line) => line.startsWith('Children: '))).toBe(
        children.length > 0,
      );
      expect(section.relations.some((line) => line.startsWith('Parents: '))).toBe(
        parents.length > 0,
      );
    }
  });

  it('has at least one member with a mate and one with children, so the above meant something', () => {
    expect(document.members.some((m) => m.relations.some((l) => l.startsWith('Mate: ')))).toBe(
      true,
    );
    expect(document.members.some((m) => m.relations.some((l) => l.startsWith('Children: ')))).toBe(
      true,
    );
  });

  /** Requirement 6.4: no blank paragraph where the prose was. */
  it('drops an emptied description without dropping the member', () => {
    const stripped = { ...live, members: [{ ...live.members[0], description: '  ' }] };
    const section = familyToDocument(stripped).members[0];

    expect(section.paragraphs).toEqual([]);
    expect(section.summary).not.toBe('');
  });

  it('marks adopted and illegitimate children', () => {
    const parent = live.members[0];
    const child = { ...live.members[1], id: 'child', tags: ['adopted'] };
    const family: PresentableFamily = {
      name: 'x',
      members: [parent, child],
      relationships: [
        {
          originatorId: parent.id,
          recipientId: 'child',
          type: { name: 'parent' },
        },
      ],
    };

    expect(familyToDocument(family).members[0].relations[0]).toMatch(/^Children: .* \(adopted\)$/);
  });
});

describe('familyToMarkdown', () => {
  const markdown = familyToMarkdown(live);

  it('leads with the house and heads every member', () => {
    expect(markdown.startsWith(`# ${familyDisplayName(live)}`)).toBe(true);
    for (const member of live.members) {
      expect(markdown).toContain(`## ${familyMemberName(member)} `);
    }
    expect(markdown).toContain('- Mate: ');
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('prints a heading and nothing else for a family with nobody in it', () => {
    expect(familyToMarkdown(bare)).toBe('# The Ashford Family\n');
  });
});

describe('familyToText', () => {
  it('carries the same content as the Markdown, without the title', () => {
    const text = familyToText(live);

    expect(text.startsWith('#')).toBe(false);
    expect(text).toContain(familyMemberName(live.members[0]).toUpperCase());
    expect(text).toContain('Mate: ');
  });

  it('prints nothing for a family with nobody in it', () => {
    expect(familyToText(bare)).toBe('');
  });
});

describe('familyDisplayName', () => {
  it('reads the way the page heads it', () => {
    expect(familyDisplayName({ name: 'Ashford' })).toBe('The Ashford Family');
    expect(familyDisplayName({ name: ' ' })).toBe('Family');
  });
});

describe('familyFileStem', () => {
  it('reduces the name to something a filesystem takes', () => {
    expect(familyFileStem({ name: "O'Brien" })).toBe('o-brien-family');
    expect(familyFileStem({ name: '!!!' })).toBe('family');
  });
});
