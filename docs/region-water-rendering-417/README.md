# Water rendering review for #417

The [approved design](../region-water-rendering.md) is implemented using the existing
vector cartography pipeline. These Chromium captures show each fixture before (left)
and after (right), with both maps at their normal 900-pixel output width.

These are the initial implementation's images. The subsequent
[land-side hatching correction](land-hatching-correction/README.md) moves cross-hatching
out of the water onto land, as clarified on 2026-10-13.

## Comparisons

- [Open ocean](ocean-comparison.png): stronger coast, irregular broken ripples, sparse
  wave groups with pointed crests and curved troughs, and title/compass clearance.
- [Lake](lake-comparison.png): darker medium-width shoreline, small projections and
  inlets, light cross-hatching patches, two broken ripple bands, and no wave glyphs.
- [Narrow peninsula](inlet-comparison.png): opposing shores retain a simple outline;
  added detail reduces locally instead of crossing the adjacent shore.
- [Alpha](alpha-comparison.png), [bravo](bravo-comparison.png), and
  [charlie](charlie-comparison.png): generated regions with lakes, crop boundaries,
  settlements, rivers, roads, labels, and terrain glyphs. These seeds have insufficient
  offshore space for waves; the open-ocean fixture exercises their placement.

## Reproduction

Run `npx vite-node scripts/render_region_water_review.ts --out /tmp/region-water-review`
to write the six SVGs and warm-render metrics. The script uses the same caller-owned
seeded configuration as `scripts/render_region_map.ts` for alpha, bravo, and charlie.
The focused boundaries live in `test_fixtures/region_water_maps.ts`.

Before images and metrics come from parent commit `5616d657b1787ffa9989c13f7b8fbf700b2662e6`, with the same review script
and fixtures copied into a temporary baseline checkout. After images use this change.
Each timing is the median of five renders after warming once. Timings are illustrative
local measurements and sensitive to concurrent work; SVG sizes are exact.

| Fixture          | Before bytes | After bytes | Before ms | After ms |
| ---------------- | -----------: | ----------: | --------: | -------: |
| Ocean            |       13,456 |      41,804 |      12.8 |     32.7 |
| Lake             |       10,598 |      23,516 |       6.2 |     14.5 |
| Narrow peninsula |       18,113 |      61,346 |      19.5 |     50.0 |
| Alpha            |      310,706 |     341,087 |     186.5 |    193.0 |
| Bravo            |      368,937 |     395,533 |     168.7 |    183.5 |
| Charlie          |      375,109 |     406,366 |     160.0 |    175.1 |

The generated map SVGs grow 7–10% and retain their existing size budgets. Equal inks
share path attributes while separate `M` commands preserve every intentional gap.
Small isolated water fixtures grow proportionally more because new decorations make
up a larger share of their SVGs.

## Validation

7,103 unit tests pass. Type checking reports zero errors and warnings, formatting and
lint pass, and the coverage gate passes for all 100 libraries without exemptions.
The new composer has focused tests for whole-stroke containment, exclusions between
sampled vertices, irregular curved runs, shore patches, ocean/lake classification,
crop edges, narrow water, scale invariance, equivalent loops, and nonmutation.
Map tests verify shared geometry, stronger coast paint, batched open ripple runs,
water-layer ordering, reserved furniture, and deterministic full SVG output.

The full desktop and mobile browser run completed with 663 passes, five optional
golden-image tests skipped, and two failures. The WebGL context-reuse test hit a
settings-control timeout and passed when rerun separately. The gazetteer test compared
whitespace-collapsed `innerText` with verbatim exported prose; it now compares source
`textContent` and pins the failing seed, and its focused rerun passed. That correction
preserves the exact export-text assertion.

Following the requested pointed-wave revision, geometry tests additionally verify
two acute crests per stroke and curved central troughs. Whole-stroke clearance includes
the bounded miter tip. All 14 affected browser reruns passed after this revision,
covering map display and SVG export, gazetteer export, seven pinned label fixtures,
and region layout at 320, 360, 375, 390, and 430 pixels. `npm run verify` passed again
after this revision: 7,103 unit tests, zero type errors or warnings, clean lint, and
all 100 library coverage gates.
