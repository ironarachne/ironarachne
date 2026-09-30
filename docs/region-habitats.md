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
habitat. Ocean and lake cells are excluded. Counts refer to cells, not physical acreage.

Within each biome, neighbor links identify connected patches. Up to four major zones are selected:
first the largest patch of each of the four most prevalent habitats, then additional disconnected
patches in descending size if slots remain. Patch-size ties use the smallest node ID. Minor patches
and habitats still retain their complete footprints in habitat anchors; zones need not cover all
land. `area:land` remains first for existing resource consumers. Settlement roles can reference
both the regional land and the new zones.

Zone names and descriptions locate their centroid within thirds of the saved map's width and
height; these are coarse drawing directions, not geographic coordinates or surveyed boundaries.
Descriptions report the existing altitude classifier applied to median elevation, observed
temperature and moisture ranges, coast flags and river edges touching either side of a cell.
Reasons store the observations and dependencies supporting those claims. A biome label is an
observation, not a new assertion of climate compatibility: existing biome assignment limitations
remain part of #348 and the workflow audit.

Habitat IDs encode the biome name; zone IDs use the smallest member node ID. All traversal,
footprints and ties are sorted explicitly. The pass uses no randomness, while retaining its stage
RNG parameter. Fixed seeds repeat the full payload, and adding unrelated draws or reordering graph
arrays cannot change derived facts. IDs belong to the saved map; a fresh map rebuilds the fact set.
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
