import { describe, expect, it } from 'vitest';

import { chopShopToDocument, chopShopToMarkdown, chopShopToText } from './chop_shop_presentation';
import { rollChopShop } from './chop_shop_roll';

const shop = rollChopShop('presentation-fixture');

describe('the chop shop exports', () => {
  it('write the paragraph under the heading', () => {
    expect(chopShopToMarkdown(shop)).toBe(`# Chop Shop\n\n${shop.text}\n`);
    expect(chopShopToText(shop)).toBe(shop.text);
  });

  /** 6.4: an emptied shop prints its heading and no blank paragraph. */
  it('drop an emptied paragraph', () => {
    expect(chopShopToDocument({ text: '  ' }).paragraphs).toEqual([]);
    expect(chopShopToMarkdown({ text: '' })).toBe('# Chop Shop\n');
    expect(chopShopToText({ text: '' })).toBe('');
  });
});
