import { describe, expect, it } from 'vitest';

import {
  characterFileStem,
  characterTitleLine,
  characterToDocument,
  characterToMarkdown,
  characterToPlainText,
} from './character_presentation.js';
import { rollCharacter } from './character_roll.js';
import type { Character } from './character_types.js';

function rollMatching(
  predicate: (character: Character) => boolean,
  config: Parameters<typeof rollCharacter>[1] = {},
): Character {
  for (let seed = 0; seed < 200; seed += 1) {
    const { character } = rollCharacter(`presentation-${seed}`, config);
    if (predicate(character)) {
      return character;
    }
  }
  throw new Error('no seed in the sweep produced a character of that shape');
}

const titled = rollMatching(
  (character) => (character.titles?.length ?? 0) > 0 && character.heraldry !== undefined,
  { archetypeName: 'noble' },
);

function headings(character: Character): string[] {
  return characterToDocument(character).sections.map((entry) => entry.heading);
}

describe('a character as a document', () => {
  it('is titled with the character’s name', () => {
    expect(characterToDocument(titled).title).toBe(titled.name);
  });

  it('prints what the sheet shows', () => {
    expect(headings(titled)).toEqual(
      expect.arrayContaining(['Description', 'At a Glance', 'Build', 'Titles', 'Heraldry']),
    );
  });

  /**
   * Requirement 6.4, and the reason the document model exists rather than two renderers each
   * remembering to skip an empty list: a character with nothing to say about a thing prints no
   * heading for it.
   */
  it('drops every section it has nothing for', () => {
    const bare: Character = {
      ...titled,
      titles: [],
      carried: [],
      abilities: [],
      physicalTraits: [],
      personalityTraits: [],
      heraldry: undefined,
    };

    expect(headings(bare)).not.toContain('Titles');
    expect(headings(bare)).not.toContain('Equipment');
    expect(headings(bare)).not.toContain('Abilities');
    expect(headings(bare)).not.toContain('Physical Traits');
    expect(headings(bare)).not.toContain('Personality');
    expect(headings(bare)).not.toContain('Heraldry');
  });

  it('leaves out a length nobody has', () => {
    const upright = characterToDocument({ ...titled, length: 0 });
    const build = upright.sections.find((entry) => entry.heading === 'Build');

    expect(build?.items.some((line) => line.startsWith('Length'))).toBe(false);
  });

  it('names a title for the person wearing it, and their lands with it', () => {
    const title = {
      ...titled.titles![0]!,
      maleTitle: 'Duke',
      femaleTitle: 'Duchess',
      hasLands: true,
      landName: 'Ashmere',
    };

    expect(characterTitleLine(title, 'female')).toBe('Duchess of Ashmere');
    expect(characterTitleLine(title, 'male')).toBe('Duke of Ashmere');
    expect(characterTitleLine({ ...title, hasLands: false }, 'male')).toBe('Duke');
  });
});

describe('a character as a file', () => {
  it('writes Markdown with a heading per section', () => {
    const markdown = characterToMarkdown(titled);

    expect(markdown.startsWith(`# ${titled.name}`)).toBe(true);
    expect(markdown).toContain('## Build');
    expect(markdown).toContain(`- Species: ${titled.species.name}`);
  });

  /** The PDF gets plain text: `#` and `-` are punctuation on a page, not formatting. */
  it('writes plain text with no Markdown punctuation', () => {
    const text = characterToPlainText(titled);

    expect(text).toContain('BUILD');
    expect(text).not.toContain('## ');
    expect(text).not.toContain('- Species');
  });

  it('reduces a name to something a filesystem takes', () => {
    expect(characterFileStem({ ...titled, name: 'Maren Voss' })).toBe('maren-voss');
    expect(characterFileStem({ ...titled, name: '  ' })).toBe('character');
  });
});
