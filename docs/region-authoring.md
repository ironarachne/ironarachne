# Regional data flow and rule authoring

**Status:** implemented documentation for #349. The accepted
[Regions release contract](regions-release-contract.md) defines the domain and release boundary;
this guide describes the code that exists today. The fuller sourcebook assembly in
[#344](https://github.com/ironarachne/ironarachne/issues/344) is still pending.

## Follow one result through the system

`rollRegion(seed, config, culture)` in `src/lib/regions/region_roll.ts` resolves naming inputs and
calls `generate` in `regions.ts`. That orchestrator generates the graph, composed objects and
semantic facts. `toRegionSnapshot` converts the composed objects to plain storage forms;
`validateRegionSnapshot` checks the payload, including the semantic graph. The artifact records
seed/config provenance and cross-artifact references beside the payload. `regionFromSnapshot`
rebuilds runtime objects from saved values, without rerunning regional passes or rewriting text.

| Data               | Stored form                                                                 | Derived or resolved use                                                                   |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Physical geography | `RegionMap` nodes, edges, corners and dimensions; realized `Environment`    | SVG from the saved graph; terrain measurements through shared map helpers                 |
| Regional meaning   | `RegionFacts` lists, local IDs, anchors, descriptions, origins and reasons  | Inspectors and context APIs follow those IDs; they do not reroll facts                    |
| Composed content   | Embedded culture, settlements, realms, ruler and organizations as snapshots | Their owning libraries rehydrate them; realm types resolve by saved name                  |
| Overview           | `RegionSnapshot.description`, including an intentional blank                | Initially generated in the presentation pass; reopening and exporting keep the saved text |
| Other artifacts    | `ArtifactReference` entries beside the payload                              | Consumers resolve `targetId` and `role`; the regional codec does not fetch them           |
| Output             | No stored SVG or `RegionDocument` in the region payload                     | Map, Markdown and PDF text are assembled from the current snapshot                        |

A cached artifact preview is separate from the region payload. It is not the source of geography
or evidence. Map width and height are drawing units, not miles, travel times or economic quantities.

## Generation order and seed boundaries

`generate` consumes one 32-character root token from `config.rng`. `createRegionStageRng` derives
each child with `new RNG(JSON.stringify(['region-passes-v1', rootToken, stageName]))`.
These names are part of the reproducibility contract:

| Order | Stream                  | Owner and saved result                                                                                                   |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1     | `physical-geography`    | `regions.ts`: environment, elevation, water, temperature, moisture and biomes; `recordPhysicalFacts`: realized land area |
| 2     | `geology`               | `region_geology.ts`: coarse geological provinces                                                                         |
| 3     | `habitats`              | `region_habitats.ts`: biome footprints and connected named areas                                                         |
| 4     | `ecology-inhabitants`   | `region_ecology.ts`: supported flora, fauna and fantastical inhabitants                                                  |
| 5     | `resources`             | `region_resources.ts`: deposits and qualified raw-resource inventory                                                     |
| 6     | `habitation`            | `regions.ts` and `region_settlement_roles.ts`: settlements, roads, organizations, realms, site roles, routes and claims  |
| 7     | `ecology-relationships` | `region_ecology_relationships.ts`: explicit feeding and material-use links                                               |
| 8     | `processing`            | `region_processing.ts`: complete possible production chains                                                              |
| 9     | `livelihoods`           | `region_livelihoods.ts`: supported settlement daily life                                                                 |
| 10    | `supply`                | `region_supply.ts`: limitations and conditional import suggestions                                                       |
| 11    | `notable-places`        | `region_notables.ts`: grounded landmarks and hazards                                                                     |
| 12    | `presentation`          | `region_overview.ts`: saved overview prose                                                                               |

The habitat pass accepts its stream but currently draws no randomness. Naming generators are
rebuilt from stored pattern inputs on the habitation stream, including supplied culture patterns;
their closures must not retain a sibling pass's RNG. Use the pass's supplied RNG, sort candidates
and resolve ties by stable identity before drawing. Never use a clock seed or `Math.random`.

Separate streams isolate random consumption, not dependencies: changing habitats can legitimately
change later ecology. Replaying a section is not a supported editing API. Only a whole-region
reroll is available; it replaces authored contents after the saved editor's destructive confirmation.
See [pass details](region-generation-passes.md) and [edit consistency](region-edit-consistency.md).

## Identity, evidence and references

All semantic fact IDs are unique within one region, with prefixes enforced by `regionFactsError`
in `region_facts.ts`. Embedded settlements have separate `settlement:` IDs saved in
`{ id, snapshot }` wrappers. Retain these IDs on edits or reorderings. Do not use names or current
array positions as relationship keys. Generated habitat and zone IDs derive from biome identity
and the smallest member node ID; see [habitats](region-habitats.md).

`SpatialAnchor` cites node and edge IDs in this exact saved map. `areaIds`, `habitatIds`, product
inputs and other semantic links cite facts in this same region. `FactReason` records a versioned
rule ID, `current` or `stale` status, and sources: an observed environment field, observed node or
edge property, or another fact ID. Store the tested observation, not just a plausible sentence.
Rule IDs are data for inspection, never executable instructions on load. A rule change needs a
new versioned ID for newly generated reasons; old saved explanations keep their original IDs.

`SettlementTarget` distinguishes `{ kind: 'embedded', settlementId }` from
`{ kind: 'artifact', targetId }`. The latter is an external identity, not a local fact ID or a
promise that an artifact resolves. The owning consumer handles missing references. Generation of
processing and daily-life facts currently requires embedded settlement sites; an unresolved named
settlement cannot establish access or local production.

`toRegionSnapshot(region, { cultureIsReferenced: true })` stores no culture copy.
`referencedSettlementName` is the existing conversion option for omitting a supplied settlement;
it removes matching embedded entries through `removeRegionPlace`, also removing generated direct
dependents and staling retained reason dependents. It throws if authored dependencies would be lost.
The name option is not a semantic relationship key. Store the external `ArtifactReference` beside
the snapshot. The codec returns a referenced culture as `null` and does not reinsert settlements.
Current region document/map functions render embedded snapshot content; callers must explicitly
resolve references for any additional presentation. A provenance reroll generates its own names
instead of resolving a culture that may have changed.

Generic validators check shapes, typed variants, uniqueness, links and anchors. Fantasy catalogs,
local suitability, craft policy and domain postconditions belong to the generators and their
evidence helpers. Preserve unknown saved recipe/product keys and species labels through their
stored explanatory text; this does not mean unknown schema variants or versions are accepted.

## Migrations and authored content

The current artifact payload version is **8**; `RegionFacts.version` is **6**. They version
different layers. `migrateRegionSnapshot` accepts payload versions 1–7 and validates the result:

| Input payload | Migration to the current schema                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1             | Migrate legacy actors, settlements and organizations; wrap settlements with local IDs; add empty `legacy` facts                                                       |
| 2             | Wrap settlements with local IDs; add empty `legacy` facts                                                                                                             |
| 3 (facts 1)   | Preserve facts; add empty ecology, geology, deposit, product, daily-life and supply lists; old resources gain `unknown` availability and empty deposit links          |
| 4 (facts 2)   | Preserve ecology and other facts; add empty geology, deposit, product, daily-life and supply lists; old resources gain `unknown` availability and empty deposit links |
| 5 (facts 3)   | Preserve geology/resources; add empty product, daily-life and supply lists                                                                                            |
| 6 (facts 4)   | Preserve products; add empty daily-life and supply lists                                                                                                              |
| 7 (facts 5)   | Preserve daily life; add an empty supply list                                                                                                                         |

Every path produces facts version 6. No migration selects inhabitants, discovers deposits, fills
empty categories, rewrites the map or generates reasons. Preserve text, identity and existing
evidence. A new persisted shape requires the repository's approved design process, version changes,
validator changes and migration tests; adding a rule within existing types does not itself require
a payload bump.

Saved field edits do not regenerate. Use `region_editing.ts` and `region_resource_editing.ts`
instead of mutating a snapshot in place. Their dependency traversal protects authored dependencies,
removes generated direct dependents where appropriate and stales retained explanations transitively.
Inventory changes also invalidate negative supply assessments: additions can contradict an absence
claim even when no old positive source link points to the new fact. Direct inventory additions must
mark affected supply reasons stale before validation/saving. Free prose and facts without reasons
need manual review; changing a name does not automatically rewrite copied words in the overview.

## Presentation boundaries

`generateRegionOverview` runs once at the end of a roll. It consumes realized terrain and supported
saved facts, then saves the selected wording as `description`. It is distinct from
`regionToDocument`, which arranges stored content each time a snapshot is exported.

`regionToDocument` includes the overview, optional embedded culture, ruler, review warnings,
landscape, flora/fauna, inhabitants, livelihoods, notable places, travel, hazards, realms,
settlements and organizations. Empty list sections disappear. `regionToMarkdown` and
`regionToText` share that document; PDF export uses the latter. `RegionGazetteer` renders the
same paragraphs and section lines on the generator and in the saved editor.

Presentation does not replay generation or rewrite saved descriptions. Settlement targets and
route endpoints are resolved by identity to current names. Generated daily-life entries are
represented once per settlement/category and supply once per settlement; all authored entries
survive this selection. Explanation links open the complete saved facts and their recorded
support, including entries omitted from the short gazetteer. Stale facts retain their text with
an explicit review notice instead of presenting their evidence as current.

The generator's presentation and exports include currently resolved culture/settlement inputs;
its persistence snapshot still stores references rather than copying those artifacts. A saved
snapshot with empty legacy facts keeps its overview and existing places without fabricating
new sections. Heraldry and detailed ruler presentation remain expandable on the generator.

`regionToMapSvg` passes the saved graph, current embedded settlement names and capital role to
`buildRegionMapSvgString`; the capital role retains identity across settlement reorderings, with
a first-settlement fallback for legacy data lacking site roles. `regionMapDataUrl` wraps the SVG
for an image. The renderer draws an illustration; it neither chooses habitats nor establishes
ecological support, source access, navigability or economic claims. Notable anchors do not promise
an SVG marker. Use shared map classification and evidence helpers instead of reproducing glyph,
coastline or label-placement logic in a rule.

## Extend a rule

### Add a habitat or habitat-supported inhabitant

1. A physical biome belongs in `src/lib/environment/biomes/biome_classifications.ts` with explicit
   temperature, humidity and altitude ranges. Check its selection in `src/lib/map/biome.ts`.
   `generateHabitatFacts` automatically groups realized dry-land `biomeId` values; do not add a
   second biome decision in the renderer. A new physical catalog entry can change new seeded maps.
2. For a narrative habitat within existing geography, extend `region_habitats.ts` to select saved
   supporting cells and record a `HabitatFact`, area links, anchor and versioned observed reason.
   Retain full footprints, including disconnected patches; a named connected zone is a separate area.
3. If the addition means an organism in an existing habitat, use `region_ecology_rules.ts`, its
   explicit biome/environment aliases and producer/source metadata instead. The implemented flax
   rule is a concrete example: grassland, 10–25 °C and moisture 0.3–0.5 support a producer occurrence.
   `region_ecology.ts` rechecks the supporting cell against biome ranges. Required water and landform
   evidence must occur at that same suitable cell, not elsewhere in a disconnected habitat.
4. Extend `region_habitats.test.ts` or `region_ecology.test.ts` with supported and incompatible local
   fixtures, disconnected patches, stable ordering, valid anchors and unchanged upstream geography.

### Add a resource chain

1. Establish a raw input in the owning shared catalog: `plant_products.ts`,
   `species_resource_derivation.ts` or `geological_resources.ts` under `src/lib/resources`.
   If needed, extend `region_resources.ts` to save a supported occurrence, catalog identity,
   availability and deposit links. A catalog entry alone does not establish regional supply.
2. Add a qualitative `ProcessingRecipe` in `src/lib/resources/processing.ts`. Give the output a
   stable key, a versioned recipe ID, a family, technique, requirements and every material, fuel
   and water selector. For a small extension, follow `construction-components` after `sawn-timber`:
   a new woodwork output can consume the existing product key rather than repeat the raw-input rule.
   Shared resource catalogs must not import region types.
3. Use an existing supported technique or explicitly extend the fantasy policy in
   `region_processing_capability.ts`. The generator and supply assessor share that policy and input
   matching. `region_processing_resources.ts` supplies current reachable sources and eligible
   surface/shallow deposits. Do not substitute imports, deep oil extraction or name matching for
   missing support. Save all required intermediate steps within the depth-four, three-family and
   twelve-product bounds; the generator omits a chain that cannot fit.
4. Check `resolveProcessingChain` returns ordered saved products and explicit raw/imported leaves.
   Extend livelihood or supply need tables only if the new good should participate in those rules;
   representative product selection is not proof that unselected products cannot be made.
5. Add compatibility tests in `resources/processing.test.ts` and controlled chain tests in
   `regions/region_processing.test.ts`. Remove each required input in turn and expect omission;
   include stale/inaccessible sources, complete intermediate closure, deterministic selection and
   authored dependency protection. Supply tests should prevent false scarcity for unselected chains.

### Add a landmark or hazard

1. Extend a candidate builder in `region_notables.ts`, using saved map observations or current
   upstream facts. The existing `high-ground-obstacle` checks elevation at least 0.65 and records
   that elevation source. A sibling terrain rule can follow its `notable` helper without inspecting
   the renderer's mountain glyphs. A resource landmark should cite the resource fact and its anchor.
2. Save a stable `landmark:` or `hazard:` ID, kind, area links, node/edge anchor, versioned reason and
   a useful description with coarse compass location. A suggested hook is a possible activity;
   do not claim an unrecorded bridge, ruin, historical event, supplier or navigable route exists.
3. Join an existing candidate group and preserve sorted seeded selection: one selection per group,
   at most four places overall. The pass must leave upstream geography and facts unchanged.
4. Extend `region_notables.test.ts` with a positive fixture, the absent/below-threshold counterpart,
   water-only exclusions, valid source IDs, stable ordering and export preservation. Existing
   landmark/hazard sections consume saved descriptions; map marker work is a separate rendering change.

For a rule change, run its focused tests while iterating and `npm run verify` before opening the PR.
Rendering, component or route changes also require `npm run verify:all` before merging. See
[coherence verification](region-coherence-verification.md) for representative seeds and round trips.
