import { describe, expect, it } from 'vitest';

import type Gift from './gift.js';
import { rollVelgarthGifts } from './velgarth_gifts_roll.js';
import {
  velgarthGiftHeading,
  velgarthGiftsDisplayName,
  velgarthGiftsFileStem,
  velgarthGiftsToDocument,
  velgarthGiftsToMarkdown,
} from './velgarth_gifts_presentation.js';

const gifts = rollVelgarthGifts('presentation-fixture');

describe('velgarthGiftHeading', () => {
  it('names the Gift and the strength it was rolled at', () => {
    expect(velgarthGiftHeading({ name: 'Mindspeech', description: '', strength: 4 })).toBe(
      'Mindspeech (strength 4)',
    );
  });

  it('says so for a Gift with no name, because the strength is still a fact', () => {
    expect(velgarthGiftHeading({ name: '  ', description: '', strength: 2 })).toBe(
      'An unnamed Gift (strength 2)',
    );
  });
});

describe('the Velgarth gifts document', () => {
  it('heads the document with the Gifts', () => {
    expect(velgarthGiftsToDocument(gifts).title).toBe(velgarthGiftsDisplayName(gifts));
  });

  it('gives every Gift a section of its own', () => {
    expect(velgarthGiftsToDocument(gifts).sections).toHaveLength(gifts.length);
  });

  /** Requirement 6.4: a heading, yes; a blank line where the prose was, no. */
  it('drops an empty description without dropping the Gift', () => {
    const stripped: Gift[] = [{ name: 'Fetching', description: '   ', strength: 2 }];
    const section = velgarthGiftsToDocument(stripped).sections[0];

    expect(section.heading).toBe('Fetching (strength 2)');
    expect(section.paragraphs).toEqual([]);
  });

  it('prints nothing at all for a set with no Gifts', () => {
    expect(velgarthGiftsToDocument([]).sections).toEqual([]);
  });
});

describe('velgarthGiftsToMarkdown', () => {
  const markdown = velgarthGiftsToMarkdown(gifts);

  it('leads with the set and heads every Gift', () => {
    expect(markdown.startsWith(`# ${velgarthGiftsDisplayName(gifts)}`)).toBe(true);
    expect(markdown).toContain(`## ${velgarthGiftHeading(gifts[0])}`);
    expect(markdown).toContain(gifts[0].description);
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('prints a heading and nothing else for a set with no Gifts', () => {
    expect(velgarthGiftsToMarkdown([])).toBe('# Velgarth Gifts\n');
  });
});

describe('velgarthGiftsDisplayName', () => {
  it('reads the way a player would say it out loud', () => {
    expect(
      velgarthGiftsDisplayName([
        { name: 'Mindspeech', description: '', strength: 1 },
        { name: 'Farsight', description: '', strength: 1 },
        { name: 'Healing', description: '', strength: 1 },
      ]),
    ).toBe('Mindspeech, Farsight and Healing');
  });

  it('falls back to the kind for a set with nothing named in it', () => {
    expect(velgarthGiftsDisplayName([])).toBe('Velgarth Gifts');
  });
});

describe('velgarthGiftsFileStem', () => {
  it('reduces the names to something a filesystem takes', () => {
    expect(velgarthGiftsFileStem([{ name: 'Mage-Gift', description: '', strength: 3 }])).toBe(
      'velgarth-mage-gift',
    );
  });

  it('falls back for a set whose names reduce to nothing', () => {
    expect(velgarthGiftsFileStem([{ name: '!!!', description: '', strength: 1 }])).toBe(
      'velgarth-gifts',
    );
  });
});
