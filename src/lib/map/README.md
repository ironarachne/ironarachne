# Map

This library builds a **procedural region map** as a topological graph and renders it to SVG. It is
the site's largest generation pipeline, and it runs in stages: build the graph, raise the land,
flow the water, set the climate, assign biomes, then lay roads across what resulted.

Each stage takes a `RegionMap` and returns one, so the pipeline reads as a sequence and each stage
can be tested on its own.

## The graph

The map is a Voronoi diagram over Poisson-disk points, built with
[`$lib/geometry`](../geometry/README.md), expressed as three related collections:

- **`MapNode`** — one region cell: its center, polygon, neighbors, and its geography (elevation,
  moisture, temperature, water/ocean/coast flags, biome id).
- **`MapCorner`** — a polygon vertex where edges meet, carrying interpolated geography. Rivers are
  computed on corners, because water flows along edges rather than through cell middles.
- **`MapEdge`** — the border between two cells, and the segment between two corners.

Corners within 0.1 map units are interned by distance, including across spatial-hash bucket
boundaries. Collapsed edges are removed from the cell ring, and polygons use the canonical corner
positions so their geometry agrees with the graph.

## Pipeline

| Stage                                 | What it does                                           |
| ------------------------------------- | ------------------------------------------------------ |
| `buildBaseMapGraph`                   | Points, triangulation, Voronoi, empty graph            |
| `assignElevation`                     | Raises land and averages corner elevations per cell    |
| `simulateWater`                       | Classifies water and flows rivers into ocean and lakes |
| `assignTemperature`, `assignMoisture` | Climate from latitude, elevation, and water            |
| `assignBiomes`                        | A biome per cell from its climate                      |
| `generateRoads`                       | Routes roads over the finished terrain                 |

## Features

- **Water simulation** — a cell is submerged when its elevation is below sea level or at least
  half its corners are below sea level. The builder's boundary-site cells seed the ocean; a flood
  fill reaches submerged neighbors, while disconnected submerged cells are lakes. Corner water
  flags follow their touching cells, and rivers stop at mapped ocean or lake shores. A river
  reaching an unmapped local minimum makes its touching cells lake water. Thus a low corner alone
  cannot masquerade as an ocean outlet in dry country. This changes seeded geography, including
  downstream settlement placement, from the pre-#244 simulation.
- **Types** — `RegionMap`, `MapNode`, `MapCorner`, `MapEdge`, `MapBuilderConfig`, and one config per
  stage (`ElevationConfig`, `WaterConfig`, `TemperatureConfig`, `MoistureConfig`,
  `BiomeAssignmentConfig`, `RoadConfig`).
- **Suitability** — `evaluateSuitability` scores a cell against what a settlement wants;
  `findBestLocations` returns the best cells for one. This is how settlements end up somewhere
  plausible rather than anywhere.
- **Road geometry** — `buildRoadCentroidPolylines`, and the distance queries
  `minDistanceSquaredToRoads`, `minDistanceSquaredToRivers`, and
  `minDistanceSquaredToRoadPolylines` (squared, so callers comparing distances can skip the square
  root).
