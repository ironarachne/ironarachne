import type Vertex from '../geometry/vertex.js';
import type Polygon from '../geometry/polygon.js';

/**
 * A MapNode represents a region/polygon cell on the map.
 * It is derived from a site (center point) in the Voronoi diagram.
 */
export interface MapNode {
  id: number;
  center: Vertex;
  polygon: Polygon;

  neighbors: number[]; // IDs of adjacent MapNodes
  edges: number[];     // IDs of MapEdges bordering this node
  corners: number[];   // IDs of MapCorners forming the polygon

  // Geography data
  elevation: number;
  moisture: number;
  temperature: number;
  isWater: boolean;
  isOcean: boolean;
  isCoast: boolean;
  biomeId?: string;    // String ID to link to the environment subsystem
}

/**
 * A MapCorner represents a vertex of a polygon (a crossing point where 3 edges meet).
 */
export interface MapCorner {
  id: number;
  point: Vertex;

  touches: number[];   // IDs of MapNodes touching this corner
  protrudes: number[]; // IDs of MapEdges starting/ending at this corner
  adjacent: number[];  // IDs of MapCorners connected by edges to this corner

  // Geography data interpolated/calculated at corners
  elevation: number;
  moisture: number;
  temperature: number;
  isWater: boolean;
  isOcean: boolean;
  isCoast: boolean;
  river: number;       // River flow volume (0 if no river)
  downslope?: number;  // ID of the MapCorner that is downhill from this one
}

/**
 * A MapEdge represents a boundary line between two MapNodes.
 */
export interface MapEdge {
  id: number;

  d0: number; // ID of the MapNode on one side of the edge
  d1?: number; // ID of the MapNode on the other side (optional for boundary edges)

  v0: number; // ID of the MapCorner at one end
  v1: number; // ID of the MapCorner at the other end

  // Edge features
  river: number; // River flow along this edge (0 if no river)
  midpoint: Vertex;
}

/**
 * RegionMap is the complete graph definition of a generated region map.
 * This encapsulates the entire topological layout of nodes, edges, and corners.
 */
export interface RegionMap {
  width: number;
  height: number;
  nodes: MapNode[];
  edges: MapEdge[];
  corners: MapCorner[];
}
