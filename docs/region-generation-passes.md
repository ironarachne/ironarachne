# Deterministic region generation passes

**Status:** implemented under the accepted [Regions release contract](regions-release-contract.md),
for #329. This uses the existing approved semantic model; it adds no persisted types or payload version.

## Problem and decisions

The previous region generator shared one RNG across geography, settlement composition, realm names,
and presentation. A new draw in one part shifted unrelated later output. Name generators also held
closures over the caller's RNG, so replacing only `config.rng` did not isolate a stage.

Generation now captures one root token from the caller's RNG and derives independent named streams
from the tuple
`['region-passes-v1', rootToken, stageName]`. Child seeds never depend on stage execution order or draws
made by a sibling. Same seed and configuration reproduce the entire saved payload; this refactor
intentionally changes newly rolled results. Existing snapshots are never regenerated on read.

The passes run in this order:

1. **Physical geography:** the existing shared profile, environment, elevation, water, climate and
   biome passes produce the saved graph. A regional land area records actual node elevations.
2. **Geology:** #338 generates up to four coarse rock/process provinces on `geology`, covering
   dry land and saving compatible petroleum settings before deposit selection. Existing surface-rock
   draws and physical map generation remain unchanged. See [resources and geology](region-resources.md).
3. **Habitats:** habitats rank dry-land cells by realized biome prevalence. Up to four connected
   zones identify major patches, with stored node membership and terrain, climate and water evidence.
   See [spatial habitats](region-habitats.md) for selection and identity rules.
4. **Ecology inhabitants:** #335 selects a bounded set of flora, fauna and supported fantasy life
   from local habitat observations using `ecology-inhabitants`. Saved occurrences merge repeated
   source/role combinations. See [regional ecology](region-ecology.md).
5. **Resources:** #338 selects at most three compatible geological deposits per province, keeping
   trace presence distinct from workable/rich concentration. The bounded raw inventory combines
   deposits with locally supported ecology, water and cultivation sources. Availability, catalog
   links and explicit absent/unknown assessments are saved. Oil/gas extraction is not a claim of
   current technology or industry.
6. **Habitation:** settlements, roads, organizations and realms consume the realized environment and
   map. Name pattern inputs are reconstructed with this stream, including supplied culture patterns.
   Settlement identities and placement reasons are recorded. Lakes and ocean are excluded; an
   unplaced settlement is rejected. Low-elevation fallback sites have an explicit fallback reason.
7. **Ecology relationships:** #336 uses `ecology-relationships` after habitation to select up to
   two interactions per major habitat and six overall. Feeding requires compatible saved organisms
   supported by the same cell; material use cites an existing site role and connected habitat access.
   Qualitative cold-browse constraints cite named cooling periods from the saved climate. Inhabitants,
   settlements and geography remain unchanged.
8. **Notable places:** a river landmark cites the freshwater fact and reuses its saved anchor.
   #332 adds terrain and inhabited sites; #336 adds bank-gathering hazards supported by current
   material-use relationships and explicit dangerous organisms. All share the four-place cap.
9. **Presentation:** #333 composes an overview from realized terrain, dominant habitats, a supported
   settlement site cause, resources, a road connection and a localized hazard. Choices use only the
   presentation stream. Empty optional systems and stale facts contribute no filler.

Every generated semantic fact carries a versioned `fantasy:region:*:v1` rule ID and references to
saved observations or prior facts. A random choice decides among supported candidates; randomness
is never evidence for a physical claim. Ore claims cite newly saved geological settings and deposits. Navigability, port, crossing and
economic claims still require their own supporting facts.

## Domain model

The persisted domain model is the accepted `RegionFacts`, `RegionArea`, `HabitatFact`, `ResourceFact`,
`SettlementRoleFact`, `NotableFact`, `FactReason` and `FactSource` model in
[the release contract](regions-release-contract.md#domain-model), including its accepted resource
extension. #329 added no fields to that model; #335 extends it with the approved ecology facts.
`RegionGenerationStage` identifies each RNG boundary rather than a saved fact.

## Terrain contract

The map generation algorithms and #249 thresholds are retained. As recorded in the workflow audit,
finished maps do not always achieve the requested altitude/relief profile. The physical pass checks
actual median elevation, relief spread, and mountain fractions using the existing map classifiers.
A mismatch is explicitly explained in the regional land fact rather than silently remapping the
saved graph. Downstream facts use actual map observations. Enforcing all nine profile combinations
remains a terrain-generation defect to resolve in the release acceptance work. The environment
record retains its original profile-based description; the regional overview instead uses the
realized map classifications, so it does not repeat that mismatch.

## Verification

Tests compare full plain snapshots, validate their semantic references, and inject extra random draws
into each later pass. Geography and earlier facts remain identical, while downstream facts may
legitimately change when their input fact changes. Tests also check river evidence, absence of
fabricated water facts, and rejection of geography without habitable land.
