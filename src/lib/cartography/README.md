# Cartography

Shared sepia ink, parchment, named stroke weights, and deterministic edge treatment for map
renderers. Implements the vocabulary in `docs/region-cartography.md` for issue #230.

Import through `$lib/cartography`. `CARTOGRAPHY` holds the ground, four ink roles, and the boundary
strategy. `STROKE_WIDTHS` expresses hairline, fine, medium, and heavy strokes in map units: terrain
edges, glyph outlines/roads, rivers, and coastlines respectively. `INK_WASH` is one temporary sepia
wash shared by existing terrain and water fills; later issues remove those fills. Glyph bodies use
parchment so the existing back-to-front overlap stays legible.

`cartographyFilterDefs(width, height)` returns the parchment grain and ink displacement filters;
include it once inside SVG `<defs>`. `parchmentRect(width, height)` draws the filtered ground.
`MASK_PAINT` contains coverage values, not visible inks.

`CARTOGRAPHY.edges.displace(points, cornerIds)` preserves the renderer's existing boundary
subdivision, including its chord-relative jitter and graph-id salts. Callers resolve graph corners
before calling it; this library knows nothing about `RegionMap`. Omit identities for a standalone
loop to use point indices. Supply an unclosed loop (do not repeat the first point).
`hash01` and `toBipolar` also serve existing river jitter and glyph placement, without an RNG or a
seed added to saved artifacts.

The legacy edge strategy's amplitude and depth describe its preserved implementation; they are
not runtime tuning controls. It retains the old loop's omission of subsequent original corners
until terrain fills are removed in #233.

Water uses `createWaterEdgeTreatment(width, height)` instead. This is a separate `EdgeTreatment`
with method `chaikin`: uniformly resample, round with three Chaikin passes, add smooth periodic
noise, and resample to a maximum segment length of `0.3 * min(width, height) / 35`. Noise amplitude
is bounded by `0.22 * min(width, height) / 35`. Equivalent loops have identical output regardless
of graph ids, winding, starting vertex, and collinear subdivisions. Neither strategy mutates input.

Water boundaries are clipped to a padded crop before smoothing, including vertices far outside
the map, so unbounded Voronoi cells cannot inflate the output or create diagonal coastlines.
The viewBox clips the remaining geometry. `createHatching({ shoreline, spacing, falloff, maxBands }, width, height)` returns the approved
`Hatching` model. `toPaths()` samples an interior distance field and traces up to eight inset bands,
using a grid step of `min(width, height) / 175`. Marching squares splits contours at narrow necks;
joined contours are rounded at grid scale and simplified before serialization. Increasing spacing
and decreasing opacity leave open water mostly empty. Off-crop closing edges do not produce bands.

Each contour is an `InkedPath` with points, ink, weight, a closed flag, and `toSvg()`. The serializer
emits one unfilled path per connected contour. The region renderer chooses four ocean bands, two
closer lake bands, and no bands for small lakes. It defines each coastline once for reuse by SVG
strokes, clips, and masks; no water wash remains.
