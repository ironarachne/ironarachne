# Pattern lattice

This library generates and renders a **pattern lattice**: a grid of coloured cells, in the spirit of
Andean _tocapu_ textile blocks but deliberately culture-neutral. It is the site's abstract emblem
system — no charges, no figures, just colour blocks arranged on a grid.

The model is intentionally tiny and fully serializable: rows, columns, and a row-major array of
`#RRGGBB` strings. Colours come from the weighted [display palette](../display_colors/README.md).

## Features

- **`PatternLattice`** — `rows`, `cols`, and `cells` (row-major, length `rows * cols`).
- **`generatePatternLattice`** — fill a grid with two to four palette colours, optionally mirrored
  vertically. Every option has a default, so an `RNG` alone is enough.
- **`renderPatternLatticeSvg`** — render one to an SVG string.

## Usage

```typescript
import { generatePatternLattice, renderPatternLatticeSvg } from '$lib/pattern_lattice';

const lattice = generatePatternLattice(rng);
const svg = renderPatternLatticeSvg(lattice, 256, 256);
```

Constrain the result through the options — `minDim`/`maxDim` bound both dimensions, `colorCount`
fixes the palette size, and `verticalMirror` forces symmetry on or off:

```typescript
const lattice = generatePatternLattice(rng, { minDim: 5, maxDim: 5, colorCount: 3 });
```

The renderer draws into a fixed `0 0 100 100` viewBox scaled to the width and height you pass, and
returns an empty SVG rather than throwing if the lattice's `cells` length disagrees with its
`rows * cols`.

Because a lattice is plain data, it saves and reloads without any snapshot step — unlike the
generators that carry live objects.

Compare the site's other emblem systems: [`$lib/heraldry`](../heraldry/README.md) (full heraldic
grammar), [`$lib/disc_emblem`](../disc_emblem/README.md) and
[`$lib/merchant_marks`](../merchant_marks/README.md) (a single charge).
