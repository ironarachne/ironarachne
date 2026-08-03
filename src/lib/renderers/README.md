# Renderers

Turns a planet, a star, or a star system into a preview image, on either of two backends.

The library is built around one idea: **a pure function decides what a picture contains, and a
backend only draws it.** That function is the scene builder, and what it returns is an
`AstronomicalScene` — plain data, no DOM, no canvas.

[`docs/renderers.md`](../../../docs/renderers.md) is the design document, including the approved
domain model that `astronomical_scene_types.ts` implements. If code needs a shape the diagram does
not have, amend the diagram first.

## Usage

```ts
import { buildPlanetScene } from '$lib/renderers';
import { renderPlanetPreviewImage } from '$lib/renderers/astronomical_preview';

const scene = buildPlanetScene(planet, 512, 512, seed);
const dataUrl = renderPlanetPreviewImage(document, planet, 512, 512, seed, 'webgl');
```

`buildStarScene` and `buildStarSystemScene` are the other two entry points. All three are pure and
deterministic: the same body and seed always give the same scene.

The render entry points return a base64 data URL and are synchronous. That is deliberate and
recorded as decision 5 in the design document — capability detection needs the pipeline to be
stateful, which is not the same as needing it to be asynchronous.

## Why a scene

The two backends used to compute the same picture twice, and disagreed. They drew different random
numbers in a different order from the same seed, so the renderer toggle — which exists so the site
keeps working without a usable GPU — changed the planet rather than just the fidelity. Worse, the
Canvas2D path consumed the RNG for background stars part-way through, and the number of stars
depends on the canvas size, so the same seed at two preview sizes produced different rings.

Everything that decides content now happens once, in the builder:

- **Background stars are positions, not a count.** A count would have to be re-rolled by each
  backend, which is what makes "identical" collapse into "similar".
- **Layout resolves to absolute pixels.** `computeStarSystemLayout`'s `baseUnitWidth` and
  `totalUnits` are working values and stop at the builder; a backend that could see them could do
  its own arithmetic with them.
- **`isGasGiant` is resolved once**, rather than each backend re-deriving it from `classification`.
- **Each planet is seeded from its own ordinal**, so adding a star to a system moves the planets
  without repainting them.

The contract between the backends is composition, not pixels: same layout, same palette, same ring
geometry, same light direction, same background stars. Shading detail differs and is expected to.
That is what makes the contract testable — equality is asserted on the scene, never on the images.

## Layout

```
astronomical_scene.ts         # the builder: body or system + seed → AstronomicalScene
astronomical_scene_types.ts   # the scene's types, from the approved domain model
astronomical_preview.ts       # public render entry points; dispatches on renderer kind
astronomical_renderer_kind.ts # 'webgl' | 'canvas2d', and parsing it
astronomical_renderer_storage.ts
astronomical/                 # shared maths: body scaling, palettes, star colours, ring geometry
planets/  stars/  star_systems/  # the backends, one Canvas2D and one WebGL each
```

`index.ts` exports the scene builder, its types, and the renderer kind and its storage. Two
deliberate omissions:

- **The backends.** Nothing outside this library should pick one — that is what
  `astronomical_preview.ts` is for. The modules under `astronomical/` are likewise internal shared
  maths, reached by path within the library.
- **The render entry points**, even though they are public API. `astronomical_preview.ts`
  statically imports `three` and the GLSL shaders, so putting it in the barrel would drag the WebGL
  graph into the import chain of anything that wanted only the pure builder. Import it by path.
  `$lib/workshop` keeps its panel loaders out of the way for the same reason.

`svg-to-png.ts` is also not exported. It is a download utility that has nothing to do with
astronomical rendering and is slated to move out of this library; its two consumers import it
directly today.

## Where this is going

The design document sets out six steps, of which this library currently has the first. The scene
builder exists and is tested, but **nothing consumes it yet** — the backends still compute their
own content, and the divergence described above is still live. Steps 2 and 3 move the Canvas2D and
then the WebGL backends onto the scene and close it; steps 4 to 6 add capability detection, golden
images, and the coverage exclusion.

Two consequences while that is true:

- `computeStarSystemLayout` is still imported by both star-system backends. It becomes fully
  internal to the builder once step 3 lands and the last of those imports goes.
- `renderers` is in `scripts/library_coverage_baseline.json`. It leaves in step 6, not before.
