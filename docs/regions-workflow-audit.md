# Regions workflow audit (#327)

**Status:** completed audit, 2026-09-29. Baseline commit: `69e75a3a`. This records the current
implementation before the [Regions release work](https://github.com/ironarachne/ironarachne/issues/322)
changes its data model. It is not a new design or an implementation of those changes.

## Reproduce the baseline

Run `npx vite-node scripts/audit_region_baseline.ts alpha audit-0 audit-4 audit-6 5pkjdquccl04i`
from the repository root. Each output line is JSON for one seed. The script uses the page's
`rollRegionSnapshot(seed)` path, renders the same SVG and Markdown as the page, and measures the
plain-text input to its PDF export. Dimensions are the page defaults, 40 × 30 drawing units;
there is no physical distance scale. Times below are one warm-process run on the audit host, not
benchmarks or service-level targets. Sizes are UTF-8 bytes; gzip is only a comparison for the
JSON payload, not the IndexedDB storage format. The map JSON is included in the full payload.

| Seed            | Why keep it                         | Climate; overview biome               | Overview terrain → map median / spread    | Land cells; dominant biome               | Generate / SVG ms |
| --------------- | ----------------------------------- | ------------------------------------- | ----------------------------------------- | ---------------------------------------- | ----------------: |
| `alpha`         | Cartography reference; high terrain | continental; alpine tundra            | hilly, mid-altitude → 1.112 / 0.195       | 173; alpine tundra 98 (57%)              |           93 / 88 |
| `audit-0`       | Low, flat, continental              | continental; temperate grassland      | flat, low-altitude → 0.141 / 0.140        | 181; temperate grassland 95 (52%)        |           83 / 53 |
| `audit-4`       | Tropical, wet, low and hilly        | tropical; flooded grassland           | hilly, low-altitude → 0.247 / 0.250       | 172; flooded grassland 106 (62%)         |           72 / 51 |
| `audit-6`       | Mountainous overview                | temperate; temperate deciduous forest | mountainous, mid-altitude → 0.720 / 0.503 | 168; temperate deciduous forest 96 (57%) |           70 / 64 |
| `5pkjdquccl04i` | Original #249 regression seed       | temperate; mangrove forest            | mountainous, mid-altitude → 0.645 / 0.465 | 150; mangrove forest 83 (55%)            |           66 / 67 |

The overview terrain labels above come from `environment.description`. Map median and spread are
`measureRegionTerrain` values over land cells. The current output for `5pkjdquccl04i` is **not**
the original low, flat, tropical example in [#249](https://github.com/ironarachne/ironarachne/issues/249):
seeded generation changed during its repair. Preserve the seed as a regression, but assert the
accepted contract against the current output rather than comparing it to the old screenshot.

| Seed            | Graph nodes / edges / corners | Settlements / realms / organizations |  Full JSON / gzip | Map JSON |     SVG | Markdown / PDF text |
| --------------- | ----------------------------: | -----------------------------------: | ----------------: | -------: | ------: | ------------------: |
| `alpha`         |               207 / 611 / 405 |                            6 / 8 / 3 | 555,347 / 104,339 |  432,847 | 106,723 |       4,880 / 4,808 |
| `audit-0`       |               211 / 625 / 415 |                            6 / 9 / 3 | 572,361 / 107,562 |  444,356 | 113,016 |       4,944 / 4,873 |
| `audit-4`       |               205 / 604 / 400 |                            5 / 8 / 3 | 535,287 / 101,216 |  426,482 |  99,026 |       4,370 / 4,301 |
| `audit-6`       |               211 / 615 / 405 |                            6 / 5 / 3 | 541,248 / 106,117 |  436,891 | 126,334 |       4,648 / 4,583 |
| `5pkjdquccl04i` |               205 / 607 / 403 |                            8 / 4 / 3 |  541,314 / 99,695 |  428,178 | 120,527 |       5,059 / 4,992 |

This is the current page path and SVG size. The older `alpha`/`bravo`/`charlie` SVG figures in the
[cartography reviews](region-cartography.md) used a 60 × 35 CLI map and earlier code, so their sizes
are not comparable to this table.

## Current path and what already works

1. [`RegionGenerator.svelte`](../src/components/locations/RegionGenerator.svelte) owns the seed,
   name-set choice and optional saved culture/settlement references. It calls
   [`rollRegion`](../src/lib/regions/region_roll.ts), which creates a local seeded RNG and records
   the resolved name set for provenance. The `/region` route and workshop panel use this component.
2. [`regions.ts`](../src/lib/regions/regions.ts) chooses one altitude/relief profile and latitude,
   generates an [`Environment`](../src/lib/environment/environments.ts), builds a Voronoi
   [`RegionMap`](../src/lib/map/builder.ts), then runs elevation, water, temperature, moisture and
   biome passes. It locates settlements by suitability, connects them with roads, and composes
   organizations and realms. `region.description` is a copy of `environment.description`.
3. [`region_snapshot.ts`](../src/lib/regions/region_snapshot.ts) stores the complete graph,
   environment and composed snapshots as payload version 2, omitting referenced culture/settlement
   copies. [`region_artifact_kind.ts`](../src/lib/regions/region_artifact_kind.ts) validates it;
   [`region_rehydrate.ts`](../src/lib/regions/region_rehydrate.ts) reads it. The workshop registry
   supplies the saved artifact's editor and seeded reroll.
4. [`RegionArtifactEditor.svelte`](../src/components/locations/RegionArtifactEditor.svelte) and
   [`region_editing.ts`](../src/lib/regions/region_editing.ts) edit region prose, realm text and seat,
   settlement text, and organization text. The map is shown as dimensions/count only and is not
   editable. Edits do not recompute dependent fields; a full reroll is destructive.
5. [`region_presentation.ts`](../src/lib/regions/region_presentation.ts) builds one gazetteer for
   Markdown and PDF text, and sends the saved graph to
   [`region_map_svg.ts`](../src/lib/map/region_map_svg.ts) for page preview and separate SVG
   download. The page PDF uses `downloadTextPdf`; project PDF publication consumes the same
   Markdown through [`project_publication.ts`](../src/lib/pdf/project_publication.ts). Neither PDF
   path embeds this map as part of the region text entry.

The current map already uses the approved [cartography vocabulary](region-cartography.md):
parchment, coast ink, water hatching, classified hill and peak symbols, routes, bounded labels,
frame, title and compass. The missing scale bar and legend are deliberate decisions, not gaps.
The [#249 terrain contract](region-environment-coherence.md) already has a shared landform
classifier in `$lib/map`, a dedicated hill symbol, and a dominant-biome map policy. The old claim
that region generation and its map have no common physical inputs is no longer true.

## Verified gaps and inconsistencies

| Finding                                                                       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Release consequence                                                                                                                                                                        |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Selected terrain profile is not enforced against the finished map.            | `regions.ts` passes the profile to environment and elevation generation but never calls `measureRegionTerrain` for a postcondition. `alpha` says hilly/mid-altitude while its map is high/flat by the accepted bands. `audit-4` says hilly/low while the map is mid/flat. `audit-6` says mountainous, but only 7.7% of land cells are mountain or high mountain, below the required 15%. The #249 seed has spread 0.465 and 9.3% mountain/high mountain, also below the mountainous contract. | Treat the accepted #249 finished-map invariants as an unresolved input to #329/#348, despite #249 being closed. Do not invent new thresholds in region facts.                              |
| Dominant biome is present, but local climate compatibility is not guaranteed. | `regions.ts` passes the overview biome with a 0.6 target fraction to `assignBiomes`; smoothing leaves 52–62% in these fixtures. `audit-0` has 85 tundra land cells alongside 95 temperate grassland; the #249 seed has 34 boreal and 25 montane forest cells around 83 mangrove cells.                                                                                                                                                                                                        | New habitat claims need evidence from actual map cells and climate values, not the overview biome alone.                                                                                   |
| Settlement placement has geography, but roles and causal reasons are absent.  | `randomSettlements` scores fresh water, flatness, temperature and non-ocean land, with a non-ocean fallback, then stores `mapNodeId`; roads connect placed towns. The payload has no crossing/port/market role or reason, and the capital is settlement index 0.                                                                                                                                                                                                                              | #331 can build on stored nodes/roads while adding semantic IDs and roles; #329 must keep fallback cases explainable.                                                                       |
| Narrative and realms are mostly parallel composition.                         | `populateRegionInhabitants` copies environment prose, organizations receive the environment, and `addRealmsToRegion` names the region from its main realm. Realm parent/seat links are array indices; no stored area, habitat, landmark, hazard, or causal relationship exists in `RegionSnapshot`.                                                                                                                                                                                           | #328–#333 should add the approved `RegionFacts` model without replacing existing snapshots or assuming a name is an ID.                                                                    |
| Editing can leave visible fields out of sync.                                 | `setRegionMainRealm` changes only an index; renaming/removing settlement 0 does not update its map marker role, and `regionToMapSvg` still marks index 0 as capital. The editor intentionally does not recompute authored prose.                                                                                                                                                                                                                                                              | #347 needs explicit dependency/staleness behavior and stable settlement IDs; preserve user edits.                                                                                          |
| Gazetteer is a list, not a sourcebook explanation.                            | `regionToDocument` writes environment prose, ruler, realms, settlements and organizations. It does not interpret map cells, routes or reasons. The PDF text is the same content; SVG is a separate export.                                                                                                                                                                                                                                                                                    | #333 should render fact-grounded overview and area sections in both Markdown and PDF while keeping the SVG separate, as the [accepted release contract](regions-release-contract.md) says. |
| The old map CLI is stale.                                                     | [`scripts/render_region_map.ts`](../scripts/render_region_map.ts) calls `getDefaultConfig()` without its required RNG. A seeded invocation overwrites the missing RNG and works, but an unseeded invocation throws in `chooseTerrainProfile`. Its 60 × 35 map and separate name-set path also differ from the page defaults. The page and this audit script use `rollRegionSnapshot`.                                                                                                         | Adjust a maintenance issue or #348 to repair the unseeded CLI and distinguish its large-map review output from page fixtures.                                                              |

## Coverage and proposed issue adjustments

Existing unit tests cover seeded region rolls, snapshots/migration, pure edits, presentation, map
classification, roads, biomes and rendering. [`e2e/region.spec.ts`](../e2e/region.spec.ts) covers
generate → save → reopen → edit, map download and deterministic rolls;
[`e2e/region_map_labels.spec.ts`](../e2e/region_map_labels.spec.ts) checks label bounds, and mobile
page coverage includes `/region`. The audit's fresh 2026-09-29 coverage run passed 6,438 unit tests
and the per-library gate (99 libraries, all at or above 80%). Summed lines/functions are regions
259/278 (93.2%) and 71/73 (97.3%), environment
491/512 (95.9%) and 124/125 (99.2%), map 1343/1383 (97.1%) and 230/237 (97.0%). The known missing assertion is the whole finished-map
profile and biome/climate contract across contrasting seeds; the current #249 seed test only checks
dominant biome ≥50%, and checks flat/low bounds conditionally on words that seed no longer contains.

Proposed adjustments to the already planned [#322](https://github.com/ironarachne/ironarachne/issues/322)
issues, for review before implementation:

- **#328:** migrate version 2 snapshots without rewriting graph or authored prose; validate spatial
  references and semantic IDs against the saved graph.
- **#329 and #348:** carry the approved #249 nine-profile postconditions into generation and
  end-to-end checks. Pin `alpha`, `audit-0`, `audit-4`, `audit-6` and `5pkjdquccl04i` as contrasting
  fixtures, and assert biome/climate compatibility for habitat evidence. This is a verified gap in
  the completed #249 work, so track it explicitly rather than assuming the close state proves it.
- **#331:** state how placement fallback yields a valid role or no role, and replace index 0 as the
  sole source of capital identity once settlement IDs exist.
- **#333:** keep map SVG separate, but use one fact-grounded document model for page, Markdown and
  both PDF paths; include an export comparison in acceptance checks.
- **#347:** define how seat changes, settlement edits/removal and partial regeneration affect
  reasons, prose and map markers while retaining authored edits.
- **#348 or a small maintenance issue:** repair unseeded `render:region` and document its separate
  60 × 35 comparison path before future cartography reviews.

No release issue needs to rebuild the approved cartographic style or add a scale bar, map editor,
second genre, or duplicate terrain classifier.
