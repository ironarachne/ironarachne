# Settlement panorama review — #250

Reviewed November 2, 2026. The implementation uses 10:3 banners in both generator views, following
user approval of `docs/settlement-panoramas.md`.

The CLI produced a 48-image matrix: six categories across deciduous forest, grassland, desert,
wetland, coastal, boreal, alpine and unknown biomes. All six category sheets were inspected in
Chromium. Representative [hamlets](hamlets.png) and [metropolises](metropolises.png) are retained here.
Building count and occupied area increase with settlement size; vegetation, humidity and relief
change the surrounding composition. Fine architectural detail deliberately disappears at phone size.

The specimen generator supplies an explicit curated building-material palette. This is review input,
not a claim that those resources are local to every biome. The coastal specimens have unavailable
architecture and correctly retain only landscape. Saved examples are repeated rather than inventing
extra storeys, temples, walls or different materials to make a city skyline.

Actual generator pages were also inspected at 1280px and 320px, including a region with seven banners.
Images decoded successfully and measured 812 × 243.59px on desktop and 280 × 84px on mobile; document
width remained equal to viewport width. The [standalone phone](standalone-mobile.png) and
[regional desktop](region-desktop.png) captures demonstrate landscape-only fallback for records
without supported architectural examples. Initial page generation uses a fresh seed; these captures
are inspection evidence, not golden-image baselines.

This is a visible product limitation: an ordinary settlement with unknown building resources can
have no generated architectural examples, so its banner has no buildings. This follows the accepted
architecture contract. Supplying a default material palette or inventing generic buildings would
change that contract and is not silently done by the image renderer.

The full matrix took 1.76 seconds including SVG serialization and writing 48 files while other test
jobs were running. Maximum output was 401,913 bytes and 19,949 path segments (limit 20,000). These are
local measurements, not a mobile performance guarantee. The regional component still generates SVG
synchronously; lazy image loading defers decoding, not scene construction.

Reproduce the matrix with:

```bash
npx vite-node scripts/render_settlement_panoramas.ts --out /tmp/settlement-panoramas
```

The default seed is `panorama-review`; `--seed` produces another reproducible specimen set. Open the
output's `index.html` in a browser. Test coverage includes all current roof forms, window shapes,
material families, known biome names, unknown-biome fallback, architecture availability states,
same-input equality, seed variation, bounded L-system expansion and XML validity.
