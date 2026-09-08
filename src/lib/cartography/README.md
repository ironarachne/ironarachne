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

The edge strategy's amplitude and depth describe this preserved implementation; they are not
runtime tuning controls. Organic coastline strategies, `InkedPath`, and `Hatching` from the accepted
model belong to subsequent issues. This extraction deliberately retains even the legacy loop's
omission of subsequent original corners, so #230 does not silently change geometry.
