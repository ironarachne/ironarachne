import type { RNG } from '@ironarachne/rng';
import type {
  MerchantStockItem,
  ResolvedHonestyLevel,
  ResolvedPriceLevel,
  ResolvedShopType,
} from './merchant_types.js';
import { getCatalogForShopType, type CatalogEntry } from './shop_catalog.js';

const PRICE_RANGES: Record<ResolvedPriceLevel, { min: number; max: number }> = {
  bargain: { min: 0.7, max: 0.85 },
  standard: { min: 0.95, max: 1.05 },
  expensive: { min: 1.15, max: 1.35 },
  extortionate: { min: 1.5, max: 2.5 },
};

const HONESTY_MARKUP: Record<ResolvedHonestyLevel, { min: number; max: number }> = {
  honest: { min: 0, max: 0.02 },
  fair: { min: 0.02, max: 0.08 },
  shrewd: { min: 0.08, max: 0.18 },
  shifty: { min: 0.15, max: 0.35 },
  swindler: { min: 0.35, max: 0.75 },
};

const MISLABEL_NOTES = [
  'sold as fine quality',
  'may be short weight',
  'origin uncertain',
  'sold as imported',
  'authenticity disputed',
];

export function computePriceModifier(
  rng: RNG,
  priceLevel: ResolvedPriceLevel,
  honesty: ResolvedHonestyLevel,
): number {
  const priceRange = PRICE_RANGES[priceLevel];
  const honestyRange = HONESTY_MARKUP[honesty];
  const base = rng.float(priceRange.min, priceRange.max);
  const markup = rng.float(honestyRange.min, honestyRange.max);
  return parseFloat((base + markup).toFixed(3));
}

function rollQuantity(rng: RNG, baseCost: number): number {
  if (baseCost >= 1000) {
    return 1;
  }
  if (baseCost >= 200) {
    return rng.int(1, 3);
  }
  if (baseCost >= 50) {
    return rng.int(1, 6);
  }
  return rng.int(2, 12);
}

function maybeAddDishonestNote(
  rng: RNG,
  honesty: ResolvedHonestyLevel,
): string | undefined {
  if (honesty === 'honest' || honesty === 'fair') {
    return undefined;
  }
  const chance = honesty === 'swindler' ? 45 : 20;
  if (rng.simple(chance)) {
    return rng.item(MISLABEL_NOTES);
  }
  return undefined;
}

function pickStockItems(rng: RNG, catalog: CatalogEntry[], count: number): CatalogEntry[] {
  if (catalog.length === 0) {
    return [];
  }
  return rng.randomSet(Math.min(count, catalog.length), catalog);
}

export function generateStock(
  rng: RNG,
  shopType: ResolvedShopType,
  count: number,
  priceModifier: number,
  honesty: ResolvedHonestyLevel,
): MerchantStockItem[] {
  const catalog = getCatalogForShopType(shopType);
  const picks = pickStockItems(rng, catalog, count);

  return picks.map((entry) => {
    const quantity = rollQuantity(rng, entry.cost);
    const perItemVariance = rng.float(0.92, 1.08);
    const price = Math.max(0, Math.floor(entry.cost * priceModifier * perItemVariance));
    const note = maybeAddDishonestNote(rng, honesty);

    return {
      name: entry.name,
      baseCost: entry.cost,
      price,
      quantity,
      note,
    };
  });
}
