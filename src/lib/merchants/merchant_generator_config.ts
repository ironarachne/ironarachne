import type { CharacterNameSource } from '$lib/characters';
import type { HonestyLevel, PriceLevel, ShopType, VenueType } from './merchant_types.js';

export type MerchantGeneratorConfig = {
  shopType: ShopType;
  venueType: VenueType;
  honesty: HonestyLevel;
  priceLevel: PriceLevel;
  stockCount: { min: number; max: number };
  includeMerchantMark: boolean;
  nameSource: CharacterNameSource;
};

export function getDefaultMerchantConfig(): MerchantGeneratorConfig {
  return {
    shopType: 'any',
    venueType: 'any',
    honesty: 'any',
    priceLevel: 'any',
    stockCount: { min: 8, max: 16 },
    includeMerchantMark: true,
    nameSource: { kind: 'default' },
  };
}
