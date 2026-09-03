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

## The `merchant` artifact kind

A merchant is a durable artifact (#67). `Merchant` was already plain data — the mark had been
stored as a charge _name_ and a fill since before the pass reached this tool — so the codec is a
deep copy rather than a conversion.

- **`merchant_snapshot.ts`** — `MerchantSnapshot` and the codec. **The stock is stored, not
  regenerated**: a `MerchantStockItem` is five fields, so a fifty-line inventory is a few kilobytes,
  and a referee who has crossed two things off has edited the shop.
  `merchantSeedMatchesProvenance` says out loud that the payload's own `seed` and the artifact's
  provenance seed are the same value, which is the trap the design named.
- **`merchant_artifact_kind.ts`** — the kind, its version, and a validator that normalises rather
  than refuses: an unreadable stock row is dropped, a named row with unreadable numbers keeps its
  name, and a mark that is not a `{ chargeName, fillHex }` pair becomes no mark.
- **`merchant_roll.ts`** — the one path from a seed. `nameSourceForSet` is the guard that matters:
  `getFantasyNameGeneratorSet` **throws** for a name it does not have, and the recorded set name is
  usually a _culture's_, so a re-roll would have crashed rather than falling back.
- **`merchant_editing.ts`** — the setters, none of which recompute. Changing the price modifier does
  not re-derive the ask column; `repricedStock` offers that as an explicit command.
- **`merchant_presentation.ts`** — the sheet, and the Markdown and PDF written from it. A shop that
  has sold out prints no stock heading at all.

**Composition (5.1).** Both inputs are opt-in offers. A saved `culture` names the proprietor — the
provenance records that culture's _pattern set name_ rather than its id, so a re-roll produces names
of the same tongue without reaching for an artifact it cannot ask for — and a saved `settlement`
supplies `shop.settlementName`, which is where a shop that would otherwise invent an unnamed town
now stands.
