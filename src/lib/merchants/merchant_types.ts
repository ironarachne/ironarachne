import type { MerchantMark } from '$lib/merchant_marks';

export type ShopType =
  | 'any'
  | 'general'
  | 'weaponsmith'
  | 'armorer'
  | 'apothecary'
  | 'clothier'
  | 'provisioner'
  | 'tavern'
  | 'stable'
  | 'scribe'
  | 'jeweler';

export type VenueType = 'any' | 'shop' | 'stall' | 'cart' | 'tent' | 'market_booth' | 'wagon';

export type HonestyLevel = 'any' | 'honest' | 'fair' | 'shrewd' | 'shifty' | 'swindler';

export type PriceLevel = 'any' | 'bargain' | 'standard' | 'expensive' | 'extortionate';

export type ResolvedShopType = Exclude<ShopType, 'any'>;

export type ResolvedVenueType = Exclude<VenueType, 'any'>;

export type ResolvedHonestyLevel = Exclude<HonestyLevel, 'any'>;

export type ResolvedPriceLevel = Exclude<PriceLevel, 'any'>;

export type MerchantStockItem = {
  name: string;
  baseCost: number;
  price: number;
  quantity: number;
  note?: string;
};

export type MerchantProprietor = {
  firstName: string;
  lastName: string;
  fullName: string;
  description: string;
  personalityTraits: string[];
};

export type MerchantShop = {
  name: string;
  shopType: ResolvedShopType;
  shopTypeLabel: string;
  venueType: ResolvedVenueType;
  venueTypeLabel: string;
  description: string;
  locationBlurb: string;
};

export type Merchant = {
  seed: string;
  proprietor: MerchantProprietor;
  shop: MerchantShop;
  mark: MerchantMark | null;
  honesty: ResolvedHonestyLevel;
  priceLevel: ResolvedPriceLevel;
  priceModifier: number;
  honestyNotes: string;
  hagglingAdvice: string;
  stock: MerchantStockItem[];
};
