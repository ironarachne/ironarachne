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
canvas2d_scene_draw.ts        # the Canvas2D backend: walks a scene issuing context calls
astronomical_preview.ts       # public render entry points; dispatches on renderer kind
astronomical_renderer_kind.ts # 'webgl' | 'canvas2d', and parsing it
astronomical_renderer_storage.ts
astronomical/                 # shared maths: body scaling, palettes, star colours, ring geometry
planets/  stars/  star_systems/  # per-body drawing, and the render entry point for each kind
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

The design document sets out six steps, of which this library has the first two. The scene builder
exists, and **the Canvas2D backend consumes it** — `canvas2d_scene_draw.ts` computes nothing, and
the three `canvas2d_*_renderer.ts` entry points are now delegation and no arithmetic.

The WebGL backends still compute their own content, so **the divergence described above is still
live** on that side: flip the renderer toggle and the palette, ring geometry and per-planet light
direction all change. Step 3 moves them onto the scene and closes it. Steps 4 to 6 add capability
detection, golden images, and the coverage exclusion.

Three consequences while that is true:

- `computeStarSystemLayout` is still imported by `webgl_star_system_renderer.ts`. It becomes fully
  internal to the builder once step 3 lands and that last import goes.
- `resolvePlanetCanvasTheme` is now the shared palette resolver for both backends, so its name has
  gone stale. It is renamed in step 3, when the WebGL side stops rolling its own palette and the
  rename can be made once across both callers.
- `renderers` is in `scripts/library_coverage_baseline.json`. It leaves in step 6, not before.

The per-pixel `drawPlanetSpherePatch`/`planet_canvas_surface_shade.ts` path survives as the
high-fidelity option the design keeps, but nothing routes to it yet — there is no selector for it
until quality tiers arrive in step 4. Its unit tests are what hold it to the `ScenePlanet` shape in
the meantime.
