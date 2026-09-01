import { describe, expect, it } from 'vitest';

import {
  dccCharacterDisplayName,
  dccCharacterFileStem,
  dccCharacterToDocument,
  dccCharacterToMarkdown,
} from './dcc_presentation.js';
import { rollDccCharacter } from './dcc_character_roll.js';
import type { DCCCharacter } from './dcc_types.js';

function rollMatching(predicate: (character: DCCCharacter) => boolean): DCCCharacter {
  for (let seed = 0; seed < 300; seed += 1) {
    const { character } = rollDccCharacter(`presentation-${seed}`);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

const character = rollMatching((rolled) => rolled.weapons.length > 0);

function headings(subject: DCCCharacter): string[] {
  return dccCharacterToDocument(subject).sections.map((entry) => entry.heading);
}

describe('a DCC character as a document', () => {
  it('is titled with the character’s name', () => {
    expect(dccCharacterToDocument(character).title).toBe(
      `${character.firstName} ${character.lastName}`,
    );
  });

  it('prints what the sheet shows', () => {
    expect(headings(character)).toEqual(
      expect.arrayContaining(['At a Glance', 'Attributes', 'Combat', 'Lucky Sign', 'Weapons']),
    );
  });

  it('prints each attribute with its modifier', () => {
    const attributes = dccCharacterToDocument(character).sections.find(
      (entry) => entry.heading === 'Attributes',
    );

    expect(attributes?.items).toHaveLength(6);
    expect(attributes?.items[0]).toBe(
      `Strength: ${character.strength.value} (${character.strength.modifier >= 0 ? '+' : ''}${character.strength.modifier})`,
    );
  });

  /**
   * Requirement 6.4, and why the document model exists rather than each renderer remembering to
   * skip an empty list.
   */
  it('drops every section it has nothing for', () => {
    const bare: DCCCharacter = {
      ...character,
      weapons: [],
      equipment: [],
      languages: [],
      specialRules: [],
      currency: { cp: 0, sp: 0, gp: 0, ep: 0, pp: 0 },
    };

    expect(headings(bare)).not.toContain('Weapons');
    expect(headings(bare)).not.toContain('Equipment');
    expect(headings(bare)).not.toContain('Languages');
    expect(headings(bare)).not.toContain('Special Rules');
    expect(headings(bare)).not.toContain('Money');
  });

  /**
   * A peasant's sheet should be silent on spells rather than announce that they have none — a
   * heading over the line "No spellcasting possible" is exactly the stray content 6.4 is about.
   */
  it('says nothing about spellcasting for a character who cannot cast', () => {
    expect(headings({ ...character, spellsKnown: -9 })).not.toContain('Spellcasting');
    expect(headings({ ...character, spellsKnown: 1 })).toContain('Spellcasting');
  });

  it('falls back to the occupation for a character with no name', () => {
    const unnamed = { ...character, firstName: '', lastName: '  ' };

    expect(dccCharacterDisplayName(unnamed)).toBe(character.occupation.name);
    expect(dccCharacterToDocument(unnamed).title).toBe(character.occupation.name);
  });

  it('falls back again for a character with neither', () => {
    const nothing = {
      ...character,
      firstName: '',
      lastName: '',
      occupation: { ...character.occupation, name: '' },
    };

    expect(dccCharacterDisplayName(nothing)).toBe('DCC Character');
  });
});

describe('a DCC character as a file', () => {
  it('writes Markdown with a heading per section', () => {
    const markdown = dccCharacterToMarkdown(character);

    expect(markdown.startsWith(`# ${dccCharacterDisplayName(character)}`)).toBe(true);
    expect(markdown).toContain('## Attributes');
    expect(markdown).toContain(`- Occupation: ${character.occupation.name}`);
  });

  it('reduces a name to something a filesystem takes', () => {
    expect(dccCharacterFileStem({ ...character, firstName: 'Maren', lastName: 'Voss' })).toBe(
      'dcc-maren-voss',
    );
  });
});
