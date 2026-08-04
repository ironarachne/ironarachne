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

- **Each star carries the seed its shader's surface detail rotates from**, rather than the WebGL
  backend drawing that number from whichever RNG was to hand.

The contract between the backends is composition, not pixels: same layout, same palette, same ring
geometry, same light direction, same background stars. Shading detail differs and is expected to.
That is what makes the contract testable — equality is asserted on the scene, never on the images.
`cross_backend_scene.test.ts` is where that assertion lives.

## Layout

```
astronomical_scene.ts         # the builder: body or system + seed → AstronomicalScene
astronomical_scene_types.ts   # the scene's types, from the approved domain model
canvas2d_scene_draw.ts        # the Canvas2D backend: walks a scene issuing context calls
webgl_scene_build.ts          # the WebGL backend: a scene → a draw list of meshes and uniforms
webgl_scene_draw.ts           # the WebGL backend: that draw list onto a canvas, via three.js
webgl_scene_types.ts          # the draw list's types
astronomical_preview.ts       # public render entry points; dispatches on renderer kind
astronomical_renderer_kind.ts # 'webgl' | 'canvas2d', and parsing it
astronomical_renderer_storage.ts
astronomical/                 # shared maths and constants: body scaling, palettes, star colours,
                              # ring geometry, the background star colour
planets/  stars/  star_systems/  # the render entry point for each kind, and Canvas2D's per-body drawing
```

The WebGL backend is split in two on purpose. Everything it decides — plane sizes, uniforms,
blending, order — is a value in `webgl_scene_build.ts` that a test can read without a GL context;
`webgl_scene_draw.ts` is the part that cannot be tested that way, and it is kept down to the
three.js calls that put those values on the GPU.

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

## How the WebGL backend composes a picture

Worth knowing before changing a shader, because the pieces only fit one way.

The background is **one pass of its own**: a plane in the scene's fill colour, then the scene's
background stars as point sprites. Every body is drawn over that with `render_background` at 0.
The shaders can still generate a starfield of their own and the uniform still says whether to — but
nothing asks them to any more, because a generated sky is not the sky the scene describes, and in a
star system each body was generating a different one over its neighbours.

That makes each body plane a square with something drawn in the middle of it and nothing around it,
so the two of them must not paint over the sky:

- A **star** plane blends additively. A corona is light, and light adds to what is behind it.
- A **planet** plane discards any pixel it has left black, and is opaque everywhere else. A planet's
  night side is far above that threshold, so a planet still occludes the stars behind it — which
  additive blending would not have done.

Order is painter's order, back to front, as `drawScene` walks a scene on a 2D context. Depth testing
is off and `sortObjects` is off on the renderer, because three would otherwise reorder the draws.

## Where this is going

The design document sets out six steps, of which this library has the first three: the scene builder
exists and **both backends consume it**. `canvas2d_scene_draw.ts` and `webgl_scene_build.ts` compute
nothing about what a picture contains, the six `*_renderer.ts` entry points are delegation and no
arithmetic, and the divergence described above is **closed** — flipping the renderer toggle now
changes the fidelity and nothing else.

Steps 4 to 6 add capability detection and quality tiers, golden images, and a coverage exclusion for
the GPU submission file. Until step 4 there is no probe: `ImageRendererSelect` is still a plain
choice between backends rather than an override of a decision the site made for itself, and
`quality` is on every scene but no backend reads it yet.

The per-pixel `drawPlanetSpherePatch`/`planet_canvas_surface_shade.ts` path survives as the
high-fidelity option the design keeps, but nothing routes to it yet — there is no selector for it
until quality tiers arrive in step 4. Its unit tests are what hold it to the `ScenePlanet` shape in
the meantime.
