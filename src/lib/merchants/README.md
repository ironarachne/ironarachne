# Merchants

This library generates a **merchant and their shop**: the person behind the counter, what kind of
trade they are in, where they trade from, how honest they are, what they charge, what is currently
in stock at what price, and how to haggle with them. It is aimed at the moment in play when the
party walks into a shop the GM had not prepared.

Prices are derived rather than invented: an item's base cost, the shop's price level, and the
merchant's honesty combine into a modifier applied to every item in stock, so a swindler's
extortionate stall is expensive consistently.

## Features

- **Types** — `Merchant` (a `proprietor`, a `shop`, an optional `mark`, and the trade details),
  `MerchantProprietor`, `MerchantShop`, `MerchantStockItem`, and the four axes, each with an `any`
  member for "let the generator decide": `ShopType`, `VenueType`, `HonestyLevel`, and `PriceLevel`.
  The `Resolved*` variants are the same unions with `any` excluded — what a generated merchant
  actually holds.
- **Generation** — `generateMerchant(seed, config)` with `getDefaultMerchantConfig`.
- **Inventory** — `generateStock`, `computePriceModifier`, and `getCatalogForShopType`.
- **Narrative** — `generateShopName`, `generateVenueDescription`, `generateHonestyNotes`,
  `generateHagglingAdvice`, `getShopTypeLabel`, and `getVenueTypeLabel`.

## Usage

```typescript
import { generateMerchant, getDefaultMerchantConfig } from '$lib/merchants';

const merchant = generateMerchant('some seed', getDefaultMerchantConfig());

merchant.proprietor.fullName;
merchant.shop.name;
merchant.stock; // items with price and quantity
merchant.hagglingAdvice;
```

Pin any axis you care about and leave the rest as `'any'`:

```typescript
const config = getDefaultMerchantConfig();
config.shopType = 'apothecary';
config.honesty = 'shifty';
config.stockCount = { min: 4, max: 8 };

const merchant = generateMerchant(seed, config);
```

The merchant is a full generated character underneath, named through
[`$lib/characters`](../characters/README.md)'s name-source machinery — set `config.nameSource` to
have shopkeepers named after the culture of the settlement they are in rather than the default.

When `includeMerchantMark` is set, the merchant also gets a trade mark from
[`$lib/merchant_marks`](../merchant_marks/README.md).
