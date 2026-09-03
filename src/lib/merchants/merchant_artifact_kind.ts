import market from '$lib/assets/icons/set1/market.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { MerchantSnapshot } from './merchant_snapshot';
import type {
  MerchantStockItem,
  ResolvedHonestyLevel,
  ResolvedPriceLevel,
  ResolvedShopType,
  ResolvedVenueType,
} from './merchant_types';

/**
 * Stable artifact kind id. Unqualified: a shopkeeper is neither a game system's nor a setting's,
 * per the kind table in docs/tool-readiness.md.
 *
 * Its own kind rather than a share of anything: a merchant is a person, a venue and an inventory,
 * and no other tool produces that shape.
 */
export const MERCHANT_ARTIFACT_KIND = 'merchant' as const;

/** Version 1. The first shape a merchant has been stored in. */
export const MERCHANT_PAYLOAD_VERSION = 1 as const;

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * One stock row, normalised.
 *
 * A row missing its name is dropped rather than printed as `undefined` in a shop list; a row with
 * an unreadable price keeps its name and reads as costing nothing, because a referee can retype a
 * number and cannot retype a line that vanished.
 */
function readStockItem(value: unknown): MerchantStockItem | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.name !== 'string') {
    return undefined;
  }
  return {
    name: record.name,
    baseCost: readNumber(record.baseCost, 0),
    price: readNumber(record.price, 0),
    quantity: readNumber(record.quantity, 0),
    ...(typeof record.note === 'string' && record.note !== '' ? { note: record.note } : {}),
  };
}

/**
 * Reads a stored merchant, normalising rather than refusing wherever it honestly can.
 *
 * What is checked is what every reader depends on: the proprietor and the shop have to be objects
 * with the strings the sheet prints, and the stock has to be a list. Everything else degrades —
 * an unreadable stock row is dropped, a missing number reads as zero, and a mark that is not a
 * `{ chargeName, fillHex }` pair becomes no mark rather than a broken drawing.
 *
 * Empty strings are accepted throughout: a referee who has cleared the haggling advice on the way
 * to writing their own has made an editing decision, and 3.3 asks for a well-defined empty result
 * rather than a refusal.
 */
export function validateMerchantSnapshot(payload: unknown): PayloadResult<MerchantSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Merchant payload is not an object');
  }
  if (typeof record.seed !== 'string') {
    return rejectedPayload('invalid-payload', 'Merchant payload has no usable seed');
  }

  const proprietor = asRecord(record.proprietor);
  if (proprietor === null || !hasStringFields(proprietor, ['firstName', 'lastName', 'fullName'])) {
    return rejectedPayload('invalid-payload', 'Merchant payload has no usable proprietor');
  }

  const shop = asRecord(record.shop);
  if (shop === null || !hasStringFields(shop, ['name'])) {
    return rejectedPayload('invalid-payload', 'Merchant payload has no usable shop');
  }

  if (!Array.isArray(record.stock)) {
    return rejectedPayload('invalid-payload', 'Merchant payload has no usable stock list');
  }

  const mark = asRecord(record.mark);
  const usableMark =
    mark !== null && hasStringFields(mark, ['chargeName', 'fillHex'])
      ? { chargeName: mark.chargeName as string, fillHex: mark.fillHex as string }
      : null;

  return acceptedPayload({
    seed: record.seed,
    proprietor: {
      firstName: proprietor.firstName as string,
      lastName: proprietor.lastName as string,
      fullName: proprietor.fullName as string,
      description: typeof proprietor.description === 'string' ? proprietor.description : '',
      personalityTraits: isStringArray(proprietor.personalityTraits)
        ? proprietor.personalityTraits
        : [],
    },
    shop: {
      name: shop.name as string,
      shopType: (typeof shop.shopType === 'string' ? shop.shopType : 'general') as ResolvedShopType,
      shopTypeLabel: typeof shop.shopTypeLabel === 'string' ? shop.shopTypeLabel : '',
      venueType: (typeof shop.venueType === 'string'
        ? shop.venueType
        : 'shop') as ResolvedVenueType,
      venueTypeLabel: typeof shop.venueTypeLabel === 'string' ? shop.venueTypeLabel : '',
      description: typeof shop.description === 'string' ? shop.description : '',
      locationBlurb: typeof shop.locationBlurb === 'string' ? shop.locationBlurb : '',
      ...(typeof shop.settlementName === 'string' && shop.settlementName !== ''
        ? { settlementName: shop.settlementName }
        : {}),
    },
    mark: usableMark,
    honesty: (typeof record.honesty === 'string' ? record.honesty : 'fair') as ResolvedHonestyLevel,
    priceLevel: (typeof record.priceLevel === 'string'
      ? record.priceLevel
      : 'standard') as ResolvedPriceLevel,
    priceModifier: readNumber(record.priceModifier, 1),
    honestyNotes: typeof record.honestyNotes === 'string' ? record.honestyNotes : '',
    hagglingAdvice: typeof record.hagglingAdvice === 'string' ? record.hagglingAdvice : '',
    stock: record.stock
      .map(readStockItem)
      .filter((item): item is MerchantStockItem => item !== undefined),
  });
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day
 * the shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateMerchantSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<MerchantSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Merchants have no migration from payload version ${from}; version ${MERCHANT_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a saved merchant: the shop, which is what a referee looks for in a vault listing.
 *
 * The proprietor's name is the fallback rather than the first choice — a party remembers "the
 * Copper Kettle" and argues about what the shopkeeper was called.
 */
export function merchantName(snapshot: MerchantSnapshot): string {
  const shop = snapshot.shop.name.trim();
  if (shop !== '') {
    return shop;
  }
  const proprietor = snapshot.proprietor.fullName.trim();
  return proprietor === '' ? 'Merchant' : proprietor;
}

/**
 * A merchant as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading a merchant resolves nothing, because a stored one already holds everything it is.
 */
export const merchantArtifactKind = defineArtifactKind<MerchantSnapshot, MerchantSnapshot>({
  kind: MERCHANT_ARTIFACT_KIND,
  displayName: 'Merchant',
  icon: market,
  payloadVersion: MERCHANT_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toMerchantSnapshot, merchantFromSnapshotWithRng } =
      await import('./merchant_snapshot.js');
    return {
      toSnapshot: toMerchantSnapshot,
      fromSnapshot: merchantFromSnapshotWithRng,
    };
  },
  nameOf: merchantName,
  validate: validateMerchantSnapshot,
  migrate: migrateMerchantSnapshot,
});
