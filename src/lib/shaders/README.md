# Shaders

This library holds the **GLSL shader source** used by the WebGL scenes — planet surfaces, star
surfaces, and backgrounds — loaded through `vite-plugin-glsl` so a `.frag` or `.vert` file imports
as a string.

```
simple.vert    # The shared vertex shader
planets/       # One fragment shader per planet classification
stars/         # Star surface shaders
background/    # Backdrop shaders
```

## The index is deliberately thin

`index.ts` exports only `createShader` and the `Shader` type. The planet shaders in
`planets/planets.ts` are **not** re-exported, because that module statically imports every `.frag`
file: re-exporting it would put every fragment shader into the import chain of anything that wanted
only the `Shader` type. Import them by path, as `$lib/renderers/webgl_scene_build.ts` does:

```typescript
import { getFragmentShaderByName } from '$lib/shaders/planets/planets';

const source = getFragmentShaderByName('garden planet');
```

This is the same reasoning [`$lib/renderers`](../renderers/README.md) applies to its own WebGL entry
points, and the same reasoning behind the written-out import specifiers in `$lib/workshop`.

## Features

- **`Shader`** — a `name` and its `shader` source.
- **`createShader(name, source)`** — pair a name with its source.
- **`getFragmentShaderByName`** (in `planets/planets`) — the fragment shader for a planet
  classification name, e.g. `'ice planet'` or `'gas giant planet'`.

## Adding a shader

Add the `.frag` file beside its siblings and register it in that directory's module.
`getFragmentShaderByName` matches on the planet classification names from
[`$lib/astronomical_bodies`](../astronomical_bodies/README.md) and returns an **empty string** for a
name it does not know — so a new classification without a shader fails quietly at draw time rather
than loudly at lookup. Add both together.
