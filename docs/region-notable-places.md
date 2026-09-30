# Grounded regional landmarks and hazards

**Status:** implemented for #332 under the accepted
[Regions release contract](regions-release-contract.md). The existing `NotableFact`, `FactReason`
and `SpatialAnchor` model covers this pass; no domain-model extension or payload migration is needed.

## Domain model

The accepted [notable fact model](regions-release-contract.md#domain-model) applies unchanged.
Names, descriptions (including suggested adventure hooks), origin, reason and location are saved
plain data. Supporting semantic relationships use fact IDs; spatial anchors use the saved map's
node and edge IDs. Loading and exporting never regenerate these places.

## Rules and selection

The notable-places stream selects at most one candidate from each of four groups:

- Natural landmark: a located resource reach or a habitat study site, citing its resource or habitat.
- Inhabited landmark: an approach to an existing settlement site, citing its geographic role.
- River obstacle: an observed river incident to dry land, recording both river and road evidence.
  Descriptions distinguish a mapped road meeting water from an edge without a mapped road.
- Terrain or climate obstacle: elevation at least 0.65, temperature at or below 0 °C, or temperature
  at least 25 °C with moisture at most 0.2. These coarse fantasy rules support route planning,
  exposure and water concerns, respectively; they do not predict weather or describe verified passes.

Candidates and map nodes are sorted by stable identity before seeded selection. Unsupported groups
produce nothing. The pass never changes terrain, habitats, settlements, resources or routes.
Anchors and versioned reasons are stored with every selected place. A broad compass location makes
each description useful without the map. The illustrative SVG is unchanged; anchors refer to its
underlying saved graph, without adding a second location system or promising labeled map symbols.

Hooks are suggested activities (surveys, scouting, escorting, provisioning), not assertions that
unrecorded events have occurred. Settlement approaches reuse saved geographic roles. No structured
settlement history hooks exist in the approved input model, so this pass does not fabricate ruins,
ancient cultures, events, bridges, navigable rivers, deposits or a detailed history to fill that gap.

The generator and saved region view show the same stored notable facts. Markdown and PDF text
exports include separate Landmarks and Hazards sections and omit empty sections for legacy content.
Stale reasons receive a visible review note in the page; edit consistency and regeneration remain
#347's work.

## Verification

Focused tests cover observed thresholds, incident edges on either side, water-only exclusions,
missing locations, seeded variation, bounded selection, stable ordering, valid source/anchor IDs,
unchanged upstream data and exports. Browser tests compare displayed prose with downloaded prose
and ensure notable IDs survive saving and reopening.
