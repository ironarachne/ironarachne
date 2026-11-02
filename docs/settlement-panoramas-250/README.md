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
representative wall materials, known biome names, unknown-biome fallback, architecture availability states,
same-input equality, seed variation, bounded L-system expansion and XML validity.

An alternate `panorama-review-alternate` matrix took 1.15 seconds, with a maximum of 425,281 bytes
and 19,991 segments. These two measurements bound the reviewed samples, not every possible input.
The final projection distinguishes domes (a single apex with curved meridians) from extruded barrel
roofs.

`npm run verify` passes on the final implementation: 562 files, 7,783 tests, zero type errors, clean
lint, and all 101 per-library coverage gates. The focused browser checks pin the seed and use reduced
motion so sidebar resize transitions do not contaminate the layout measurement. Both routes pass
at 1280px and 320px.

The clean full browser sweep completed in 16.5 minutes: 693 passed, five opt-in golden cases skipped,
and three astronomy tests failed (one comparison included a transient loading message; two timed
out). All three passed on a sequential retry. After the final generator-only opt-in correction,
a fresh build passed six targeted checks: both panorama routes, regional save/export/reopen with
no banners in the vault editor, and those three astronomy retries. No astronomy source or test
expectations were changed. All five mobile projects passed the settlement and region routes.
