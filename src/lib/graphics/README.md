# Graphics

This library holds the **RGB colour type and the operations on it** used by the drawing code —
map rendering, WebGL scenes, and anywhere else a colour needs to be mixed or shaded numerically
rather than picked from a palette.

It is distinct from [`$lib/display_colors`](../display_colors/README.md), which is a curated palette
with accessibility maths. This one is arithmetic on channels.

## Features

- **`RGBColor`** — `r`, `g`, `b`.
- **`rgbFromHexCss`** — parse a CSS hex string into an `RGBColor`.
- **`rgbaCss`** — render an `RGBColor` plus an alpha as a CSS `rgba()` string.
- **`lightenRgb`** / **`darkenRgb`** — shift a colour toward white or black by an amount.

## Usage

```typescript
import { darkenRgb, rgbaCss, rgbFromHexCss } from '$lib/graphics';

const base = rgbFromHexCss('#3A7CA5');
const shadow = darkenRgb(base, 0.25);

rgbaCss(shadow, 0.8); // 'rgba(...)' ready for a canvas fillStyle
```
