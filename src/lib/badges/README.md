# Badges

This library answers one question: **what colour should text on a badge be** so it stays readable
against whatever background the badge uses. A badge's background may be several swatches at once (a
conic gradient, say), so the choice has to hold against all of them, not just one.

It is the generic version of the palette logic in
[`$lib/archetype_badges`](../archetype_badges/README.md) and
[`$lib/species_badges`](../species_badges/README.md); those decide a badge's colours, this decides
what survives on top of them.

## Features

- **`pickBadgeTextColorForBackgrounds`** — pick a text colour meeting the WCAG 4.5:1 contrast
  threshold against every supplied background, from a fixed candidate list of near-whites and
  near-blacks.
- **`pickBadgeInitialsStyle`** — the same choice, but returning a `BadgeInitialsStyle` that adds a
  dark `scrim` behind the text when no candidate clears the threshold on its own.

## Usage

```typescript
import { pickBadgeInitialsStyle, pickBadgeTextColorForBackgrounds } from '$lib/badges';

const backgrounds = ['#2E5E3A', '#8FBF6A'];

const color = pickBadgeTextColorForBackgrounds(backgrounds); // e.g. '#FFFFFF'

const style = pickBadgeInitialsStyle(backgrounds);
style.text; // text colour
style.scrim; // set only when a scrim is needed to reach contrast
```

Contrast is measured with `contrastRatio` from
[`$lib/display_colors`](../display_colors/README.md).
