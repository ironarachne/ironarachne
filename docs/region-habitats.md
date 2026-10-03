# Spatial regional habitats

**Status:** implemented for #330 under the accepted
[Regions release contract](regions-release-contract.md).

## Problem and decisions

The initial habitat pass grouped all dry-land cells by biome but gave no spatial subdivisions
or dominant habitat. The new pass consumes the same saved graph without changing terrain,
water, climate or biome assignment, and requires the physical pass's `area:land` fact.

Habitats are ordered by dry-land cell count, with lexical biome-name ties. The first is described
as dominant; all others are secondary. This is mapped prevalence, independent of the environment's
requested dominant biome. Unclassified cells count toward total dry land but produce no invented
habitat. Ocean and lake cells are excluded. Counts are internal inputs, not narrative statistics.

Within each biome, neighbor links identify connected patches. Up to four major zones are selected:
first the largest patch of each of the four most prevalent habitats, then additional disconnected
patches in descending size if slots remain. Patch-size ties use the smallest node ID. Minor patches
and habitats still retain their complete footprints in habitat anchors; zones need not cover all
land. `area:land` remains first for existing resource consumers. Settlement roles can reference
both the regional land and the new zones.

Zone names and descriptions locate their centroid within thirds of the saved map's width and
height; these are coarse drawing directions, not geographic coordinates or surveyed boundaries.
Descriptions use narrative prose for terrain, location, coasts and rivers, without cell counts,
edge terminology, numerical ranges or zone-selection diagnostics. Climate comparisons are omitted
unless the local and other same-biome dry-land ranges do not overlap and their median values differ by at
least 5 °C or 0.25 moisture units. Only relative phrases (warmer, cooler, wetter or drier than comparable
areas) appear in the narrative; a landscape with no comparison area has no climate
sentence. This conservative rule intentionally omits climate details for most landscapes.
The shared narrative engine selects defining and distinctive candidates before wording, with a
three-sentence budget and one sentence per topic. Climate sentences compete for one topic slot;
ordinary altitude is omitted from habitat descriptions, while the regional-land entry retains the
overall terrain context. Sentence pools belong to the regional adapter. Reasons store dry-land
observations, including comparison areas, so edits invalidate comparisons and local descriptions. A biome label is an
observation, not a new assertion of climate compatibility: existing biome assignment limitations
remain part of #348 and the workflow audit.

Habitat IDs encode the biome name; zone IDs use the smallest member node ID. All traversal,
footprints and ties are sorted explicitly. Geographic classification uses no randomness. Prose uses the existing stage
RNG. Fixed seeds repeat the full payload; changing prose draws affects wording and focus while
leaving footprints, identities and evidence intact. Reordering graph arrays leaves both stable. IDs belong to the saved map; a fresh map rebuilds the fact set.
Existing saved facts load as written, with no migration or regeneration.

## Domain model

This uses the approved `RegionArea`, `HabitatFact`, `SpatialAnchor`, `FactReason` and `FactSource`
[domain model](regions-release-contract.md#domain-model). No persisted types, fields or versions
are added. `RegionArea.mapNodeIds` stores each connected zone; `HabitatFact.anchor.nodeIds`
stores its complete biome footprint and `areaIds` links to regional land and selected zones.

## Verification

Focused fixtures verify disconnected patches, dominant and secondary ranking, ties, a four-zone
limit, retained minor habitats, sparse graph IDs, node/neighbor order independence, water exclusions,
missing biome data and the absence of invented water claims. They check recorded evidence and prose
against known climate/elevation/water values. Existing generation tests repeat full seeded snapshots,
validate semantic references and inject extra RNG draws into stage boundaries.
