# Stored regional facts on the illustrative map

**Status:** implemented for #343 under the accepted
[Regions release contract](regions-release-contract.md).

## Domain model

The accepted `HabitatFact`, `NotableFact`, `SpatialAnchor`, `RegionSettlement` and `RegionMap`
model applies unchanged. Rendering derives optional `RegionMapSvgFeature` inputs from saved facts;
these drawing inputs are not persisted. No artifact version, migration, editable map layer or
physical distance is added. Feature IDs and names come directly from the saved payload.

## Selection and drawing

Settlements keep their existing rings, capital star and population-based label priority. Their
markers and placed names carry `data-feature-id` with the saved settlement ID. Habitat and notable
labels carry the same attribute with their saved fact ID. Names are XML-escaped.

Up to four anchored notables precede up to three major habitats, ranked by footprint size with
stable ID ties. Blank names, unresolved anchors, water-only footprints, oversized labels and
crowded placements are omitted. Missing optional facts leave the legacy drawing usable.
Settlement markers, names and the cartouche are hard obstacles for optional features. Optional
features cannot overlap one another's text or markers. A notable symbol is drawn only when its
label fits. The compass reserves the resulting labels and markers too.

An anchor's saved node IDs, and cells incident to its saved edge IDs, determine its footprint.
The nearest dry member cell to the footprint centroid provides the illustrative label location;
it cannot fall in an invented location between disconnected patches. Landmark diamonds and hazard
triangles remain smaller than the capital star. Terrain glyphs beneath those symbols are omitted
from the illustration for clarity, without changing the map graph. Habitats add text only, retaining
the existing terrain symbol vocabulary and sepia palette.

The Markdown/PDF document includes the saved habitat names and descriptions, omitting the section
when empty. Existing landmarks and hazards already use their stored names. Rendering and exports
never regenerate facts or rewrite authored text. The CLI now uses the same snapshot-to-SVG path as
the page and result vault, including semantic capital selection and optional facts.

## Verification and cartography review

Unit fixtures cover identity and escaping, distinct symbols, edge anchors, sparse node IDs,
missing/water/blank/oversized facts, settlement priority, bounded selection, input-order stability,
legacy maps and immutability. Presentation tests compare current map names with exported prose.
Browser label checks include notable symbols and verify optional text does not overlap other text.

[Alpha, bravo and charlie comparisons](region_cartography_343/README.md) follow the existing
cartography fixtures. These are review illustrations, not golden replacements.
