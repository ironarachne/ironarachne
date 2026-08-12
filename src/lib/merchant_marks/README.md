# Merchant marks

This library generates and renders a **merchant's mark**: the simple, single-charge sign a trader
hangs over a stall or stamps on a crate. It is the plainest of the site's emblem systems — one
charge, one flat dye colour, no field and no heraldic grammar.

Colours come from a table of **medieval dyes**, weighted by how obtainable each was. Cheap,
common dyes come up far more often than expensive ones, so a street of marks looks like a street of
tradespeople rather than a row of nobles.

## Features

- **`MerchantMark`** — `chargeName` and `fillHex`. That is the whole model.
- **`generateMerchantMark`** — pick a charge from the supplied options and a weighted dye colour.
- **`renderMerchantMarkSvg`** — render a mark to an SVG string at a given width and height.
- **`MEDIEVAL_DYE_SWATCHES`** / **`allMedievalDyeSwatches`** — the dye table.

## Usage

```typescript
import { all, matchingAnyTags } from '$lib/charges';
import { generateMerchantMark, renderMerchantMarkSvg } from '$lib/merchant_marks';

const chargeOptions = matchingAnyTags(['objects', 'tools', 'food'], all());
const mark = generateMerchantMark(rng, { chargeOptions });

const svg = renderMerchantMarkSvg(mark, 128, 128);
```

`generateMerchantMark` throws when `chargeOptions` is empty, so filter the charge catalog before
passing it. [`$lib/merchants`](../merchants/README.md) does exactly this, restricting marks to the
everyday charges a trader would use rather than the whole heraldic bestiary.

Compare [`$lib/disc_emblem`](../disc_emblem/README.md), which is the same idea with a contrasting
two-colour disc from the display palette.
