# Charges

This library holds the **charge artwork** used across the site's emblem systems: the lion rampant,
the anchor, the fleur-de-lis, and some hundreds of others. A charge here is artwork plus metadata —
name, plural name, type, tags — and deliberately **no colour**. Tincture is applied by whoever draws
it, so the same lion serves heraldry, merchant marks, and disc emblems.

Each glyph's SVG lives in a directory under `animals/`, `monsters/`, `objects/`, `plants/`, or
`symbols/`, and the `charges-*.ts` files bind that artwork to its metadata.

## Features

- **`ChargeGlyph`** — `name`, `pluralName`, `chargeType`, the raw `SVG`, and `tags`.
- **`getAllChargeGlyphs`** / **`getChargeGlyphByName`** — the full catalog, and a lookup that returns
  `undefined` on a miss.
- **Selectors** — `all`, `allChargeTags`, `matchingTag`, `matchingAnyTags`, `random`, and
  `randomWithTag`, for narrowing the catalog before picking from it.
- **`geometricEmblemChargeGlyphs`** — the abstract geometric glyphs used by non-heraldic emblems.
- **`tintChargeSvg`** — recolour a glyph's white-body/black-line artwork to a flat fill, returning
  the SVG string. It is imported directly from `$lib/charges/tint_charge_svg` rather than through
  the index.

## Usage

```typescript
import { all, allChargeTags, matchingTag, randomWithTag } from '$lib/charges';

const charges = all();

allChargeTags(); // every tag in the catalog, for building a picker

const beasts = matchingTag('animal', charges);
const chosen = randomWithTag('animal', charges, rng);
```

Charges arrive uncoloured, so drawing one means tinting it first:

```typescript
import { tintChargeSvg } from '$lib/charges/tint_charge_svg';

const svg = tintChargeSvg('#B22222', 'unique-id', chosen.SVG);
```

The `styleIdSuffix` argument namespaces the artwork's CSS class names. Pass something unique per
rendered charge — two untinted copies on one page would otherwise share (and fight over) the same
`st0`/`st1` classes.

Consumers: [`$lib/heraldry`](../heraldry/README.md),
[`$lib/merchant_marks`](../merchant_marks/README.md), and
[`$lib/disc_emblem`](../disc_emblem/README.md).
