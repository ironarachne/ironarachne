import { describe, expect, it } from 'vitest';
import { generateMerchant } from './generate_merchant.js';
import { getDefaultMerchantConfig } from './merchant_generator_config.js';

describe('generateMerchant', () => {
  it('is deterministic for the same seed and config', () => {
    const config = getDefaultMerchantConfig();
    config.shopType = 'weaponsmith';
    config.venueType = 'shop';
    config.honesty = 'fair';
    config.priceLevel = 'standard';
    config.stockCount = { min: 6, max: 6 };

    const first = generateMerchant('merchant-seed', config);
    const second = generateMerchant('merchant-seed', config);

    expect(second).toEqual(first);
  });

  it('generates stock within the configured count range', () => {
    const config = getDefaultMerchantConfig();
    config.stockCount = { min: 10, max: 10 };

    const merchant = generateMerchant('stock-count-seed', config);

    expect(merchant.stock.length).toBe(10);
    expect(merchant.stock.every((item) => item.name.length > 0)).toBe(true);
    expect(merchant.stock.every((item) => item.quantity > 0)).toBe(true);
    expect(merchant.stock.every((item) => item.price >= 0)).toBe(true);
  });

  it('respects fixed shop, venue, honesty, and price settings', () => {
    const config = getDefaultMerchantConfig();
    config.shopType = 'apothecary';
    config.venueType = 'tent';
    config.honesty = 'honest';
    config.priceLevel = 'bargain';
    config.includeMerchantMark = false;

    const merchant = generateMerchant('fixed-config-seed', config);

    expect(merchant.shop.shopType).toBe('apothecary');
    expect(merchant.shop.venueType).toBe('tent');
    expect(merchant.honesty).toBe('honest');
    expect(merchant.priceLevel).toBe('bargain');
    expect(merchant.mark).toBeNull();
    expect(merchant.proprietor.fullName).toMatch(/\S+\s+\S+/);
    expect(merchant.shop.name.length).toBeGreaterThan(0);
  });

  it('includes a merchant mark when configured', () => {
    const config = getDefaultMerchantConfig();
    config.includeMerchantMark = true;

    const merchant = generateMerchant('mark-seed', config);

    expect(merchant.mark).not.toBeNull();
    expect(merchant.mark?.chargeName.length).toBeGreaterThan(0);
    expect(merchant.mark?.fillHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
