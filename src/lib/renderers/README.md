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
import { renderPlanetPreviewImage } from '$lib/renderers/astronomical_preview';

const dataUrl = renderPlanetPreviewImage(document, planet, 512, 512, seed);
```

That is the whole of it: which backend draws, and at what quality, is decided for the caller. A
caller that genuinely needs a particular one — a test, a tool — passes a `RendererDecision` as the
last argument, and nothing is probed.

`buildPlanetScene` and its two siblings are exported for anyone who wants the data without an
image. They are pure and deterministic: the same body and seed always give the same scene.

The render entry points return a base64 data URL and are synchronous. That is deliberate and
recorded as decision 5 in the design document — capability detection needs the pipeline to be
stateful, which is not the same as needing it to be asynchronous.

## Choosing a backend, and a quality

Two questions that look alike and are not:

- **Which backend** is a capability question with one right answer. WebGL unavailable — no context,
  a blocked extension, a context taken away — falls back to Canvas2D, because slow beats nothing.
- **Which quality** is a budget question with a dial. A weak GPU does _not_ fall back: a
  CPU-rasterized WebGL context still beats a per-pixel JavaScript loop, so the answer is less work,
  not different work.

`renderer_probe.ts` asks the machine (one `getContext`, one `WEBGL_debug_renderer_info` read, then
it hands the context straight back). `renderer_decision.ts` turns that plus any override into a
`RendererDecision`, and holds it for the page session: probed once, dropped a tier if a render
overruns `RENDER_BUDGET_MS`, re-resolved to Canvas2D if a context is lost. `reason` says which of
those happened, which is what the settings UI shows and what makes a bug report legible.

`reduced` quality means both backends rasterize the same scene at half linear scale — a quarter of
the fragments — and the result is scaled back up to the size that was asked for, so the page does
not move under the person waiting for it. WebGL also drops the bump-normal pass, which is six fbm
evaluations a pixel and the most expensive thing in the shader. **The scene is not rebuilt smaller.**
Two machines on different tiers get the same picture with different detail, which is the difference
between a budget and a second renderer.

`renderer_preference_storage.ts` persists only what a person chose — `backendOverride` and
`qualityOverride`, either of which may be absent, meaning "decide for me". Nothing measured is
persisted: see decision 6. It migrates the one key it replaces, `ironarachne.astronomicalRenderer`,
whose bare backend name becomes a backend override.

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
astronomical_preview.ts       # public render entry points; resolves the decision and times itself
canvas2d_scene_draw.ts        # the Canvas2D backend: walks a scene issuing context calls
webgl_scene_build.ts          # the WebGL backend: a scene → a draw list of meshes and uniforms
webgl_scene_draw.ts           # the WebGL backend: that draw list onto a canvas, via three.js
webgl_scene_types.ts          # the draw list's types
render_scale.ts               # what `reduced` means to a backend: half scale, then scale back up
renderer_probe.ts             # what this machine can do; the only module here that touches the DOM
renderer_decision.ts          # probe + preference → decision, held for the page session
renderer_decision_types.ts    # the capability types, from the approved domain model
renderer_preference_storage.ts # the persisted half: overrides only, never a measurement
renderer_backend.ts           # 'webgl' | 'canvas2d', and parsing it
astronomical/                 # shared maths and constants: body scaling, palettes, star colours,
                              # ring geometry, the background star colour
planets/  stars/              # Canvas2D's per-body drawing, and the per-pixel shading it keeps
```

The WebGL backend is split in two on purpose. Everything it decides — plane sizes, uniforms,
blending, order — is a value in `webgl_scene_build.ts` that a test can read without a GL context;
`webgl_scene_draw.ts` is the part that cannot be tested that way, and it is kept down to the
three.js calls that put those values on the GPU. `renderer_probe.ts` and `renderer_decision.ts` are
split along the same line and for the same reason.

There is no per-body, per-backend `*_renderer.ts` layer any more. It existed to give each pair of
backends a matching signature; both backends now take `(document, scene)`, so what is left of that
layer is one function that builds a scene and hands it over.

`index.ts` exports the scene builder, its types, the renderer backend and the preference storage.
Three deliberate omissions:

- **The backends.** Nothing outside this library should pick one — that is what
  `astronomical_preview.ts` is for. The modules under `astronomical/` are likewise internal shared
  maths, reached by path within the library.
- **The render entry points**, even though they are public API. `astronomical_preview.ts`
  statically imports `three` and the GLSL shaders, so putting it in the barrel would drag the WebGL
  graph into the import chain of anything that wanted only the pure builder. Import it by path.
  `$lib/workshop` keeps its panel loaders out of the way for the same reason.
- **`renderer_decision.ts`**, which reaches the probe and therefore the DOM. The settings UI that
  wants it can say so by importing it directly.

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

The design document sets out six steps, of which this library has the first four: the scene builder
exists, **both backends consume it**, and **the site decides for itself** which one to use and how
hard to work. The divergence bug is closed — the backend changes the fidelity and nothing else — and
the control that used to ask a visitor whether their GPU was any good is now an override on a
decision already made.

Steps 5 and 6 are what make it stay fixed: golden images in Playwright, generated from CI, and a
file-scoped coverage exclusion for `webgl_scene_draw.ts`, the one module here that cannot be tested
without a GPU.

The per-pixel `drawPlanetSpherePatch`/`planet_canvas_surface_shade.ts` path survives as the
high-fidelity option the design keeps, but nothing routes to it yet — the quality dial turns detail
down, and there is no control that turns it past `full`. Its unit tests are what hold it to the
`ScenePlanet` shape in the meantime.
