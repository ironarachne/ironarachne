# Tundra glyph visual review — #400

The human reviewer approved the [proposal and domain model](../region-tundra-display.md)
and the four [design specimens](specimens.svg) on 2026-10-12. The catalog implements the
approved vector sketches with the existing tapered-stroke expansion and footprint builder.

## Review artifacts

- [Design specimens](specimens.png): enlarged contours, illustrative small marks, sparse
  field, and existing hill/prairie/dune comparisons. These preceded implementation.
- [Controlled map](mixed.png), [SVG](mixed.svg), and [input fixture](mixed.json): top row,
  left to right, tundra plains, alpine tundra plains, tundra hills, alpine mountains;
  bottom row, ice cap, lake, boreal forest, high alpine mountains. The adjoining plain
  cells share a containment mask; hills and mountains retain relief, ice stays unmarked,
  and the lake supplies actual rendered water geometry.
- Seed `alpha`: [before](alpha-before.png), [after](alpha-after.png),
  [before SVG](alpha-before.svg), [after SVG](alpha-after.svg). Alpine tundra gains
  69 sparse marks; mountain ranges retain their relief silhouettes.
- Seed `bravo`: [before](bravo-before.png), [after](bravo-after.png),
  [before SVG](bravo-before.svg), [after SVG](bravo-after.svg). Tundra gains 42 marks;
  surrounding grassland, forest, lakes, rivers, settlements, and map furniture remain readable.

Generate the pinned maps with `npm run render:region -- --seed alpha --svg-out <path>`
and the same command with `bravo`. To reproduce the controlled SVG, pass the JSON fixture
to `buildRegionMapSvgString` through a `vite-node` script. The PNGs show the vector maps
at 1200 pixels wide, with a filename caption outside the map; SVGs remain the export artifacts.

## Visual findings and tuning

Inspected the enlarged specimens, controlled map, and generated before/after maps. Low,
broken snow contours and short branching scrub remain distinct from tall prairie blades,
rounded hills, angular peaks, and dune slip faces. The broad plain fixture leaves open
paper between marks. Pinned regions show subtle accents at ordinary map scale; their
smaller marks intentionally retain only the silhouette, not enlarged detail.

The approved starting profile required no tuning: scale factor 0.4, density ratio 0.3,
minimum fitting ratio 0.55, rotation limit 5 degrees, candidate spacing factor 1.1,
and the open-terrain minimum base size of `0.25 * mapScale`. Artwork is warm sepia,
uses no new body fills, and depicts a cartographic convention rather than seasonal facts.

## Validation

Focused tests cover biome normalization, relief precedence, water/ocean exclusion, ice
and unknown-biome exclusion, varied deterministic SVG, immutable inputs, shared tundra
containment, and clearance from an actual drawn lake. Existing catalog tests exercise
all four new variants for finite ink geometry inside their conservative footprints.

`npm run verify` passed: zero type errors or warnings, clean formatting/lint, 517 unit
files and 7,043 tests passed, and all 100 libraries met the 80% coverage gate. The additional
parameterized drawn-lake test also passed in a focused run; final edited files passed
formatting/lint checks.

`npm run verify:all` completed the full browser suite: 663 passed, five skipped, one failed
in 11.5 minutes. All mobile widths (320, 360, 375, 390, and 430 pixels) passed. The sole
failure is `e2e/region.spec.ts`'s gazetteer download test: Markdown omits an organization
description present in the displayed gazetteer. It occurs before PDF download assertions,
so that test did not establish PDF export success.

Confirmed that failure on an isolated archive of unchanged commit `efe41666`, with the
same test pinned to the captured seed `l3tk8birzx1sn`. Both builds omit the Varis Family
Trade and Navigation Company description from Markdown. An unpinned baseline run passed,
consistent with a content-dependent existing bug. No test assertion was weakened and no
export implementation was changed for #400. The full browser gate therefore remains red
for this independently reproduced export defect; this change has not been merged.
