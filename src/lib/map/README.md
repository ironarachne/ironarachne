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

## Pipeline

| Stage                                 | What it does                                  |
| ------------------------------------- | --------------------------------------------- |
| `buildBaseMapGraph`                   | Points, triangulation, Voronoi, empty graph   |
| `assignElevation`                     | Raises land and marks water, ocean, and coast |
| `simulateWater`                       | Flows water downhill into rivers and lakes    |
| `assignTemperature`, `assignMoisture` | Climate from latitude, elevation, and water   |
| `assignBiomes`                        | A biome per cell from its climate             |
| `generateRoads`                       | Routes roads over the finished terrain        |

## Features

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
  clips, and river cutouts reuse the same outline, defined once in SVG. Water is bare parchment
  with coast-following hatch bands. Forests and ranges are drawn only through their glyphs, with no
  region washes or outlines. Glyph scale fitting checks full
  silhouettes against that drawn water (with stroke/filter clearance), using row bins to avoid
  scanning every coast segment for every candidate. Terrain membership still uses the raw cells. A shared Poisson candidate set and variable glyph
  spacing keep trees and peaks from stacking, with partial overlap drawn in base-y order. Forested
  mountain cells use peaks; open biomes remain bare. The local RNG is derived from map dimensions
  and node count, so saved graphs render without an extra seed. Text uses conservative serif bounds
  including halo and rounding clearance. Labels stay within the sheet and outside marker footprints
  and the title cartouche; only other-label overlap is best-effort. Names that cannot fit are omitted.
  Rivers use fine banks around a flow-scaled parchment channel. Their stored corner paths must
  reach mapped water or the crop; only natural sources taper. The internal `river_paths` helpers
  handle connectivity, curve sampling, and simplified bank geometry without changing the graph.
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
