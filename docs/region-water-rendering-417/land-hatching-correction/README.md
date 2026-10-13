# Land-side shoreline hatching correction

The initial #417 implementation placed cross-hatching inside the water. The intended
placement is on land beside the shoreline, clarified on 2026-10-13.

The correction reverses the shore-normal offsets and checks the complete strokes
against the land side of the processed boundary. Neighboring water bodies are supplied
as exclusion footprints alongside labels and furniture. The renderer reuses the crisp
`terrain-tone-land` mask so hatches cannot appear in any water body. The dark coast
paints over the near-shore ends of the marks.

The domain model and saved-data shape are unchanged. Ripples and pointed wave glyphs
retain their existing geometry and water clips.

## Visual review

Each comparison shows the merged implementation on the left and the corrected
placement on the right:

- [Lake shore detail](lake-shore-detail.png): enlarged shore crop showing paired
  light cross-hatches on the land side.
- [Lake](lake.png): intermittent patches follow the outside of the lake shore.
- [Ocean](ocean.png): shore patches move onto the coastal land beside the dark outline.
- [Alpha](alpha.png): corrected placement in a generated map with settlements,
  rivers, terrain glyphs, and labels.

Reproduce the SVGs with `npx vite-node scripts/render_region_water_review.ts --out
/tmp/region-water-review`. Before images come from merged commit
`120aa8aab79940b9162914507ae6dea9b206885d`; after images use this correction.

## Verification

The focused cartography and map tests pass, including new regressions checking that
hatch points are outside water, stay clear of neighboring water/reserved footprints,
and use the land mask while ripples retain water clips. Existing tests cover stable
output, source-loop equivalence, scale invariance, concave shores, and crop edges.
`npm run verify` passes: 7,105 unit tests, zero type errors or warnings, clean lint,
and all 100 library coverage gates. Browser-suite results are recorded in the
follow-up pull request.
