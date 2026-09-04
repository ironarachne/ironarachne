import { describe, expect, it } from 'vitest';

import { removeHoardItem } from './treasure_hoard_editing';
import {
  GEM_GROUP_LIMIT,
  GEM_LIST_LIMIT,
  hoardFileStem,
  hoardLines,
  hoardToDocument,
  hoardToMarkdown,
  hoardToText,
  hoardTotalValue,
  isHoardContainer,
  tallyGems,
} from './treasure_hoard_presentation';
import { defaultTreasureHoardConfigRecord, rollTreasureHoardSnapshot } from './treasure_hoard_roll';
import type { HoardItemSnapshot, TreasureHoardSnapshot } from './treasure_hoard_snapshot';

const HOARD = rollTreasureHoardSnapshot('presentation-seed', {
  ...defaultTreasureHoardConfigRecord(),
  value: 500,
});

/** A gem, as many as asked for, named so a tally can group them. */
function gems(count: number, name = 'emerald'): HoardItemSnapshot[] {
  return Array.from({ length: count }, (_entry, index) => ({
    id: `gem-${index}`,
    name,
    itemMajorType: 'gem',
    itemMinorType: 'gem',
    description: '',
    value: 100,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 0.1,
    properties: [],
    mechanics: { variants: [] },
  })) as HoardItemSnapshot[];
}

const EMPTY: TreasureHoardSnapshot = { targetValue: 0, items: [], mechanics: { variants: [] } };

describe('tallyGems', () => {
  it('lists them one by one below the list limit', () => {
    const lines = tallyGems(gems(GEM_LIST_LIMIT - 1));

    expect(lines).toHaveLength(GEM_LIST_LIMIT - 1);
    expect(lines[0].name).toBe('emerald');
  });

  it('groups them by name up to the group limit', () => {
    const lines = tallyGems(gems(GEM_GROUP_LIMIT));

    expect(lines).toHaveLength(1);
    expect(lines[0].name).toBe(`${GEM_GROUP_LIMIT} emeralds`);
    expect(lines[0].value).toBe(GEM_GROUP_LIMIT * 100);
  });

  it('uses the singular for a group of one', () => {
    const mixed = [...gems(GEM_LIST_LIMIT, 'emerald'), ...gems(1, 'opal')];
    const lines = tallyGems(mixed);

    expect(lines.map((line) => line.name)).toContain('1 opal');
  });

  it('collapses to one assorted line beyond the group limit', () => {
    // Nobody is going to read forty lines aloud.
    const lines = tallyGems(gems(GEM_GROUP_LIMIT + 1));

    expect(lines).toHaveLength(1);
    expect(lines[0].name).toBe(`${GEM_GROUP_LIMIT + 1} assorted gems`);
  });

  it('says nothing about no gems', () => {
    expect(tallyGems([])).toEqual([]);
  });
});

describe('hoardLines', () => {
  it('says how many coins of what', () => {
    const coins = hoardLines([
      {
        id: 'c',
        name: 'a pile of coins',
        itemMajorType: 'coins',
        itemMinorType: 'coins',
        description: '',
        value: 500,
        rarity: 'common',
        densityCategory: 'standard',
        weight: 1,
        properties: [],
        mechanics: { variants: [] },
        denomination: 'gold',
        quantity: 5,
      } as HoardItemSnapshot,
    ]);

    expect(coins[0].name).toBe('5 gold');
  });

  it('reads an art object by its description, which says more than its name', () => {
    const art = hoardLines([
      {
        id: 'a',
        name: 'art object',
        itemMajorType: 'art',
        itemMinorType: 'art object',
        description: 'a silver ewer chased with herons',
        value: 900,
        rarity: 'common',
        densityCategory: 'standard',
        weight: 1,
        properties: [],
        mechanics: { variants: [] },
      } as HoardItemSnapshot,
    ]);

    expect(art[0].name).toBe('a silver ewer chased with herons');
  });

  it('says nothing about nothing', () => {
    expect(hoardLines([])).toEqual([]);
  });
});

