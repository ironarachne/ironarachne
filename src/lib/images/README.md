# Images

This library converts **SVG to other forms**: rasterizing an SVG string to a PNG in the browser, and
parsing SVG markup into an object tree that can be inspected or measured.

Everything the site generates visually is SVG first, so this is what stands between "an SVG string"
and "a file the user can save" or "dimensions the layout needs".

## Features

- **`renderSVGAsPNG`** — draw an SVG string onto a canvas at a given size and write the result to
  the element with the supplied id.
- **`convertXmlToSVGObject`** — parse SVG markup into a `ParsedSvgDocument`.
- **`getSVGDimensions`** — read the width and height out of a parsed SVG node, falling back to the
  `viewBox` when the element carries no explicit dimensions.

## Usage

```typescript
import { convertXmlToSVGObject, getSVGDimensions, renderSVGAsPNG } from '$lib/images';

const parsed = convertXmlToSVGObject(svg); // throws when there is no <svg> root
const { width, height } = getSVGDimensions(parsed.svg);

renderSVGAsPNG(svg, width, height, 'output-image');
```

`renderSVGAsPNG` needs a DOM and a canvas, so it runs in the browser only — not during SSR or in a
node-side render script. See [`$lib/download`](../download/README.md) for saving the result, and the
`scripts/render_*.ts` entry points for previewing generated SVG outside the browser.
