import { describe, expect, it } from 'vitest';

import { all } from './fantasylist/index.js';
import type { EquipmentList } from './list.js';
import {
  FREE_LABEL,
  PRICE_CURRENCIES,
  PRICE_LIST_TITLE,
  countEquipmentItems,
  filterEquipmentLists,
  formatCost,
  priceCurrency,
  priceLegend,
  priceListDocument,
  priceListFileStem,
  priceListToMarkdown,
  priceListToText,
  toPricedLists,
} from './price_lists.js';

const DND = priceCurrency('dnd');
const ENGLISH = priceCurrency('english');

const SAMPLE: EquipmentList[] = [
  {
    title: 'Rope and string',
    items: [
      { name: 'hemp rope, 50 ft', cost: 100 },
      { name: 'silk rope, 50 ft', cost: 1000 },
    ],
  },
  {
    title: 'Free things',
    items: [{ name: 'club', cost: 0 }],
  },
];

describe('priceCurrency', () => {
  it('returns the currency with that id', () => {
    expect(priceCurrency('english').label).toBe('English currency');
  });

  it('falls back to the first currency rather than throwing on an unknown id', () => {
    // The caller is a `<select>` whose value is a string, so the type does not protect this.
    expect(priceCurrency('doubloons')).toBe(PRICE_CURRENCIES[0]);
  });
});

describe('formatCost', () => {
  it('writes a D&D price in the largest denominations that fit', () => {
    expect(formatCost(100, DND)).toBe('1 gp');
    expect(formatCost(125, DND)).toBe('1 gp 2 sp 5 cp');
  });

  it('never quotes a D&D price in electrum or platinum', () => {
    // 60 copper is one electrum and ten copper in a system that carries electrum, which is not
    // how any rulebook prices anything. A price over a platinum piece is the same problem.
    expect(formatCost(60, DND)).toBe('6 sp');
    expect(formatCost(500_000, DND)).toBe('5,000 gp');
  });

  it('treats one copper piece as one farthing in English money', () => {
    expect(formatCost(1, ENGLISH)).toBe('1 f');
    expect(formatCost(4, ENGLISH)).toBe('1 d');
    expect(formatCost(48, ENGLISH)).toBe('1 s');
    expect(formatCost(960, ENGLISH)).toBe('1 £');
  });

  it('never quotes an English price in guineas', () => {
    // The guinea outranks the pound at 252 pence to 240, so every price above a pound used to be
    // quoted in a coin the key never mentioned.
    expect(formatCost(1_000_000, ENGLISH)).not.toContain('guinea');
    expect(formatCost(1_000_000, ENGLISH)).toContain('£');
  });

  it('says an item is free rather than leaving the cost blank', () => {
    // `valueToString(0)` is the empty string, which rendered an empty cell for the club, the
    // quarterstaff and the sling stone — requirement 6.4.
    expect(formatCost(0, DND)).toBe(FREE_LABEL);
    expect(formatCost(0, ENGLISH)).toBe(FREE_LABEL);
    expect(formatCost(-5, DND)).toBe(FREE_LABEL);
  });
});

describe('priceLegend', () => {
  it('describes each D&D denomination against the next one down', () => {
    expect(DND.legend).toEqual([
      { symbol: 'cp', name: 'copper piece', worth: '' },
      { symbol: 'sp', name: 'silver piece', worth: 'worth 10 copper pieces' },
      { symbol: 'gp', name: 'gold piece', worth: 'worth 10 silver pieces' },
    ]);
  });

  it('describes each English denomination, with the plural nothing could derive', () => {
    expect(ENGLISH.legend).toEqual([
      { symbol: 'f', name: 'farthing', worth: '' },
      { symbol: 'd', name: 'penny', worth: 'worth 4 farthings' },
      { symbol: 's', name: 'shilling', worth: 'worth 12 pence' },
      { symbol: '£', name: 'pound', worth: 'worth 20 shillings' },
    ]);
  });

  it('names every denomination the currency can print', () => {
    // The key is only a key while it covers what the Cost column can say. A denomination added to
    // a display system without a name here would print its bare metal, and this is what says so.
    for (const currency of PRICE_CURRENCIES) {
      expect(currency.legend.length).toBe(currency.system.denominations.length);
      for (const entry of currency.legend) {
        expect(entry.name).not.toBe('');
        expect(entry.symbol).not.toBe('');
      }
    }
  });

  it('falls back to the bare denomination name for one it has no copy for', () => {
    const legend = priceLegend({
      name: 'Invented',
      description: 'A system this module has never seen.',
      denominations: [
        { name: 'bead', value: 1 },
        { name: 'shell', symbol: 'sh', value: 3 },
      ],
    });

    expect(legend).toEqual([
      { symbol: 'bead', name: 'bead', worth: '' },
      { symbol: 'sh', name: 'shell', worth: 'worth 3 bead' },
    ]);
  });
});

