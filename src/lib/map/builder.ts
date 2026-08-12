import type { RNG } from '@ironarachne/rng';
import { generatePoissonDisk } from '../geometry/poisson.js';
import { triangulate } from '../geometry/delaunay.js';
import { computeVoronoi, type VoronoiCell } from '../geometry/voronoi.js';
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
 * Poisson-disk sites, plus the eight boundary points that keep the outermost Voronoi cells from
 * running off to infinity and give the map a clean rectangular edge.
 */
function generateSeedPoints(config: MapBuilderConfig): Vertex[] {
  const points = generatePoissonDisk(config.width, config.height, config.pointSpacing, config.rng);

  points.push({ x: 0, y: 0 });
  points.push({ x: config.width / 2, y: 0 });
  points.push({ x: config.width, y: 0 });
  points.push({ x: 0, y: config.height / 2 });
  points.push({ x: config.width, y: config.height / 2 });
  points.push({ x: 0, y: config.height });
  points.push({ x: config.width / 2, y: config.height });
  points.push({ x: config.width, y: config.height });

  return points;
}

function createEmptyRegionMap(config: MapBuilderConfig): RegionMap {
  return {
    width: config.width,
    height: config.height,
    nodes: [],
    edges: [],
    corners: [],
  };
}

/**
 * Interns corners and edges into one `RegionMap` as cells are walked.
 *
 * Voronoi cells share their corners and edges with their neighbours, so the same corner arrives
 * once per cell that touches it. Both lookups deduplicate, which is what turns a list of polygons
 * into a connected graph — and why they hold state and are built per map rather than being free
 * functions.
 */
type GraphAccumulator = {
  getOrCreateCorner: (vertex: Vertex) => MapCorner;
  getOrCreateEdge: (c1: MapCorner, c2: MapCorner) => MapEdge;
};

function createGraphAccumulator(regionMap: RegionMap): GraphAccumulator {
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

  return { getOrCreateCorner, getOrCreateEdge };
}

/**
 * Cells grown from the eight boundary points sit on the map's rim. They become nodes like any
 * other, flagged as ocean so later passes treat them as the surrounding sea.
 */
function isBoundarySite(site: Vertex, config: MapBuilderConfig): boolean {
  return (
    site.x <= 0.001 ||
    site.x >= config.width - 0.001 ||
    site.y <= 0.001 ||
    site.y >= config.height - 0.001
  );
}

/** Adds one Voronoi cell to the graph as a node, interning its corners and edges as it goes. */
function addNodeForCell(
  regionMap: RegionMap,
  accumulator: GraphAccumulator,
  cell: VoronoiCell,
  nodeId: number,
  config: MapBuilderConfig,
): void {
  const nodeCorners = cell.polygon.vertices.map((v) => accumulator.getOrCreateCorner(v));
  const nodeEdges: MapEdge[] = [];

  // Link node back to corners
  for (const c of nodeCorners) {
    if (!c.touches.includes(nodeId)) {
      c.touches.push(nodeId);
    }
  }

  // Build edges sequentially connecting corners
  for (let j = 0; j < nodeCorners.length; j++) {
    const nextIdx = (j + 1) % nodeCorners.length;
    const edge = accumulator.getOrCreateEdge(nodeCorners[j], nodeCorners[nextIdx]);

    // Link the node to the edge, edge to the node
    if (edge.d0 === -1) {
      edge.d0 = nodeId;
    } else if (edge.d1 === undefined) {
      edge.d1 = nodeId;
    }

    nodeEdges.push(edge);
  }

  const mapNode: MapNode = {
    id: nodeId,
    center: cell.site,
    polygon: cell.polygon,
    neighbors: [], // Populate after graph is formed
    edges: nodeEdges.map((e) => e.id),
    corners: nodeCorners.map((c) => c.id),
    elevation: 0,
    moisture: 0,
    temperature: 0,
    isWater: false,
    isOcean: isBoundarySite(cell.site, config),
    isCoast: false,
  };

  regionMap.nodes.push(mapNode);
}

/**
 * Two nodes are neighbours exactly when they share an edge, so this reads the adjacency off the
 * edges once every node exists.
 */
function linkNodeNeighborsAcrossEdges(regionMap: RegionMap): void {
  for (const edge of regionMap.edges) {
    if (edge.d0 !== -1 && edge.d1 !== undefined) {
      const n0 = regionMap.nodes[edge.d0];
      const n1 = regionMap.nodes[edge.d1];

      if (!n0.neighbors.includes(n1.id)) n0.neighbors.push(n1.id);
      if (!n1.neighbors.includes(n0.id)) n1.neighbors.push(n0.id);
    }
  }
}

/**
 * Builds a fresh, empty topological RegionMap graph from scratch using Poisson Disk, Delaunay, and Voronoi algorithms.
 *
 * @param {MapBuilderConfig} config Map generation configuration.
 * @returns {RegionMap} The constructed base graph (without elevation/climate data).
 */
export function buildBaseMapGraph(config: MapBuilderConfig): RegionMap {
  const points = generateSeedPoints(config);
  const voronoi = computeVoronoi(points, triangulate(points));

  const regionMap = createEmptyRegionMap(config);
  const accumulator = createGraphAccumulator(regionMap);

  for (let i = 0; i < voronoi.cells.length; i++) {
    addNodeForCell(regionMap, accumulator, voronoi.cells[i], i, config);
  }

  linkNodeNeighborsAcrossEdges(regionMap);

  return regionMap;
}