- **Rendering** — `buildRegionMapSvgString(map, options)`. Water outlines use the shared
  cartography Chaikin strategy, with bounded noise at a scale set by map dimensions. Coast ink, water hatching,
  clips, and river cutouts reuse the same outline, defined once in SVG. Pale blue water sits beneath
  coast-following hatch bands. `terrain_tones` blends muted biome colors beneath the ink, darkens
  them using relative landform classification, and masks the blurred land at those same processed
  water outlines. Rivers share the water fill. Twelve terrain glyph families (high/ordinary mountains,
  hills, deciduous/conifer/palm trees, marsh, prairie, desert dunes, rocks, cacti, and oasis vegetation) each have four authored ink drawings.
  `terrain_glyph_catalog` owns their cubic pen curves, parchment bodies, and conservative
  control-hull footprints; `terrain_glyph_ink` expands tapered strokes into filled ribbons once
  per definition. Small intersecting hatch marks shade the appropriate drawings. Glyph scale fitting checks full
  silhouettes against that drawn water (with stroke/filter clearance), using row bins to avoid
  scanning every coast segment for every candidate. Terrain membership still uses the raw cells.
  Non-tree terrain uses the original Poisson candidates; forests use a separate deterministic
  stream at half the candidate distance. Both passes share variable glyph spacing, with partial
  overlap drawn in base-y order. `terrain_glyph_sizing` caps tree footprint width and height below
  the smallest permitted relief profiles across the map, including rotations and serialized scale
  rounding. Tree outlines use heavier brushwork than their interior details. See
  [region tree icons](../../../docs/region-tree-icons.md). Shared relative landform classification chooses high peaks, ordinary mountains, and hills.
  Peaks take precedence over wetland, wetland over hills, and hills over forest. Temperate
  grassland and prairie get sparse grass tufts; flooded grassland, freshwater wetland, and
  explicit marsh/bog/fen/swamp aliases get reeds. Supported deserts get low dunes on plains,
  craggy rocks on hills, and sparse cacti only on warm plains; cold deserts have no cacti.
  Small enclosed lakes surrounded by desert can receive one warm-shore oasis vegetation mark.
  `desert_terrain` derives eligibility from existing graph evidence; it never creates water or
  changes saved facts. All desert marks clear the drawn river banks and join disks as well as lakes.
  See [region desert display](../../../docs/region-desert-display.md). Other open plains remain bare. The local RNG is derived from map dimensions
  and node count, so saved graphs render without an extra seed. Candidate placement, density,
  variant choice, and styling use separate deterministic streams; changing the catalog does not
  consume candidate-placement draws. No terrain glyph record is persisted. Text uses conservative serif bounds
  including halo and rounding clearance. Labels stay within the sheet and outside marker footprints
  and the title cartouche; only other-label overlap is best-effort. Names that cannot fit are omitted.
  New maps save a versioned `RiverNetwork`, with directed reaches, actual local spring supplies,
  channel samples and widths, island polygons, and conserving terminal deltas. Narrow streams are
  solid tapered ink; larger channels have pale blue interiors and fine banks. Terrain-constrained
  curves retain road crossings and fall back to straight, narrower channels where necessary.
  `generateRiverGeometry` finalizes the network after roads, using a parent-owned RNG;
  `riverNetworkError` validates topology, conservation, graph bindings, geometry, and optional features.
  `riverEnvelope`, `isRiverWaterAt`, and the incoming/outgoing/outlet queries share that saved data.
  Maps without a network retain the historical `river_paths` drawing path; an empty present network
  draws no rivers. See [the river model](../../../docs/region-rivers.md) for storage and migration rules.
  Road leaves require settlements, water, or the crop; a faint continuous stroke joins their dashes.
  Rivers draw below terrain glyphs; roads draw above terrain glyphs and below markers and labels.
  A proportionally enlarged parchment sheet and two inset ruled lines frame every map. The drawing
  is explicitly clipped inside that margin. A north-up compass searches for space clear of the final
  label/marker reservations, terrain silhouettes, shores, and routes. No physical distance is defined,
  so the renderer omits a scale bar; the glyphs need no legend.
  Browser tests check actual font geometry against the emitted `data-text-box` reservations.

## Usage

```typescript
import {
  assignBiomes,
  assignElevation,
  assignMoisture,
  assignTemperature,
  buildBaseMapGraph,
  buildRegionMapSvgString,
  generateRoads,
  getDefaultRoadConfig,
  simulateWater,
} from '$lib/map';

let map = buildBaseMapGraph({ width: 1200, height: 900, seed, pointSpacing: 12, rng });

map = assignElevation(map, elevationConfig);
map = simulateWater(map, waterConfig);
map = assignTemperature(map, temperatureConfig);
map = assignMoisture(map, moistureConfig);
map = assignBiomes(map, biomeConfig);
map = generateRoads(map, townNodeIds, getDefaultRoadConfig());

const svg = buildRegionMapSvgString(map);
```

