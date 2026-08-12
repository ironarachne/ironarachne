# Species badges

This library turns a species' **name** into the pieces needed to draw a badge for it: a slug, an
inline SVG icon if one exists, initials to fall back on, and a colour palette. It is the visual
counterpart to [`$lib/species`](../species/README.md), kept separate so the species data stays free
of presentation concerns.

The badge SVGs live in `assets/` and are bundled at build time with `import.meta.glob`, so a new
badge is added by dropping a file named after the species' slug into that directory — no
registration step.

## Features

- **`speciesNameToBadgeSlug`** — normalize a species name into the asset slug.
- **`getSpeciesBadgeSvg`** / **`getSpeciesBadgeSvgForName`** — the raw SVG string for a slug or name,
  or `undefined` when the species has no artwork.
- **`speciesNameToBadgeInitials`** — the initials to render when there is no SVG.
- **`pickSpeciesBadgePalette`** — a deterministic `SpeciesBadgePalette` derived from the name, with
  `pickSpeciesBadgeTextColor` and `pickSpeciesBadgeInitialsStyle` for the text drawn on it.

## Usage

```typescript
import {
  getSpeciesBadgeSvgForName,
  pickSpeciesBadgePalette,
  pickSpeciesBadgeTextColor,
  speciesNameToBadgeInitials,
} from '$lib/species_badges';

const name = 'blink dog';
const svg = getSpeciesBadgeSvgForName(name);
const palette = pickSpeciesBadgePalette(name);

const fallback = svg ? null : speciesNameToBadgeInitials(name);
const textColor = pickSpeciesBadgeTextColor(palette);
```

The palette is a pure function of the name — it uses no RNG — so badges stay stable across renders
and reloads without anything being persisted. Contrast is checked with
[`$lib/badges`](../badges/README.md), which is where the shared readability logic lives.

This library is the twin of [`$lib/archetype_badges`](../archetype_badges/README.md); the two are
deliberately parallel.
