import type Edge from './edge.js';
import { distance, edgeEquals, vertexEquals } from './geometry.js';
import type Triangle from './triangle.js';
import type Vertex from './vertex.js';

export interface Circle {
  center: Vertex;
  radius: number;
}

/**
 * Calculates the circumcircle of a given triangle.
 *
 * @param {Triangle} t The triangle to evaluate
 * @returns {Circle} The circumcircle (center and radius)
 */
export function getCircumcircle(t: Triangle): Circle {
  const { a, b, c } = t;
  const D = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));

  if (Math.abs(D) < 0.000001) {
    return { center: { x: 0, y: 0 }, radius: Infinity };
  }

  const aSq = a.x * a.x + a.y * a.y;
  const bSq = b.x * b.x + b.y * b.y;
  const cSq = c.x * c.x + c.y * c.y;

  const cx = (aSq * (b.y - c.y) + bSq * (c.y - a.y) + cSq * (a.y - b.y)) / D;
  const cy = (aSq * (c.x - b.x) + bSq * (a.x - c.x) + cSq * (b.x - a.x)) / D;

  const center: Vertex = { x: cx, y: cy };
  return { center, radius: distance(center, a) };
}

/**
 * Checks if a vertex is within a given circle.
 *
 * @param {Vertex} v The vertex to check
 * @param {Circle} c The circle boundary
 * @returns {boolean} True if the vertex is strictly inside the circle
 */
export function inCircumcircle(v: Vertex, c: Circle): boolean {
  // A small epsilon helps deal with floating point errors near the true boundary
  return distance(v, c.center) < c.radius + 0.000001;
}

/**
 * Helper to concisely construct a Triangle from 3 vertices.
 *
 * @param {Vertex} a First vertex
 * @param {Vertex} b Second vertex
 * @param {Vertex} c Third vertex
 * @returns {Triangle} The resulting triangle
 */
export function createTriangle(a: Vertex, b: Vertex, c: Vertex): Triangle {
  return {
    a,
    b,
    c,
    edges: [
      { a, b },
      { a: b, b: c },
      { a: c, b: a },
    ],
  };
}

/**
 * Generates a Delaunay triangulation using the Bowyer-Watson algorithm.
 *
 * @param {Vertex[]} vertices The points to triangulate
 * @returns {Triangle[]} An array of Delaunay triangles
 */
export function triangulate(vertices: Vertex[]): Triangle[] {
  if (vertices.length < 3) return [];

  // Determine bounding box to create the super-triangle
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const v of vertices) {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.x > maxX) maxX = v.x;
    if (v.y > maxY) maxY = v.y;
  }

  const dx = maxX - minX;
  const dy = maxY - minY;
  const dMax = Math.max(dx, dy);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  // Set up a super-triangle that easily covers all points
  const p1: Vertex = { x: midX - 20 * dMax, y: midY - dMax };
  const p2: Vertex = { x: midX, y: midY + 20 * dMax };
  const p3: Vertex = { x: midX + 20 * dMax, y: midY - dMax };

  let triangles: Triangle[] = [createTriangle(p1, p2, p3)];

  // Process each vertex one by one
  for (const vertex of vertices) {
    const badTriangles: Triangle[] = [];
    const polygon: Edge[] = [];

    // Find all triangles that are no longer valid due to the new vertex
    for (const t of triangles) {
      const circle = getCircumcircle(t);
      if (inCircumcircle(vertex, circle)) {
        badTriangles.push(t);
      }
    }

    // Find the boundary of the polygonal hole
    for (const bt of badTriangles) {
      for (const edge of bt.edges) {
        let isShared = false;

        for (const other of badTriangles) {
          if (other === bt) continue;
          for (const otherEdge of other.edges) {
            if (edgeEquals(edge, otherEdge)) {
              isShared = true;
            }
          }
        }

        if (!isShared) {
          polygon.push(edge);
        }
      }
    }

    // Remove bad triangles
    triangles = triangles.filter((t) => !badTriangles.includes(t));

    // Re-triangulate the polygonal hole using the new vertex
    for (const edge of polygon) {
      triangles.push(createTriangle(edge.a, edge.b, vertex));
    }
  }

  // Final cleanup: remove any triangle that shares a vertex with the super-triangle
  triangles = triangles.filter((t) => {
    return !(
      vertexEquals(t.a, p1) ||
      vertexEquals(t.b, p1) ||
      vertexEquals(t.c, p1) ||
      vertexEquals(t.a, p2) ||
      vertexEquals(t.b, p2) ||
      vertexEquals(t.c, p2) ||
      vertexEquals(t.a, p3) ||
      vertexEquals(t.b, p3) ||
      vertexEquals(t.c, p3)
    );
  });

  return triangles;
}
