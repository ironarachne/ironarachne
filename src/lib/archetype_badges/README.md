# Archetype badges

This library turns an archetype's **name** into the pieces needed to draw a badge for it: a slug, an
inline SVG icon if one exists, initials to fall back on, and a colour palette. It is the visual
counterpart to [`$lib/archetypes`](../archetypes/README.md), kept separate so the archetype data
stays free of presentation concerns.

The badge SVGs live in `assets/` and are bundled at build time with `import.meta.glob`, so a new
badge is added by dropping a file named after the archetype's slug into that directory — no
registration step.

## Features

- **`archetypeNameToBadgeSlug`** — normalize an archetype name into the asset slug.
- **`getArchetypeBadgeSvg`** / **`getArchetypeBadgeSvgForName`** — the raw SVG string for a slug or
  name, or `undefined` when the archetype has no artwork.
- **`archetypeNameToBadgeInitials`** — the initials to render when there is no SVG.
- **`pickArchetypeBadgePalette`** — a deterministic `ArchetypeBadgePalette` derived from the name, so
  the same archetype always gets the same colours, with `pickArchetypeBadgeTextColor` and
  `pickArchetypeBadgeInitialsStyle` for the text drawn on it.

## Usage

```typescript
import {
  archetypeNameToBadgeInitials,
  getArchetypeBadgeSvgForName,
  pickArchetypeBadgePalette,
  pickArchetypeBadgeTextColor,
} from '$lib/archetype_badges';

const name = 'Hedge Witch';
const svg = getArchetypeBadgeSvgForName(name);
const palette = pickArchetypeBadgePalette(name);

// Draw the icon when there is one, initials when there is not.
const fallback = svg ? null : archetypeNameToBadgeInitials(name); // 'HW'
const textColor = pickArchetypeBadgeTextColor(palette);
```

The palette is a pure function of the name — it uses no RNG — so badges stay stable across renders
and reloads without anything being persisted.
