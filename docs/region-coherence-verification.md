# Region coherence verification

**Status:** implemented for #348. Verification exercises the existing accepted model; it adds no
persisted fields or generation policy.

## Fixed fixtures

`test_fixtures/region_seeds.ts` is shared by library and browser tests. These are the actual
`rollRegionSnapshot` page defaults (40 × 25), with the seed-selected name set. They are deliberately
small in number and assert relationships rather than snapshotting every generated sentence.

| Seed            | Contrast                                 | Required observed habitat  |
| --------------- | ---------------------------------------- | -------------------------- |
| `alpha`         | Coastal woodland; dry coastal cells      | temperate deciduous forest |
| `bravo`         | Arid **pockets** within a montane region | cold desert                |
| `foxtrot`       | Wetland woodland                         | mangrove forest            |
| `charlie`       | Realized mountainous terrain             | alpine tundra              |
| `5pkjdquccl04i` | Original #249 regression seed            | boreal forest              |

The regression seed now rolls a boreal region, not the historical tropical mangrove result. Keeping
it tests the current complete public generation path; copying the old description onto its new map
would assert a false contract. The arid fixture has a secondary cold-desert habitat, not an entirely
arid regional overview. The test requires its footprint to exist and its cells to carry that biome.

## Automated evidence

`region_coherence.test.ts` checks every fixture's complete payload under two clock values and an
unrelated reopening RNG. Every semantic identity is unique; generated reasons have versioned rule
IDs and current supporting references. Saved map-node, map-edge and environment observations agree
with the actual snapshot (rock/soil inventories compare as unordered sets). The real validators
check cross-system links from habitats and ecology through deposits, resources, processing,
livelihoods, supply, sites, routes and notables.

Additional assertions verify deposit occurrence compatibility with the saved geological province,
placement inside that province, cultivation temperature/moisture/biome bounds, road/river evidence,
and overview agreement with measured terrain and the dominant mapped habitat. Products, daily life
and supply must actually be exercised, so an empty implementation cannot pass the suite.

For each fixture, a settlement rename preserves map geometry and identities, retains an authored
overview, exposes stale explanations, and survives JSON and codec reopening. Markdown, the text
used for PDF presentation, and SVG labels reflect that same reopened snapshot. Pre-facts version-2
saves migrate with empty legacy facts, preserving their map, environment, settlements and authored
prose. Existing artifact-kind tests cover actor migration and every subsequent payload version.

`region_transfer.test.ts` saves edited fixtures in IndexedDB, exports an artifact, imports it into
a second project through the real region registry, and reads it back. Artifact identity is reminted;
local semantic identities, provenance, geometry, authored text and stale reasons are preserved.
The resulting Markdown and SVG match the source artifact exactly.

`e2e/region.spec.ts` generates each fixed seed on `/region`, saves it, opens its workshop editor,
edits realm and settlement names and the overview, saves, reloads, and verifies both text and
review warnings. It checks the current #347 decision that only whole-region reroll is available.
The existing route tests also download SVG, Markdown and PDF and reproduce a locked seed.

`e2e/region_map_labels.spec.ts` includes the bank and retains delta/echo for additional label shapes.
It measures actual browser font bounds, marker/cartouche/compass collisions, viewBox containment
and the rasterized parchment rim. It writes a map screenshot for visual review in each test's
output directory. The existing mobile route suite checks the region at all five supported widths.

## Visual review

The five bank screenshots were inspected on 2026-10-02. Settlement labels remain readable within
the frame; capitals are distinguishable from other settlements; no label is clipped at the border
or collides with the title panel, compass or settlement markers. Small hamlet labels are naturally
smaller than capital labels. Woodland, mangrove and alpine/boreal glyphs differ as expected. Terrain
ink is dense in places, so this is a label review rather than a claim that every cartographic detail
is ideal. The label tests retain exact font and collision assertions; no whole-image baseline is
introduced.

## Known release limitations

The terrain-profile defect identified in [the workflow audit](regions-workflow-audit.md) remains a
physical-generation limitation, not an evidence or persistence failure. `charlie` has mountainous
measured relief, but only 11.49% mountain/high-mountain cells, below #249's accepted 15% minimum.
Other fixtures also miss requested profiles. `recordPhysicalFacts` explicitly records these
mismatches, and overview tests assert the realized terrain. This verification does **not** declare
all nine requested terrain profiles compliant or weaken their thresholds.

The arid fixture establishes cross-system coherence for cold-desert pockets. It does not demonstrate
a wholly desert region. These limits remain relevant to release acceptance even when all automated
checks pass. Partial regeneration remains deliberately unavailable under the implemented
[#347 decision](region-edit-consistency.md); tests verify that decision rather than inventing a
partial regeneration contract.

## Preview command

The workflow audit also found that unseeded `render:region` called `getDefaultConfig` without its
required RNG. The command now creates one seed-owned RNG and threads it through defaults, names
and generation. An omitted seed uses the clock only at this CLI entry point; a supplied seed is
repeatable. Both invocation forms were checked; two seeded SVG outputs compared byte-for-byte equal. This remains a separate 60 × 35 terminal-review
configuration with tiefling names, not a reproduction of the page fixture bank.

## Validation run

On 2026-10-02, the `verify` stage passed: 496 unit-test files, 6,749 tests, all 99 libraries above
80% coverage, and zero type errors or warnings. The full `verify:all` browser run completed with
655 passed, five existing opt-in/environment skips and three failures, all in the new saved-edit
flows. All five mobile widths and all seven map-label cases passed.

The three failures were action timeouts during eight-character sequential typing in the larger
saved editors, which redraw their gazetteers on each input event. The tests now fill the prefix
and type the final character, retaining a real keyboard-binding assertion while avoiding repeated
full redraws. A focused rerun of all nine region browser tests passed. This verifies persistence
and edit correctness; sustained typing performance in large editors remains outside that assertion.
The full browser suite was not rerun after this test-only adjustment; its three failed cases were
triaged and verified by the focused rerun.
