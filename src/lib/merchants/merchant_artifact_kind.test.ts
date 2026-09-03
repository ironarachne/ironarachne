import { describe, expect, it } from 'vitest';

import {
  MERCHANT_ARTIFACT_KIND,
  MERCHANT_PAYLOAD_VERSION,
  merchantArtifactKind,
  merchantName,
  migrateMerchantSnapshot,
  validateMerchantSnapshot,
} from './merchant_artifact_kind';
import { defaultMerchantGeneratorConfigRecord, rollMerchantSnapshot } from './merchant_roll';

const MERCHANT = rollMerchantSnapshot('kind-seed', defaultMerchantGeneratorConfigRecord());

function accepted(payload: unknown) {
  const result = validateMerchantSnapshot(payload);
  if (!result.ok) {
    throw new Error(`expected an accepted payload, got: ${result.message}`);
  }
  return result.value;
}

describe('merchantArtifactKind', () => {
  it('registers the id and version the pass assigned it', () => {
    expect(merchantArtifactKind.kind).toBe(MERCHANT_ARTIFACT_KIND);
    expect(MERCHANT_ARTIFACT_KIND).toBe('merchant');
    expect(merchantArtifactKind.payloadVersion).toBe(MERCHANT_PAYLOAD_VERSION);
    expect(MERCHANT_PAYLOAD_VERSION).toBe(1);
  });

  it('loads a codec that round-trips', async () => {
    const codec = await merchantArtifactKind.loadCodec();

    expect(codec.fromSnapshot(codec.toSnapshot(MERCHANT), undefined as never)).toEqual(MERCHANT);
  });
});

describe('validateMerchantSnapshot', () => {
  it('accepts a rolled merchant unchanged', () => {
    expect(accepted(MERCHANT)).toEqual(MERCHANT);
  });

  it('accepts one that has been through storage', () => {
    expect(accepted(JSON.parse(JSON.stringify(MERCHANT)))).toEqual(MERCHANT);
  });

  it('refuses anything that is not an object', () => {
    for (const payload of [null, undefined, 42, 'a shop', ['a shop']]) {
      expect(validateMerchantSnapshot(payload).ok, String(payload)).toBe(false);
    }
  });

  it('refuses a payload with no seed, proprietor, shop or stock', () => {
    for (const field of ['seed', 'proprietor', 'shop', 'stock']) {
      const broken: Record<string, unknown> = { ...MERCHANT };
      delete broken[field];

      expect(validateMerchantSnapshot(broken).ok, field).toBe(false);
    }
  });

  it('accepts emptied prose, because clearing it is an editing decision', () => {
    // 3.3 asks for a well-defined empty result rather than a refusal.
    const emptied = accepted({ ...MERCHANT, honestyNotes: '', hagglingAdvice: '' });

    expect(emptied.honestyNotes).toBe('');
    expect(emptied.hagglingAdvice).toBe('');
  });

  it('accepts an emptied shop, which a referee can sell out of', () => {
    expect(accepted({ ...MERCHANT, stock: [] }).stock).toEqual([]);
  });

  it('drops a stock row with no name and keeps the rest', () => {
    const mixed = accepted({
      ...MERCHANT,
      stock: [{ baseCost: 1, price: 2, quantity: 3 }, MERCHANT.stock[0]],
    });

    expect(mixed.stock).toEqual([MERCHANT.stock[0]]);
  });

  it('keeps a named row whose numbers are unreadable, reading them as nothing', () => {
    // A referee can retype a price; they cannot retype a line that vanished.
    const row = accepted({
      ...MERCHANT,
      stock: [{ name: 'a bundle of arrows', baseCost: 'lots', price: null, quantity: undefined }],
    }).stock[0];

    expect(row).toEqual({ name: 'a bundle of arrows', baseCost: 0, price: 0, quantity: 0 });
  });

  it('drops a mark that is not a charge and a fill', () => {
    expect(accepted({ ...MERCHANT, mark: { chargeName: 'barrel' } }).mark).toBeNull();
    expect(accepted({ ...MERCHANT, mark: 'a barrel' }).mark).toBeNull();
  });

  it('keeps a settlement name and drops an empty one', () => {
    expect(
      accepted({ ...MERCHANT, shop: { ...MERCHANT.shop, settlementName: 'Ashford' } }).shop
        .settlementName,
    ).toBe('Ashford');
    expect(
      accepted({ ...MERCHANT, shop: { ...MERCHANT.shop, settlementName: '' } }).shop.settlementName,
    ).toBeUndefined();
  });
});

describe('migrateMerchantSnapshot', () => {
  it('rejects rather than pretending there has been another shape', () => {
    // Requirement 7.3 has one step to exercise and it is the absence of one.
    const result = migrateMerchantSnapshot({ seed: 'x' }, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
    expect(result.ok ? '' : result.message).toContain('payload version 0');
  });
});

describe('merchantName', () => {
  it('prefers the shop, which is what a party remembers', () => {
    expect(merchantName(MERCHANT)).toBe(MERCHANT.shop.name);
  });

  it('falls back to the proprietor, then to the kind', () => {
    const unnamed = { ...MERCHANT, shop: { ...MERCHANT.shop, name: '  ' } };

    expect(merchantName(unnamed)).toBe(MERCHANT.proprietor.fullName);
    expect(merchantName({ ...unnamed, proprietor: { ...unnamed.proprietor, fullName: '' } })).toBe(
      'Merchant',
    );
  });
});
