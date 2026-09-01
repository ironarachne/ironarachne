import { describe, expect, it } from 'vitest';

import type { SWNCharacter } from './character.js';
import { rollSwnCharacter } from './swn_character_roll.js';
import {
  formatSwnModifier,
  swnCharacterDisplayName,
  swnCharacterFileStem,
  swnCharacterToDocument,
  swnCharacterToMarkdown,
} from './swn_presentation.js';

function rollMatching(predicate: (character: SWNCharacter) => boolean): SWNCharacter {
  for (let seed = 0; seed < 300; seed += 1) {
    const { character } = rollSwnCharacter(`presentation-${seed}`);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

const character = rollMatching(() => true);

describe('formatSwnModifier', () => {
  it('signs a modifier the way a sheet prints it', () => {
    expect(formatSwnModifier(2)).toBe('+2');
    expect(formatSwnModifier(0)).toBe('+0');
    expect(formatSwnModifier(-1)).toBe('-1');
  });
});

describe('the SWN character document', () => {
  it('heads the document with the character', () => {
    expect(swnCharacterToDocument(character).title).toBe(
      `${character.firstName} ${character.lastName}`,
    );
  });

  /** Requirement 6.4: no heading over nothing. */
  it('drops a section with nothing under it', () => {
    const stripped: SWNCharacter = {
      ...character,
      armor: [],
      equipment: [],
      rangedWeapons: [],
      meleeWeapons: [],
    };
    const headings = swnCharacterToDocument(stripped).sections.map((entry) => entry.heading);

    expect(headings).not.toContain('Armor');
    expect(headings).not.toContain('Equipment');
    expect(headings).not.toContain('Weapons');
    expect(headings).toContain('Stats');
  });

  it('says nothing about psychic training for a character with none', () => {
    const mundane: SWNCharacter = { ...character, psychicPicks: [] };
    const headings = swnCharacterToDocument(mundane).sections.map((entry) => entry.heading);

    expect(headings).not.toContain('Psychic Training');
  });

  it('prints the disciplines a psychic actually has', () => {
    const psychic = rollMatching((rolled) => rolled.psychicPicks.length > 0);
    const section = swnCharacterToDocument(psychic).sections.find(
      (entry) => entry.heading === 'Psychic Training',
    );

    expect(section).toBeDefined();
    expect(section?.items.join('\n')).toContain(psychic.psychicPicks[0].disciplineName);
  });
});

describe('swnCharacterToMarkdown', () => {
  const markdown = swnCharacterToMarkdown(character);

  it('leads with the character and heads every section', () => {
    expect(markdown.startsWith(`# ${swnCharacterDisplayName(character)}`)).toBe(true);
    expect(markdown).toContain('## Stats');
    expect(markdown).toContain('## Skills');
  });

  it('prints the character’s own numbers', () => {
    expect(markdown).toContain(`Hit points: ${character.hitPoints}`);
    expect(markdown).toContain(`Class: ${character.characterClass.name}`);
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });
});

describe('swnCharacterDisplayName', () => {
  it('falls back to what the character is, then to the kind', () => {
    const unnamed: SWNCharacter = { ...character, firstName: '', lastName: ' ' };
    expect(swnCharacterDisplayName(unnamed)).toBe(
      `${character.background.name} ${character.characterClass.name}`,
    );

    const anonymous: SWNCharacter = {
      ...unnamed,
      background: { ...character.background, name: '' },
      characterClass: { ...character.characterClass, name: '' },
    };
    expect(swnCharacterDisplayName(anonymous)).toBe('SWN Character');
  });
});

describe('swnCharacterFileStem', () => {
  it('reduces a name to something a filesystem takes', () => {
    expect(swnCharacterFileStem({ ...character, firstName: 'Vex', lastName: "O'Hara" })).toBe(
      'swn-vex-o-hara',
    );
  });

  it('falls back for a character whose name reduces to nothing', () => {
    const punctuation: SWNCharacter = {
      ...character,
      firstName: '!!!',
      lastName: '',
      background: { ...character.background, name: '' },
      characterClass: { ...character.characterClass, name: '' },
    };

    expect(swnCharacterFileStem(punctuation)).toBe('swn-character');
  });
});
