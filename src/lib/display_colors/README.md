# Display colors

This library holds the **display palette** — a weighted list of named hex swatches — and the
contrast maths for using it safely. It is deliberately broader than heraldic tinctures: where
heraldry has six tinctures and strict rules about which may touch which, this is a general
world-building palette for things like pattern lattices and disc emblems.

Contrast is measured by WCAG 2.1 relative luminance, so a "high contrast" pair here is one that is
actually readable, not one that merely looks different.

## Features

- **`DisplayColorSwatch`** — `name`, `hex`, and `commonality` (the weight used for random picks).
- **`DISPLAY_SWATCHES`** / **`allDisplaySwatches`** — the palette, `#RRGGBB` only.
- **`relativeLuminance`** — WCAG relative luminance of a hex string, 0 (black) to 1 (white).
- **`contrastRatio`** — the ratio between two hex colours, 1 to 21.
- **`pickContrastingPair`** — choose a ground and a foreground swatch that clear a contrast
  threshold, using an `RNG` and the swatches' commonality weights.

## Usage

```typescript
import { contrastRatio, pickContrastingPair } from '$lib/display_colors';

const { ground, charge } = pickContrastingPair(rng);
contrastRatio(ground, charge); // at or above the threshold
```

`pickContrastingPair` samples with replacement until a pair passes, and **throws** once it runs out
of attempts. Pass `{ minRatio, maxAttempts }` to loosen either bound.

For a colour you already have, check it directly:

```typescript
import { contrastRatio, relativeLuminance } from '$lib/display_colors';

relativeLuminance('#1E2A4A');
contrastRatio('#1E2A4A', '#F2EBDC'); // >= 4.5 is readable body text
```

Consumers: [`$lib/pattern_lattice`](../pattern_lattice/README.md),
[`$lib/disc_emblem`](../disc_emblem/README.md), and
[`$lib/badges`](../badges/README.md), which uses `contrastRatio` to pick readable badge text.
