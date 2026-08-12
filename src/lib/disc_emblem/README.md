# Disc emblem

This library generates and renders a **disc emblem**: one charge on a filled circular ground,
inspired by Japanese _mon_ but deliberately culture-neutral. It is the simplest of the site's
emblem systems — no divisions, no ordinaries, no heraldic grammar — and is meant for the many
world-building cases that want a mark rather than a coat of arms.

Colour comes from the [display palette](../display_colors/README.md), not from heraldic tinctures,
and the two colours are chosen to clear a contrast threshold so the charge stays legible at small
sizes.

## Features

- **`DiscEmblem`** — `chargeName`, `groundHex`, and `chargeHex`. That is the whole model.
- **`generateDiscEmblem`** — pick a charge from the supplied options and a contrasting colour pair.
- **`renderDiscEmblemSvg`** — render an emblem to an SVG string at a given width and height.

## Usage

```typescript
import { all } from '$lib/charges';
import { generateDiscEmblem, renderDiscEmblemSvg } from '$lib/disc_emblem';

const emblem = generateDiscEmblem(rng, { chargeOptions: all() });
const svg = renderDiscEmblemSvg(emblem, 256, 256);
```

`generateDiscEmblem` throws when `chargeOptions` is empty, so filter the charge catalog before
passing it, not after:

```typescript
import { all, matchingTag } from '$lib/charges';

const emblem = generateDiscEmblem(rng, { chargeOptions: matchingTag('animal', all()) });
```

The emblem stores the charge's **name**, not its artwork, so a saved emblem stays small and picks up
any later change to the artwork it names.