describe('hoardToDocument', () => {
  it('puts each item under the container holding it, and the rest loose', () => {
    const document = hoardToDocument(HOARD);
    const packed = document.containers.flatMap((container) => container.contents).length;

    expect(document.containers.length).toBeGreaterThan(0);
    expect(packed + document.loose.length).toBeGreaterThan(0);
  });

  it('counts what the hoard is worth all told', () => {
    expect(hoardTotalValue(HOARD)).toBe(HOARD.items.reduce((total, item) => total + item.value, 0));
    expect(hoardToDocument(HOARD).totalValueText).not.toBe('');
  });

  it('never shows the same item twice', () => {
    // A container naming something that is also loose would be read out to a table twice.
    const document = hoardToDocument(HOARD);
    const names = [
      ...document.containers.flatMap((container) => container.contents),
      ...document.loose,
    ];

    expect(names.length).toBeGreaterThan(0);
  });

  it('drops an item a chest names but the hoard no longer holds', () => {
    // What `removeHoardItem` prevents, checked from the reading end.
    const orphaned: TreasureHoardSnapshot = {
      ...HOARD,
      items: HOARD.items.map((item) =>
        isHoardContainer(item) ? { ...item, contents: [...(item.contents ?? []), 'gone'] } : item,
      ),
    };

    expect(() => hoardToDocument(orphaned)).not.toThrow();
  });

  it('says a hoard rolled at nothing is worth nothing rather than leaving it blank', () => {
    // The fault #65 found in the price lists: `valueToString(0)` is the empty string.
    expect(hoardToDocument(EMPTY).totalValueText).toBe('0 cp');
    expect(hoardToDocument(EMPTY).targetValueText).toBe('0 cp');
  });
});

describe('hoardToMarkdown', () => {
  it('writes the containers and what is in them, then the loose', () => {
    const markdown = hoardToMarkdown(HOARD);

    expect(markdown.startsWith('# Treasure Hoard\n\n')).toBe(true);
    expect(markdown).toContain('Worth ');
    expect(markdown).toContain('## ');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('says an empty chest is empty rather than heading nothing', () => {
    // 6.4 with teeth.
    const emptyChest: TreasureHoardSnapshot = {
      targetValue: 0,
      mechanics: { variants: [] },
      items: [
        {
          id: 'c',
          name: 'a chest',
          itemMajorType: 'container',
          description: 'an iron-bound chest',
          value: 0,
          rarity: 'common',
          densityCategory: 'standard',
          weight: 5,
          properties: [],
          mechanics: { variants: [] },
          contents: [],
        } as HoardItemSnapshot,
      ],
    };

    expect(hoardToMarkdown(emptyChest)).toContain('Empty.');
    expect(hoardToMarkdown(emptyChest)).not.toContain('## Loose');
  });

  it('prints no loose heading when everything is packed', () => {
    const document = hoardToDocument(HOARD);
    if (document.loose.length === 0) {
      expect(hoardToMarkdown(HOARD)).not.toContain('## Loose');
    }
  });

  it('writes a hoard carried off entirely as its heading and its worth', () => {
    expect(hoardToMarkdown(EMPTY)).toBe('# Treasure Hoard\n\nWorth 0 cp all told.\n');
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(hoardToMarkdown(HOARD)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('hoardToText', () => {
  it('writes the same hoard without the title the PDF draws itself', () => {
    const text = hoardToText(HOARD);

    expect(text).not.toContain('# Treasure Hoard');
    expect(text).toContain('Worth ');
    expect(text.endsWith('\n')).toBe(false);
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(hoardToText(HOARD)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('a hoard with its items removed', () => {
  it('still reads as a hoard', () => {
    let stripped = HOARD;
    while (stripped.items.length > 0) {
      stripped = removeHoardItem(stripped, 0);
    }

    expect(hoardToDocument(stripped).containers).toEqual([]);
    expect(hoardToDocument(stripped).loose).toEqual([]);
    expect(hoardToMarkdown(stripped)).toContain('# Treasure Hoard');
  });
});

describe('hoardFileStem', () => {
  it('names the default and reduces anything else', () => {
    expect(hoardFileStem()).toBe('treasure-hoard');
    expect(hoardFileStem("The Dragon's Pile")).toBe('treasure-hoard-the-dragon-s-pile');
    expect(hoardFileStem('???')).toBe('treasure-hoard');
  });
});
