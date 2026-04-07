import type Edge from './edge.js';
import { vertexEquals } from './geometry.js';
import type Polygon from './polygon.js';
import type Triangle from './triangle.js';
import type Vertex from './vertex.js';
import { getCircumcircle } from './delaunay.js';

export interface VoronoiCell {
  site: Vertex;
  polygon: Polygon;
  neighbors: Vertex[]; // Neighboring sites
}

export interface VoronoiDiagram {
  cells: VoronoiCell[];
  edges: Edge[];
}

/**
 * Computes the Voronoi dual graph from a given Delaunay triangulation.
 *
 * @param {Vertex[]} sites Original points used for the triangulation
 * @param {Triangle[]} triangles The result of the Delaunay triangulation
 * @returns {VoronoiDiagram} The resulting Voronoi graph
 */
export function computeVoronoi(sites: Vertex[], triangles: Triangle[]): VoronoiDiagram {
  const centers = new Map<Triangle, Vertex>();
  for (const t of triangles) {
    centers.set(t, getCircumcircle(t).center);
  }

  const cells: VoronoiCell[] = [];
  const diagramEdges: Edge[] = [];

  for (const site of sites) {
    // Find all triangles that share this site
    const connectedTriangles = triangles.filter(
      t => vertexEquals(t.a, site) || vertexEquals(t.b, site) || vertexEquals(t.c, site)
    );

    if (connectedTriangles.length === 0) continue;

    // The vertices of the Voronoi polygon are the circumcenters of the connected triangles
    const cellVertices: Vertex[] = connectedTriangles.map(t => centers.get(t) as Vertex);

    // Sort the vertices clockwise around the site to form a correct closed polygon
    cellVertices.sort((v1, v2) => {
      const angle1 = Math.atan2(v1.y - site.y, v1.x - site.x);
      const angle2 = Math.atan2(v2.y - site.y, v2.x - site.x);
      return angle1 - angle2;
    });

    const polygonEdges: Edge[] = [];
    for (let i = 0; i < cellVertices.length; i++) {
        const next = (i + 1) % cellVertices.length;
        const edge = { a: cellVertices[i], b: cellVertices[next] };
        polygonEdges.push(edge);

        // We can just add all edges and deduplicate later if a strictly normalized list of all edges is needed.
        // For drawing, having them per-cell is usually fine.
        diagramEdges.push(edge);
    }

    // Determine neighbor sites from the Delaunay triangles
    const neighbors: Vertex[] = [];
    for (const t of connectedTriangles) {
      if (!vertexEquals(t.a, site) && !neighbors.some(n => vertexEquals(n, t.a))) neighbors.push(t.a);
      if (!vertexEquals(t.b, site) && !neighbors.some(n => vertexEquals(n, t.b))) neighbors.push(t.b);
      if (!vertexEquals(t.c, site) && !neighbors.some(n => vertexEquals(n, t.c))) neighbors.push(t.c);
    }

    cells.push({
      site,
      polygon: {
        vertices: cellVertices,
        edges: polygonEdges
      },
      neighbors
    });
  }

  return { cells, edges: diagramEdges };
}
