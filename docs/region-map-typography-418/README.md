# Region typography review — #418

The model and visual direction were approved on 2026-10-13. These comparisons use the same
saved geography and names before and after the typography change. The implementation is ready
for human visual review; this record does not claim that review has happened.

## Reference maps

| Seed    | Before                       | After                      |
| ------- | ---------------------------- | -------------------------- |
| Alpha   | [Before](alpha-before.png)   | [After](alpha-after.png)   |
| Bravo   | [Before](bravo-before.png)   | [After](bravo-after.png)   |
| Charlie | [Before](charlie-before.png) | [After](charlie-after.png) |

## Controlled maps

| Study                                                                        | Before                            | After                           |
| ---------------------------------------------------------------------------- | --------------------------------- | ------------------------------- |
| Settlement hierarchy, village capital, long title, area arc, italic landmark | [Before](places-before.png)       | [After](places-after.png)       |
| Named river with a confluence and winding channel                            | [Before](river-before.png)        | [After](river-after.png)        |
| Legacy river geometry                                                        | [Before](legacy-river-before.png) | [After](legacy-river-after.png) |

Editable/exportable vector examples: [settlements and places](places-after.svg),
[named river](river-after.svg), [mountain range](range-after.svg).

The waved and nicked scroll reserves both projecting rolls, including their outline and fold shading. Towns, boroughs, cities, metropolises, and capitals use
explicit small-cap runs with preserved word spacing; the controlled village capital demonstrates that capital status is
independent of category. Point landmarks are italic and 15% larger. Forest, area, range, and
river inscriptions try one shallow quadratic arc, with straight placement as a crowded or
unusable-geometry fallback. Thicker parchment outlines provide negative space around the letters. Forest and mountain
names overlay their masses, preserving canopy and ridge artwork. Label bounds still protect
text from other text and furniture; furniture and point symbols reserve terrain space. Crowded labels no longer accept text overlap.

The three reference seeds have no eligible named river routes or mountain-range facts, so those
previews use controlled saved facts. The river previews use an
explicit authored route anchored to the controlled physical channel. Physical channels receive
no invented names. Saved river names and anchors, including edits, reach the map through
`regionToMapSvg`; stale route evidence is omitted.

## Reproduction

Run `npx vite-node scripts/render_region_typography_review.ts /tmp/region-typography-418`.
The script saves a snapshot per reference seed and reuses that exact snapshot on later runs.
Controlled maps come from `test_fixtures/region_typography.ts`. Pass `after --controlled-only`
after the output directory to render only controlled fixtures, as the browser tests do.

The before SVGs were captured using the renderer at starting commit `fa67772f`. PNGs are rasterized
with `rsvg-convert`. Initial `textPath` output disappeared in that exporter; the final serializer
positions and rotates graphemes explicitly along the same quadratic baseline. Browser SVG,
canvas rasterization, and librsvg previews all show the curved inscriptions. Decomposed accents
stay with their base glyph, and original saved spelling remains in accessible text and metadata.
The region PDF export contains prose, so its existing tests check that separate export path.

## Validation

`npm run verify:all` passed on 2026-10-13 after the visual refinements:

- Svelte and TypeScript: zero errors and warnings; formatting and lint passed.
- 7,161 unit tests passed; all 100 libraries met the 80% line/function coverage gate.
- 671 browser tests passed across desktop and all five phone widths; five opt-in golden-image
  checks were skipped as configured. The browser suite took 11.6 minutes.
- The typography checks measure real glyph bounds, visible small-cap word gaps, the complete
  projecting scroll footprint, and actual curved-label pixels through the SVG/image/canvas path.
- Regression checks compare named and unnamed forest canopy and mountain marks, confirming that
  geographic labels preserve the underlying masses.

The broad run exposed a pre-existing no-op edit in the heraldry save/reopen test: a randomly
generated device can already be per pall. That test now selects a different division before
checking that Save becomes enabled, and retains its persistence and derived-blazon assertions.
It passed three focused repetitions and the complete suite. No heraldry product code changed.