Roads come last because they connect **towns**: `generateRoads` takes the node ids the settlements
sit on and runs Prim's algorithm over terrain-aware shortest paths between them, so where the
settlements went decides where the roads go. Fewer than two towns is a no-op.

Finding somewhere to put those towns:

```typescript
import { evaluateSuitability, findBestLocations } from '$lib/map';

const scores = evaluateSuitability(map, suitabilityEngine);
const townNodeIds = findBestLocations(scores, 5, 8, map);
```

A `SuitabilityEngine` is a list of rules, each scoring a node from 0 to 1; a `strict` engine treats
any zero as disqualifying rather than merely bad. `findBestLocations` keeps its picks at least
`minimumDistance` apart so a region's towns are not all in one corner.

`pointSpacing` is the minimum distance between cell centers — smaller means more, finer cells and a
noticeably slower build. Terrain shape comes from [`$lib/noise`](../noise/README.md).

Optional saved region facts can be supplied through `RegionMapSvgOptions.features`: major habitat
area names, landmark diamonds and hazard triangles share stored IDs and names with regional prose.
The region adapter supplies named connected landscape areas through the habitat-label style,
rather than region-wide biome summaries. Up to four area labels are placed before optional
notables; settlement labels and map furniture retain priority.
Optional labels yield to settlements and furniture and are omitted when crowded or unanchored.
See [regional map facts](../../../docs/region-map-facts.md).

## The regional semantic boundary

Regions stores this graph in its payload and builds meaning in `$lib/regions`. Regional areas and
habitats cite saved node IDs; routes, resources and notable places may also cite edge IDs. Those
IDs belong to that map, so a whole-region reroll replaces the graph and its anchors together.
Loading or rendering a saved region never reruns the physical or semantic passes.

Use `classifyRegionLandforms`, `classifyAltitude`, `classifyRelief` and `measureRegionTerrain` for shared
terrain rules. Use graph flags, adjacency and recorded river/road values for spatial evidence.
Glyph membership, smoothed coast ink and label placement are drawing decisions, not evidence for
a habitat, crossing, navigable river, resource source or livelihood. Roads are generated during
habitation after settlement placement; a saved settlement removal keeps existing road geometry.

`regionToMapSvg` supplies the current embedded settlement labels and stable capital role to this
renderer, along with selected saved habitat and notable facts. Optional landmark and hazard symbols
yield to settlement labels; anchors remain valid even when a symbol cannot fit.
SVG remains derived output; no semantic rule should parse it or copy its placement logic.
See the [accepted Regions contract](../../../docs/regions-release-contract.md) and
[regional authoring guide](../../../docs/region-authoring.md) for storage, reference semantics and
concrete rule extensions.

Inspect the implemented glyph vocabulary with
`npx vite-node scripts/render_terrain_glyphs.ts --out /tmp/terrain-glyphs.svg`.
See [the approved design](../../../docs/region-terrain-glyphs.md) and
[rendered comparisons](../../../docs/region-terrain-glyphs-373/README.md).

### Settlement icons

Settlements use deterministic building clusters from `settlement_icon_catalog.ts`, composed by
`settlement_icons.ts`. The six settlement categories select exact cottage/hall/tower counts;
capitals receive a pennant above their tallest roof. Stable settlement identity and saved site
coordinates own separate renderer RNG streams, so renaming or reordering towns does not redraw
their buildings. Actual icon bounds reserve space for labels, furniture, and terrain. Old renderer
inputs without a category fall back to the existing settlement population table. No icon data is saved.

See [the accepted design](../../../docs/region-settlement-icons.md). Render the catalog with
`npx vite-node scripts/render_settlement_icons.ts --out /tmp/settlement-icons.svg`; region previews
continue to use `npm run render:region -- --seed alpha --svg-out /tmp/region.svg`.
