import type { RNG } from '@ironarachne/rng';
import { generatePoissonDisk } from '../geometry/poisson.js';
import { triangulate } from '../geometry/delaunay.js';
import { computeVoronoi } from '../geometry/voronoi.js';
import type { RegionMap, MapNode, MapEdge, MapCorner } from './map_graph.js';
import type Vertex from '../geometry/vertex.js';
import { getMidpoint } from '../geometry/geometry.js';

export interface MapBuilderConfig {
  width: number;
  height: number;
  seed: string;
  pointSpacing: number;
  rng: RNG;
}

/**
 * Builds a fresh, empty topological RegionMap graph from scratch using Poisson Disk, Delaunay, and Voronoi algorithms.
 *
 * @param {MapBuilderConfig} config Map generation configuration.
 * @returns {RegionMap} The constructed base graph (without elevation/climate data).
 */
export function buildBaseMapGraph(config: MapBuilderConfig): RegionMap {
  // 1. Generate points
  const points = generatePoissonDisk(config.width, config.height, config.pointSpacing, config.rng);

  // 2. Add boundary corners to constrain the map edges nicely.
  // (We push points outside or exactly on the edges)
  points.push({ x: 0, y: 0 });
  points.push({ x: config.width / 2, y: 0 });
  points.push({ x: config.width, y: 0 });
  points.push({ x: 0, y: config.height / 2 });
  points.push({ x: config.width, y: config.height / 2 });
  points.push({ x: 0, y: config.height });
  points.push({ x: config.width / 2, y: config.height });
  points.push({ x: config.width, y: config.height });

  // 3. Triangulate and Voronoi
  const delaunay = triangulate(points);
  const voronoi = computeVoronoi(points, delaunay);

  const regionMap: RegionMap = {
    width: config.width,
    height: config.height,
    nodes: [],
    edges: [],
    corners: [],
  };

  // Helper structures for deduplicating corners and edges
  const cornerMap = new Map<string, MapCorner>();
  const edgeMap = new Map<string, MapEdge>();

  // A fuzzy coordinate hash to merge floating point corners safely
  const coordHash = (v: Vertex) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`;

  const getOrCreateCorner = (v: Vertex): MapCorner => {
    const hash = coordHash(v);
    if (cornerMap.has(hash)) {
      return cornerMap.get(hash) as MapCorner;
    }
    const newCorner: MapCorner = {
      id: regionMap.corners.length,
      point: v,
      touches: [],
      protrudes: [],
      adjacent: [],
      elevation: 0,
      moisture: 0,
      temperature: 0,
      isWater: false,
      isOcean: false,
      isCoast: false,
      river: 0,
    };
    cornerMap.set(hash, newCorner);
    regionMap.corners.push(newCorner);
    return newCorner;
  };

  const getOrCreateEdge = (c1: MapCorner, c2: MapCorner): MapEdge => {
    // Generate a consistent ID regardless of corner order
    const minId = Math.min(c1.id, c2.id);
    const maxId = Math.max(c1.id, c2.id);
    const hash = `${minId}-${maxId}`;

    if (edgeMap.has(hash)) {
      return edgeMap.get(hash) as MapEdge;
    }

    const midpoint = getMidpoint({ a: c1.point, b: c2.point });
    const newEdge: MapEdge = {
      id: regionMap.edges.length,
      d0: -1, // Will be linked inside the node pass
      v0: c1.id,
      v1: c2.id,
      river: 0,
      midpoint,
    };
    edgeMap.set(hash, newEdge);
    regionMap.edges.push(newEdge);

    // Link corners to edge and to each other algebraically
    if (!c1.protrudes.includes(newEdge.id)) c1.protrudes.push(newEdge.id);
    if (!c2.protrudes.includes(newEdge.id)) c2.protrudes.push(newEdge.id);
    if (!c1.adjacent.includes(c2.id)) c1.adjacent.push(c2.id);
    if (!c2.adjacent.includes(c1.id)) c2.adjacent.push(c1.id);

    return newEdge;
  };

  // 4. Construct Nodes, tracking Corners and Edges
  for (let i = 0; i < voronoi.cells.length; i++) {
    const cell = voronoi.cells[i];

    // Discard cells generated from our boundary constraints if their center is exactly on the edge
    const isBoundaryCenter =
      cell.site.x <= 0.001 ||
      cell.site.x >= config.width - 0.001 ||
      cell.site.y <= 0.001 ||
      cell.site.y >= config.height - 0.001;

    // We can map all sites to a MapNode.
    // Boundary constraint nodes simply have a flag indicating they're the map boundary.

    const nodeCorners: MapCorner[] = cell.polygon.vertices.map((v) => getOrCreateCorner(v));
    const nodeEdges: MapEdge[] = [];

    // Link node back to corners
    for (const c of nodeCorners) {
      if (!c.touches.includes(i)) {
        c.touches.push(i);
      }
    }

    // Build edges sequentially connecting corners
    for (let j = 0; j < nodeCorners.length; j++) {
      const nextIdx = (j + 1) % nodeCorners.length;
      const c1 = nodeCorners[j];
      const c2 = nodeCorners[nextIdx];
      const edge = getOrCreateEdge(c1, c2);

      // Link the node to the edge, edge to the node
      if (edge.d0 === -1) {
        edge.d0 = i;
      } else if (edge.d1 === undefined) {
        edge.d1 = i;
      }

      nodeEdges.push(edge);
    }

    const mapNode: MapNode = {
      id: i,
      center: cell.site,
      polygon: cell.polygon,
      neighbors: [], // Populate after graph is formed
      edges: nodeEdges.map((e) => e.id),
      corners: nodeCorners.map((c) => c.id),
      elevation: 0,
      moisture: 0,
      temperature: 0,
      isWater: false,
      isOcean: isBoundaryCenter,
      isCoast: false,
    };

    regionMap.nodes.push(mapNode);
  }

  // 5. Establish MapNode 'neighbors' relationship using the shared edges.
  for (const edge of regionMap.edges) {
    if (edge.d0 !== -1 && edge.d1 !== undefined) {
      const n0 = regionMap.nodes[edge.d0];
      const n1 = regionMap.nodes[edge.d1];

      if (!n0.neighbors.includes(n1.id)) n0.neighbors.push(n1.id);
      if (!n1.neighbors.includes(n0.id)) n1.neighbors.push(n0.id);
    }
  }

  return regionMap;
}
