# Geometry

This library holds the **2D computational geometry** the map generator is built on: point
distribution, triangulation, the dual diagram that turns a triangulation into regions, and the small
vector helpers that go with them. It knows nothing about maps or rendering — it deals in vertices,
edges, and polygons.

The map pipeline uses it in one direction: scatter points with Poisson-disk sampling, triangulate
them with Delaunay, take the Voronoi dual, and treat the resulting cells as regions of terrain.

## Features

- **Types** — `Vertex`, `Edge`, `Triangle`, and `Polygon`.
- **Point distribution** — `generatePoissonDisk` for evenly-spaced-but-not-gridded points.
- **Triangulation** — `triangulate`, with `createTriangle`, `getCircumcircle`, and `inCircumcircle`
  exposed for callers doing their own incremental work.
- **Voronoi** — `computeVoronoi` builds the dual diagram from sites and their triangulation.
- **Primitives** — `distance`, `getMidpoint`, `getSlope`, `edgesFromVertices`, `vertexEquals`,
  `edgeEquals`, `vertexIn`, and `distancePointToSegmentSquared` (squared, so callers comparing
  distances can skip the square root).
- **Directions** — `getAngleOfLine`, `getDirectionFromOrigin`, and `getWordForVector`, which turn
  geometry into words like "northeast" for generated descriptions.

## Usage

```typescript
import { computeVoronoi, generatePoissonDisk, triangulate } from '$lib/geometry';

const sites = generatePoissonDisk(800, 600, 12, rng); // width, height, minimum spacing
const triangles = triangulate(sites);
const diagram = computeVoronoi(sites, triangles);
```

For description text rather than structure:

```typescript
import { getDirectionFromOrigin } from '$lib/geometry';

getDirectionFromOrigin({ x: 0, y: 0 }, { x: 5, y: -5 }); // 'northeast'
```

Consumers: [`$lib/map`](../map/README.md) and [`$lib/regions`](../regions/README.md).
