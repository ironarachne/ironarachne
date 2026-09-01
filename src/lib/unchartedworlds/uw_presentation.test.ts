import { describe, expect, it } from 'vitest';

import type { UWCharacter } from './character.js';
import { rollUwCharacter } from './uw_character_roll.js';
import {
  formatUwStat,
  uwCharacterDisplayName,
  uwCharacterFileStem,
  uwCharacterToDocument,
  uwCharacterToMarkdown,
} from './uw_presentation.js';

const { character } = rollUwCharacter('presentation-fixture');

describe('formatUwStat', () => {
  it('signs a stat the way a sheet prints it', () => {
    expect(formatUwStat(2)).toBe('+2');
    expect(formatUwStat(0)).toBe('+0');
    expect(formatUwStat(-1)).toBe('-1');
  });
});

describe('the Uncharted Worlds character document', () => {
  it('heads the document with the character', () => {
    expect(uwCharacterToDocument(character).title).toBe(
      `${character.firstName} ${character.lastName}`,
    );
  });

  it('gives each skill and each asset a heading of its own', () => {
    const sections = uwCharacterToDocument(character).sections;

    for (const skill of character.skills) {
      expect(sections.some((entry) => entry.heading === skill.name && entry.level === 3)).toBe(
        true,
      );
    }
    for (const asset of character.assets) {
      expect(sections.some((entry) => entry.heading === asset.name && entry.level === 3)).toBe(
        true,
      );
    }
  });

  /** Requirement 6.4: no heading over nothing. */
  it('drops a group heading with nothing under it', () => {
    const stripped: UWCharacter = { ...character, skills: [], assets: [] };
    const headings = uwCharacterToDocument(stripped).sections.map((entry) => entry.heading);

    expect(headings).not.toContain('Skills');
    expect(headings).not.toContain('Assets');
    expect(headings).toContain('Statistics');
  });

  it('drops the workspace section for a character with no workspace description', () => {
    const noWorkspace: UWCharacter = {
      ...character,
      workspace: { name: 'A Shed', description: '' },
    };
    const headings = uwCharacterToDocument(noWorkspace).sections.map((entry) => entry.heading);

    expect(headings).not.toContain('Workspace');
    // Its name is still in the glance block, which is where a reader looks for it.
    const glance = uwCharacterToDocument(noWorkspace).sections.find(
      (entry) => entry.heading === 'At a Glance',
    );
    expect(glance?.items.join('\n')).toContain('A Shed');
  });

  /** A skill with no description still prints its name: the name is the fact. */
  it('keeps a skill this build has no description for', () => {
    const unknown: UWCharacter = {
      ...character,
      skills: [{ name: 'Whistling', description: '' }],
    };

    expect(uwCharacterToDocument(unknown).sections.some((e) => e.heading === 'Whistling')).toBe(
      true,
    );
  });
});

describe('uwCharacterToMarkdown', () => {
  const markdown = uwCharacterToMarkdown(character);

  it('leads with the character and nests the skills under their heading', () => {
    expect(markdown.startsWith(`# ${uwCharacterDisplayName(character)}`)).toBe(true);
    expect(markdown).toContain('## Skills');
    expect(markdown).toContain(`### ${character.skills[0].name}`);
  });

  it('prints what the character has done', () => {
    expect(markdown).toContain(`Origin: ${character.origin.name}`);
    expect(markdown).toContain(`Advancement: ${character.advancement}`);
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });
});

describe('uwCharacterDisplayName', () => {
  it('falls back to the careers, then to the kind', () => {
    const unnamed: UWCharacter = { ...character, firstName: '', lastName: ' ' };
    expect(uwCharacterDisplayName(unnamed)).toBe(
      character.careers.map((career) => career.name).join(' and '),
    );

    expect(uwCharacterDisplayName({ ...unnamed, careers: [] })).toBe('Uncharted Worlds Character');
  });
});

describe('uwCharacterFileStem', () => {
  it('reduces a name to something a filesystem takes', () => {
    expect(uwCharacterFileStem({ ...character, firstName: 'Sabra', lastName: "O'Neil" })).toBe(
      'uw-sabra-o-neil',
    );
  });

  it('falls back for a character whose name reduces to nothing', () => {
    expect(uwCharacterFileStem({ ...character, firstName: '!!!', lastName: '', careers: [] })).toBe(
      'uw-character',
    );
  });
});
