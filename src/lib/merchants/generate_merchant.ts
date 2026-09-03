import {
  describe,
  generate as generateCharacter,
  getCharacterGenerationConfigForNameSet,
  resolveCharacterNameGeneratorSet,
} from '$lib/characters';
import { getAllChargeGlyphs, matchingAnyTags } from '$lib/charges';
import { generateMerchantMark } from '$lib/merchant_marks';
import { RNG } from '@ironarachne/rng';
import type { MerchantGeneratorConfig } from './merchant_generator_config.js';
import {
  generateHagglingAdvice,
  generateHonestyNotes,
  generateShopName,
  generateVenueDescription,
  getShopTypeLabel,
  getVenueTypeLabel,
  RESOLVED_HONESTY_LEVELS,
  RESOLVED_PRICE_LEVELS,
  RESOLVED_VENUE_TYPES,
} from './merchant_narrative.js';
import { RESOLVED_SHOP_TYPES } from './shop_catalog.js';
import { computePriceModifier, generateStock } from './shop_inventory.js';
import type {
  Merchant,
  ResolvedHonestyLevel,
  ResolvedPriceLevel,
  ResolvedShopType,
  ResolvedVenueType,
} from './merchant_types.js';

const MERCHANT_MARK_TAGS = [
  'barrel',
  'galleon',
  'water',
  'objects',
  'tools',
  'animals',
  'food',
  'plants',
];

function resolveShopType(config: MerchantGeneratorConfig, rng: RNG): ResolvedShopType {
  if (config.shopType !== 'any') {
    return config.shopType;
  }
  return rng.item(RESOLVED_SHOP_TYPES);
}

function resolveVenueType(config: MerchantGeneratorConfig, rng: RNG): ResolvedVenueType {
  if (config.venueType !== 'any') {
    return config.venueType;
  }
  return rng.item(RESOLVED_VENUE_TYPES);
}

function resolveHonesty(config: MerchantGeneratorConfig, rng: RNG): ResolvedHonestyLevel {
  if (config.honesty !== 'any') {
    return config.honesty;
  }
  return rng.item(RESOLVED_HONESTY_LEVELS);
}

function resolvePriceLevel(config: MerchantGeneratorConfig, rng: RNG): ResolvedPriceLevel {
  if (config.priceLevel !== 'any') {
    return config.priceLevel;
  }
  return rng.item(RESOLVED_PRICE_LEVELS);
}

export function generateMerchant(seed: string, config: MerchantGeneratorConfig): Merchant {
  const rng = new RNG(seed);

  const shopType = resolveShopType(config, rng);
  const venueType = resolveVenueType(config, rng);
  const honesty = resolveHonesty(config, rng);
  const priceLevel = resolvePriceLevel(config, rng);

  const nameSet = resolveCharacterNameGeneratorSet(rng, config.nameSource, 'human');
  const characterConfig = getCharacterGenerationConfigForNameSet(`${seed}-char`, nameSet);
  characterConfig.allowedAgeCategoryNames = ['adult', 'elderly'];
  const character = generateCharacter(`${seed}-char`, characterConfig);
  const description = describe(character, rng);

  const shopName = generateShopName(rng, shopType, character.lastName);
  const { description: venueDescription, locationBlurb } = generateVenueDescription(
    rng,
    venueType,
    shopType,
  );

  const mark = config.includeMerchantMark
    ? generateMerchantMark(rng, {
        chargeOptions: matchingAnyTags(MERCHANT_MARK_TAGS, getAllChargeGlyphs()),
      })
    : null;

  const stockCount = rng.int(config.stockCount.min, config.stockCount.max);
  const priceModifier = computePriceModifier(rng, priceLevel, honesty);
  const stock = generateStock(rng, shopType, stockCount, priceModifier, honesty);

  return {
    seed,
    proprietor: {
      firstName: character.firstName,
      lastName: character.lastName,
      fullName: `${character.firstName} ${character.lastName}`,
      description,
      personalityTraits: character.personalityTraits,
    },
    shop: {
      name: shopName,
      shopType,
      shopTypeLabel: getShopTypeLabel(shopType),
      venueType,
      venueTypeLabel: getVenueTypeLabel(venueType),
      description: venueDescription,
      locationBlurb,
      ...(config.settlementName === undefined || config.settlementName === ''
        ? {}
        : { settlementName: config.settlementName }),
    },
    mark,
    honesty,
    priceLevel,
    priceModifier,
    honestyNotes: generateHonestyNotes(rng, honesty),
    hagglingAdvice: generateHagglingAdvice(rng, honesty, priceLevel),
    stock,
  };
}