describe('filterEquipmentLists', () => {
  it('returns the lists untouched for an empty query', () => {
    expect(filterEquipmentLists(SAMPLE, '   ')).toBe(SAMPLE);
  });

  it('keeps the items whose name contains the query, whatever its case', () => {
    const filtered = filterEquipmentLists(SAMPLE, 'ROPE');

    expect(filtered.length).toBe(1);
    expect(filtered[0].items.map((item) => item.name)).toEqual([
      'hemp rope, 50 ft',
      'silk rope, 50 ft',
    ]);
  });

  it('drops a list with nothing left in it rather than showing an empty table', () => {
    expect(filterEquipmentLists(SAMPLE, 'club')).toEqual([
      { title: 'Free things', items: [{ name: 'club', cost: 0 }] },
    ]);
  });

  it('returns nothing at all when nothing matches', () => {
    expect(filterEquipmentLists(SAMPLE, 'trebuchet')).toEqual([]);
  });
});

describe('countEquipmentItems', () => {
  it('counts every item across every list', () => {
    expect(countEquipmentItems(SAMPLE)).toBe(3);
    expect(countEquipmentItems([])).toBe(0);
  });
});

describe('toPricedLists', () => {
  it('renders every cost in the chosen currency', () => {
    expect(toPricedLists(SAMPLE, DND)).toEqual([
      {
        title: 'Rope and string',
        items: [
          { name: 'hemp rope, 50 ft', cost: '1 gp' },
          { name: 'silk rope, 50 ft', cost: '10 gp' },
        ],
      },
      { title: 'Free things', items: [{ name: 'club', cost: FREE_LABEL }] },
    ]);
  });

  it('prices every item in the shipped lists in both currencies', () => {
    // The blank cost that 6.4 catches would show up here as an empty string, on any of the five
    // hundred rows rather than only the three that are free today.
    for (const currency of PRICE_CURRENCIES) {
      for (const list of toPricedLists(all(), currency)) {
        for (const item of list.items) {
          expect(item.cost, `${list.title}/${item.name}`).not.toBe('');
        }
      }
    }
  });
});

describe('priceListDocument', () => {
  it('defaults to the whole shipped reference', () => {
    const document = priceListDocument(DND);

    expect(document.title).toBe(PRICE_LIST_TITLE);
    expect(document.lists.length).toBe(all().length);
  });
});

describe('priceListToMarkdown', () => {
  it('writes a titled table per list, with the key above them', () => {
    expect(priceListToMarkdown(priceListDocument(DND, SAMPLE))).toBe(
      [
        `# ${PRICE_LIST_TITLE}`,
        '',
        'Prices in D&D currency.',
        '',
        '- cp: copper piece',
        '- sp: silver piece (worth 10 copper pieces)',
        '- gp: gold piece (worth 10 silver pieces)',
        '',
        '## Rope and string',
        '| Item | Cost |',
        '| --- | ---: |',
        '| hemp rope, 50 ft | 1 gp |',
        '| silk rope, 50 ft | 10 gp |',
        '',
        '## Free things',
        '| Item | Cost |',
        '| --- | ---: |',
        `| club | ${FREE_LABEL} |`,
        '',
      ].join('\n'),
    );
  });

  it('writes the key and nothing else when every list has been filtered away', () => {
    // 6.4: no stray heading, no empty table, no trailing run of blank lines.
    const markdown = priceListToMarkdown(priceListDocument(ENGLISH, []));

    expect(markdown).toBe(
      [
        `# ${PRICE_LIST_TITLE}`,
        '',
        'Prices in English currency.',
        '',
        '- f: farthing',
        '- d: penny (worth 4 farthings)',
        '- s: shilling (worth 12 pence)',
        '- £: pound (worth 20 shillings)',
        '',
      ].join('\n'),
    );
  });

  it('never leaves a blank line inside a table', () => {
    const markdown = priceListToMarkdown(priceListDocument(DND));

    expect(markdown).not.toContain('|\n\n|');
  });
});

describe('priceListToText', () => {
  it('writes the same document without pipes or a title the PDF draws itself', () => {
    const text = priceListToText(priceListDocument(ENGLISH, SAMPLE));

    expect(text).toBe(
      [
        'Prices in English currency.',
        '',
        'f: farthing',
        'd: penny (worth 4 farthings)',
        's: shilling (worth 12 pence)',
        '£: pound (worth 20 shillings)',
        '',
        'Rope and string',
        '  hemp rope, 50 ft - 2 s 1 d',
        '  silk rope, 50 ft - 1 £ 10 d',
        '',
        'Free things',
        `  club - ${FREE_LABEL}`,
      ].join('\n'),
    );
    expect(text).not.toContain(PRICE_LIST_TITLE);
    expect(text).not.toContain('|');
  });

  it('ends without a trailing blank line when the lists are empty', () => {
    expect(priceListToText(priceListDocument(DND, []))).toMatch(
      /gold piece \(worth 10 silver pieces\)$/,
    );
  });
});

describe('priceListFileStem', () => {
  it('names the currency the export is priced in', () => {
    expect(priceListFileStem(DND)).toBe('fantasy-equipment-prices-dnd');
    expect(priceListFileStem(ENGLISH)).toBe('fantasy-equipment-prices-english');
  });
});
