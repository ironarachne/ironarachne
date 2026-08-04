# Download

Browser-only helpers for saving a file from the page. Only import these from client code — routes
and components that run in the DOM.

- **`index.ts`** — `downloadInBrowser(href, name)`: creates a temporary `<a download>`, clicks it,
  and removes it. Takes any URL: a blob URL, a data URI, a path.
- **`svg_to_png.ts`** — `saveSvgAsPng(svg, width, height, fileName)`: rasterizes an SVG string to a
  PNG at the given size and saves it through `downloadInBrowser`. Heraldry exports use it.

`saveSvgAsPng` returns a promise, which is worth a word because it looks like it need not. The work
happens inside an image's `onload` handler, so a failure there — a canvas that gives up no context,
a string the browser will not load as an image — has no caller on the stack to throw to. The promise
is the only way that reaches whoever asked for the file. It also revokes the object URL it creates
on every path out, including the failing ones; it used to leak one blob per call.

It moved here from `$lib/renderers` in step 6 of `docs/renderers.md`. It had nothing to do with
astronomical rendering: it is a download utility that takes a picture on the way.
