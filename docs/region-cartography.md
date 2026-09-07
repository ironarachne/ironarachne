# Region Map Cartography

This design document describes what the region map is trying to look like, and the drawing
vocabulary it needs in order to look like that. It covers the style target, the decisions taken to
reach it, and — in [Domain model](#domain-model) — the types of the new `cartography` library those
decisions require.

**Status:** proposal. The [domain model](#domain-model) has not been reviewed. Implementation of
[the plan](#the-plan) does not start until it has been, per the design process in `CLAUDE.md`.

Tracked as [#229](https://github.com/ironarachne/ironarachne/issues/229), which holds the release
gate: **no version is promoted to staging or prod while that issue is open.**

## The problem

`/region` was assessed Release-ready under #62 against `docs/workshop.md`, section by section. That
assessment was sound on its own terms — it covered the seed path, the artifact kind, the editor,
composition, mobile widths and the exports. What it did not cover is whether the map the tool draws
is good enough to put in front of someone, and it is not.

The map is not in production. `deploy/staging.version` and `deploy/prod.version` both read `2.5.0`,
and in `v2.5.0` the `/region` catalog entry carried no `maturity` field and `region_presentation.ts`
did not exist — there was no map on the page and no SVG export. Both arrived in `f0030696` (2026-09-02),
which is unreleased. The exposure is that the next release ships it.

### What the current renders show

Reproduce with `npm run render:region -- --svg-out <path> --seed <seed>` on `alpha`, `bravo` and
`charlie`. These three seeds are the reference set for the whole of [the plan](#the-plan); every
change is judged against them.

**Structural** — coastlines and lake outlines are visibly polygonal, straight segments meeting at
sharp corners. The jitter in `cornerLoopToVertices` and the displacement in `inkEdge` both exist and
neither is close to sufficient: the underlying segments are cell-boundary length, so jittering their
midpoints yields a polygon with slightly wavy sides. Terrain region fills show their own cells; on
`charlie` the Voronoi cells in the mountain band are individually countable.

**Scatter** — trees carpet the entire map including open grassland, so the forest fills beneath them
read as nothing; on `alpha` forest and plains are visually identical. `charlie`'s mountain band is a
pile of stacked peaks and trees. The land biome symbols (`·`, `,`, `∴`) read as dust.

**Text** — `charlie` draws the label "Adalin" through the map title. `bravo`'s "Alestor's Rest" and
`charlie`'s "Lotfobend" run off the right edge with letters cut. Labels sit on their own markers.

**Linear features** — rivers are a grey-green that reads as land rather than water, they do not
taper with flow volume although `MapEdge.river` carries it, and both rivers and roads terminate
abruptly in open country.

**Absent** — frame, margin, compass rose, scale bar, cartouche. Content bleeds to the viewBox edge.

## The style target

**The Tolkien/novel-endpaper tradition**: pen and ink line work on parchment, near-monochrome sepia,
terrain carried by drawn glyphs rather than by fill colour, generous empty space.

Explicitly _not_ the age-of-exploration tradition (ornamental borders, sea monsters, heavy
cartouches), and _not_ the modern coloured-relief sourcebook look that the renderer currently
approximates. The present palette — sage `#c2d7c2` forest at 0.42 opacity, slate blue water, warm
grey mountain bodies — is the thing being replaced, not tuned.

This is an aesthetic bar. It cannot be settled by assertions, and the project has deliberately not
added region maps to `goldens.yaml`, so **each work item is judged by a human rendering the
reference seeds and looking at them.** Where a property _is_ measurable — no label outside the
viewBox, no near-coincident glyph pair — it is asserted in tests as well, because a regression
nobody is looking for should not need a human to catch it.

## Decisions taken here

**1. Terrain is carried by glyphs, not by fill.** The forest and mountain region fills are deleted
rather than given organic edges. A forest is its trees; a range is its peaks. This is what the style
target calls for, it is a far smaller change than smoothing those boundaries, and it removes the
cell-edge problem instead of solving it. The consequence is that glyph density becomes the entire
terrain signal, which is why the scatter work depends on the fills being gone first.

**2. Region membership is still computed, just not drawn.** `makeRegionContainmentTest` and the
component tracing stay. Placement still has to know where a forest is, in order to keep a tree
inside one. Deleting the fill is a drawing change, not a model change.

**3. The sea is line hatching, not a fill.** Strokes parallel to the coast, thinning seaward. This
is new drawing machinery rather than a palette change, and it is the item most likely to be
underestimated: offsetting a closed curve inward repeatedly breaks on narrow inlets, where offset
curves cross. It also has an output-size constraint — see decision 7.

**4. The ink vocabulary is a library, not a set of constants.** The alternative was module-level
constants in `region_map_svg.ts`. Rejected because the work is split across eight issues that all
touch colour, and the failure mode is five slightly different browns. A shared library also gives
the dungeon renderer and any future settlement map somewhere to draw from — but the abstraction is
designed against the region map alone and should not be widened speculatively.

**5. The palette lands first, alone.** One work item establishes the ink vocabulary and converts the
renderer to it, with no other behaviour change, before anything else starts. Everything downstream
is then drawn in the final language rather than being restyled afterwards.

**6. The renderer stays a pure function of the stored graph.** `buildRegionMapSvgString(map, options)`
takes no RNG; its variation comes from `hash01(a, b, c)` over node ids. `RegionSnapshot` stores the
map graph and no seed, and `region_presentation.ts` renders saved regions straight from that
snapshot. Nothing in this work may introduce a dependency on a seed that saved artifacts do not
carry — where Bridson's needs an RNG, it gets one derived deterministically from the map itself.
This keeps the persisted shape untouched and needs no migration.

**7. Output size is a design constraint, not an afterthought.** The map reaches the page as a
`data:` URL through `regionMapDataUrl`, and the current SVGs are 130–200 KB. A hatching pass that
emits thousands of short `<line>` elements bloats the DOM on `/region` and every exported file with
it. Prefer few long paths to many short ones, and state before/after sizes when changing a drawing
pass.

**8. Deliberate overlap is preserved.** `appendScatterSymbolsBackToFront` sorts glyphs by base `y`
so that a symbol nearer the bottom of the map covers the ones behind it — a painter's-algorithm
depth cue that only works if glyphs overlap. The target is no _near-coincident stacking_, not no
overlap; a spacing radius below the silhouette half-width, tuned by eye.

**9. The map is an `<img>`, and stays one.** Inlining the SVG was tried and reverted: the map's
paths are drawn in viewBox units and extend past the viewBox that clips them, so
`getBoundingClientRect` reports each at full geometry — up to 1,888px inside a 320px phone — and
`pages.mobile.spec.ts` reads that as horizontal overflow. A frame drawn at the viewBox edge is fine;
one drawn outside it is not.

### Open question

**What does a map unit mean?** A scale bar needs miles or leagues per map unit, and the region
generator defines no such relationship anywhere. Either the region gains a physical extent — which
is a change to generated data and therefore outside this document's rendering-only scope — or the
scale bar is dropped. Recommendation: drop it rather than invent a number. Recorded here so the
decision is made deliberately rather than by omission.

## Domain model

The new library, and the parts of `$lib/map` it draws for. `Parchment`, `Ink` and `EdgeTreatment`
are the vocabulary; `InkedPath` is what a caller hands over; `Hatching` is the sea's own case.
Nothing here is persisted — these types exist only during a render.

```mermaid
classDiagram
    class Cartography {
        +Parchment ground
        +InkPalette palette
        +EdgeTreatment edges
    }
    class Parchment {
        +string fill
        +string grainFilterId
        +number grainOpacity
    }
    class InkPalette {
        +Ink body
        +Ink secondary
        +Ink text
        +Ink water
    }
    class Ink {
        +string color
        +number opacity
    }
    class StrokeWeight {
        <<enumeration>>
        hairline
        fine
        medium
        heavy
    }
    class EdgeTreatment {
        +EdgeMethod method
        +number amplitude
        +number depth
        +displace(Vertex[]) Vertex[]
    }
    class EdgeMethod {
        <<enumeration>>
        midpointDisplacement
        chaikin
        catmullRom
    }
    class InkedPath {
        +Vertex[] points
        +Ink ink
        +StrokeWeight weight
        +boolean closed
        +toSvg() string
    }
    class Hatching {
        +Vertex[] shoreline
        +number spacing
        +number falloff
        +number maxBands
        +toPaths() InkedPath[]
    }

    Cartography "1" o-- "1" Parchment : draws on
    Cartography "1" o-- "1" InkPalette : draws with
    Cartography "1" o-- "1" EdgeTreatment : roughens with
    InkPalette "1" o-- "4" Ink : names
    InkedPath "*" --> "1" Ink : drawn in
    InkedPath "*" --> "1" StrokeWeight : drawn at
    EdgeTreatment "1" --> "1" EdgeMethod : uses
    Hatching "1" --> "*" InkedPath : produces
```

How the region map consumes it. `RegionMap` and its members are existing types, unchanged — the
arrows show what the renderer reads in order to emit paths, not new associations.

```mermaid
classDiagram
    class RegionMap {
        +number width
        +number height
        +MapNode[] nodes
        +MapEdge[] edges
        +MapCorner[] corners
    }
    class MapNode {
        +number id
        +Vertex center
        +Polygon polygon
        +number elevation
        +boolean isWater
        +string biomeId
    }
    class MapEdge {
        +number river
        +number road
    }
    class WaterRegion {
        +Vertex[] outline
        +boolean isOcean
    }
    class ScatterGlyph {
        +string symbolId
        +Vertex anchor
        +number scale
        +number rotation
    }
    class RegionMapDrawing {
        +InkedPath[] coastlines
        +Hatching[] seas
        +ScatterGlyph[] glyphs
        +InkedPath[] rivers
        +InkedPath[] roads
        +Furniture furniture
    }
    class Furniture {
        +number marginUnits
        +InkedPath frame
        +CompassRose compass
    }

    RegionMap "1" o-- "*" MapNode : holds
    RegionMap "1" o-- "*" MapEdge : holds
    RegionMap "1" --> "*" WaterRegion : traced into
    RegionMap "1" --> "*" ScatterGlyph : scattered into
    WaterRegion "1" --> "1" Hatching : hatched by
    RegionMapDrawing "1" o-- "1" Furniture : framed by
```

### What the diagrams settle

- **`Ink` and `StrokeWeight` are separate.** A coastline and a river may share an ink and differ in
  weight; keeping them one type would force a new entry per combination.
- **`EdgeTreatment` is a strategy, not a function.** Which of midpoint displacement, Chaikin, or
  Catmull-Rom produces the best coastline is not yet settled, and the amplitude has to be
  independent of cell size or the roughness will vary with `pointSpacing`. Naming the method as data
  keeps that choice changeable without touching callers.
- **`Hatching` takes a shoreline, not a region.** It is defined by the curve it follows, which is
  what makes it reusable for a lake and correct after the coastline work changes that curve.
- **There is no `Legend`.** An endpaper map generally does not carry one, and adding the type
  invites building it.

## The plan

Dependency order. Items 2, 6 and 7 can run in parallel once 1 lands; 3 waits on 2; 5 waits on 4.
`src/lib/map/region_map_svg.ts` is 1,767 lines and items 1–4 touch most of it, so the ordering is
not advisory.

| #   | Issue                                                         | Work                                                        |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | [#230](https://github.com/ironarachne/ironarachne/issues/230) | The `cartography` library, and the renderer converted to it |
| 2   | [#231](https://github.com/ironarachne/ironarachne/issues/231) | Organic coastlines and water outlines                       |
| 3   | [#232](https://github.com/ironarachne/ironarachne/issues/232) | The sea as line hatching                                    |
| 4   | [#233](https://github.com/ironarachne/ironarachne/issues/233) | Drop the terrain region fills                               |
| 5   | [#194](https://github.com/ironarachne/ironarachne/issues/194) | Rework the glyph scatter                                    |
| 6   | [#234](https://github.com/ironarachne/ironarachne/issues/234) | Label placement and the map title                           |
| 7   | [#235](https://github.com/ironarachne/ironarachne/issues/235) | Rivers and roads                                            |
| 8   | [#236](https://github.com/ironarachne/ironarachne/issues/236) | Cartographic furniture                                      |

Furniture is last because it frames finished content: adding a margin changes the drawable area,
which changes where every glyph, label and coastline sits.

## Scope

This document is about **rendering**. The terrain simulation — `elevation.ts`, `water.ts`,
`climate.ts`, `biome.ts` — and the placement of settlements and roads are out of scope, and the
`/region` tool's own readiness assessment under #62 stands. If work under [the plan](#the-plan)
uncovers a defect in what the map _is_ rather than in how it is drawn — a river that flows uphill, a
road routed to a settlement that no longer exists — that is filed separately rather than absorbed
here.
