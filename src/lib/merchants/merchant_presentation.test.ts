import { describe, expect, it } from 'vitest';

import { removeStockItem, setMerchantText, setShopText } from './merchant_editing';
import {
  merchantDisplayName,
  merchantFileStem,
  merchantLocationText,
  merchantPriceText,
  merchantToDocument,
  merchantToMarkdown,
  merchantToText,
  priceModifierText,
} from './merchant_presentation';
import { defaultMerchantGeneratorConfigRecord, rollMerchantSnapshot } from './merchant_roll';

const CONFIG = defaultMerchantGeneratorConfigRecord();
const MERCHANT = rollMerchantSnapshot('presentation-seed', CONFIG);
const PLACED = rollMerchantSnapshot('placed-seed', { ...CONFIG, settlementName: 'Ashford' });

/** Every row of the stock list crossed off, which a referee can do. */
function soldOut(snapshot: typeof MERCHANT) {
  let emptied = snapshot;
  while (emptied.stock.length > 0) {
    emptied = removeStockItem(emptied, 0);
  }
  return emptied;
}

describe('merchantDisplayName', () => {
  it('prefers the shop and falls back twice', () => {
    expect(merchantDisplayName(MERCHANT)).toBe(MERCHANT.shop.name);
    expect(merchantDisplayName({ ...MERCHANT, shop: { ...MERCHANT.shop, name: ' ' } })).toBe(
      MERCHANT.proprietor.fullName,
    );
    expect(
      merchantDisplayName({
        ...MERCHANT,
        shop: { ...MERCHANT.shop, name: '' },
        proprietor: { ...MERCHANT.proprietor, fullName: '' },
      }),
    ).toBe('Merchant');
  });
});

describe('merchantLocationText', () => {
  it('names the settlement beside the corner the shop stands on', () => {
    // The two answer different halves of the question, so a referee who linked a settlement does
    // not lose the blurb.
    expect(merchantLocationText(PLACED)).toBe(`${PLACED.shop.locationBlurb} In Ashford.`);
  });

  it('is the blurb alone when nothing was referenced', () => {
    expect(merchantLocationText(MERCHANT)).toBe(MERCHANT.shop.locationBlurb);
  });

  it('is the settlement alone when the blurb has been cleared', () => {
    expect(merchantLocationText(setShopText(PLACED, 'locationBlurb', ''))).toBe('In Ashford.');
  });

  it('is empty when there is neither', () => {
    expect(merchantLocationText(setShopText(MERCHANT, 'locationBlurb', ''))).toBe('');
  });
});

describe('merchantPriceText and priceModifierText', () => {
  it('quote a price in coins and a modifier as a percentage', () => {
    expect(merchantPriceText(100)).toBe('1 gp');
    expect(priceModifierText(1.25)).toBe('125% of catalog value');
  });

  it('write out a price of nothing rather than leaving it blank', () => {
    // The fault #65 found in the price lists: `valueToString(0)` is the empty string.
    expect(merchantPriceText(0)).toBe('0 cp');
  });
});

describe('merchantToDocument', () => {
  it('arranges the shop, the person and the stock', () => {
    const document = merchantToDocument(MERCHANT);

    expect(document.title).toBe(MERCHANT.shop.name);
    expect(document.subtitle).toContain(MERCHANT.shop.shopTypeLabel);
    expect(document.proprietor.name).toBe(MERCHANT.proprietor.fullName);
    expect(document.trading.map((line) => line.label)).toEqual([
      'Honesty',
      'Price level',
      'Price modifier',
    ]);
    expect(document.stock).toHaveLength(MERCHANT.stock.length);
  });

  it('drops every part whose field is empty', () => {
    // 6.4. A merchant edited down to nothing must not print headings over blanks.
    const stripped = soldOut(
      setMerchantText(
        setMerchantText(setShopText(MERCHANT, 'description', ''), 'honestyNotes', ''),
        'hagglingAdvice',
        '',
      ),
    );
    const document = merchantToDocument(stripped);

    expect(document.paragraphs).toEqual([]);
    expect(document.notes).toEqual([]);
    expect(document.stock).toEqual([]);
  });
});

describe('merchantToMarkdown', () => {
  it('writes the shop, the proprietor, the trading notes and the stock table', () => {
    const markdown = merchantToMarkdown(MERCHANT);

    expect(markdown.startsWith(`# ${MERCHANT.shop.name}\n\n`)).toBe(true);
    expect(markdown).toContain('## Proprietor');
    expect(markdown).toContain('## Trading');
    expect(markdown).toContain('## Stock');
    expect(markdown).toContain('| Item | Qty | Catalog | Ask price | Note |');
    expect(markdown).toContain(`| ${MERCHANT.stock[0].name} |`);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('names the settlement when one was referenced', () => {
    expect(merchantToMarkdown(PLACED)).toContain('In Ashford.');
  });

  it('prints no stock heading for a shop that has sold out', () => {
    // 6.4 with teeth: a table head over nothing is the artifact this drops.
    const markdown = merchantToMarkdown(soldOut(MERCHANT));

    expect(markdown).not.toContain('## Stock');
    expect(markdown).not.toContain('| Item |');
  });

  it('never leaves a blank line inside the table', () => {
    expect(merchantToMarkdown(MERCHANT)).not.toContain('|\n\n|');
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(merchantToMarkdown(MERCHANT)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('merchantToText', () => {
  it('writes the same sheet without pipes or the title the PDF draws itself', () => {
    const text = merchantToText(MERCHANT);

    expect(text).not.toContain('|');
    expect(text).not.toContain(`# ${MERCHANT.shop.name}`);
    expect(text).toContain('Proprietor: ');
    expect(text).toContain('Stock');
    expect(text.endsWith('\n')).toBe(false);
  });

  it('prints no stock section for a shop that has sold out', () => {
    expect(merchantToText(soldOut(MERCHANT))).not.toContain('Stock');
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(merchantToText(MERCHANT)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('merchantFileStem', () => {
  it('reduces the shop name to something a filesystem takes', () => {
    expect(
      merchantFileStem({ ...MERCHANT, shop: { ...MERCHANT.shop, name: "Halgrim's Fine Wares" } }),
    ).toBe('merchant-halgrim-s-fine-wares');
  });

  it('falls back for a name that reduces to nothing', () => {
    expect(
      merchantFileStem({
        ...MERCHANT,
        shop: { ...MERCHANT.shop, name: '???' },
        proprietor: { ...MERCHANT.proprietor, fullName: '' },
      }),
    ).toBe('merchant');
  });
});
