# Settlement illustrations

Pure, deterministic sepia panorama SVGs derived from saved settlement semantics. Both generator
views use the same 1000 × 300 scene. Sky, ridges, ground, vegetation and building projection are
procedural; forests use bounded stochastic L-systems. No external assets or rendering service.
Buildings are side-on elevations: a single wall face and roof silhouette, with no isometric side
walls or receding roof planes. Saved roof forms, pitch, eaves, materials and openings remain visible.
Leaf clusters use flat shading without outlines; trunks, branches and other vegetation retain line work.

`buildSettlementPanorama(input)` owns a local seeded RNG. Helpers share that instance;
`renderSettlementPanorama(scene)` only serializes. Category population bounds come from the supplied
category. Architecture comes from saved examples; legacy/unavailable architecture yields landscape
only. Rendering never generates or changes architectural traits or persisted data.

`resolvePanoramaProfile` exposes biome/scale decisions; `sceneSegments` measures drawing complexity.
See `docs/settlement-panoramas.md` for the approved model and acceptance requirements.

Review: `npx vite-node scripts/render_settlement_panoramas.ts --out /tmp/settlement-panoramas`.
The script explicitly supplies a curated material palette, producing 48 category/biome specimens
and reporting total generation time, maximum SVG bytes, and segment count.
