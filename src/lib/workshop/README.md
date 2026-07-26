# Workshop

Maps a tool in the [catalog](../tools) to the component that renders it, so a tool can be
mounted inside a panel instead of only on its own route.

The catalog says a tool exists, what it is called, and where it lives; it says nothing about how
to draw it. This library is that missing half, and it is deliberately separate: everything that
consumes `$lib/tools` — navigation, index pages, filtering — needs the metadata and none of it
needs the components.

## Usage

```ts
import { toolPanelLoader } from '$lib/workshop';

const loader = toolPanelLoader('/culture');
const { default: CultureGenerator } = await loader();
```

`hasToolPanel` answers the same question without loading anything.

Loading is deferred, and the import specifiers are written out in full, because a bundler can
only split a dynamic import it can see. A computed specifier would pull every generator on the
site — WebGL renderers and PDF export included — into whatever page opened one panel.

The components are the same ones the routes mount, so a tool behaves in a panel exactly as it
does on its own page.

## Adding a tool

Add the entry to `TOOL_PANELS` alongside the `defineTool` entry in the catalog. The unit tests
check the two agree in both directions: every catalog tool has a panel, and no panel is
registered for a path that is not a tool.
