import type Vertex from './vertex.js';

/**
 * Clips a polygon to a rectangle using Sutherland-Hodgman.
 *
 * Returns the clipped vertex list. An empty list means the polygon was entirely outside the
 * rectangle. The input polygon is assumed to be closed (the first and last vertices are connected
 * by an implicit edge); the output is the same.
 */
export function clipPolygonToRect(
  vertices: Vertex[],
  rect: { x: number; y: number; width: number; height: number },
): Vertex[] {
  if (vertices.length === 0) {
    return [];
  }

  const minX = rect.x;
  const maxX = rect.x + rect.width;
  const minY = rect.y;
  const maxY = rect.y + rect.height;

  let output = vertices;

  // Clip against each edge in sequence: left, right, bottom, top
  output = clipAgainstEdge(output, 'x', minX, (v) => v.x >= minX, intersectX);
  output = clipAgainstEdge(output, 'x', maxX, (v) => v.x <= maxX, intersectX);
  output = clipAgainstEdge(output, 'y', minY, (v) => v.y >= minY, intersectY);
  output = clipAgainstEdge(output, 'y', maxY, (v) => v.y <= maxY, intersectY);

  return output;
}

function clipAgainstEdge(
  vertices: Vertex[],
  axis: 'x' | 'y',
  bound: number,
  isInside: (v: Vertex) => boolean,
  intersect: (a: Vertex, b: Vertex, axis: 'x' | 'y', bound: number) => Vertex,
): Vertex[] {
  if (vertices.length === 0) {
    return [];
  }

  const result: Vertex[] = [];
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % n];
    const currentInside = isInside(current);
    const nextInside = isInside(next);

    if (currentInside && nextInside) {
      // Both inside: emit the second vertex
      result.push(next);
    } else if (currentInside && !nextInside) {
      // Leaving: emit intersection
      result.push(intersect(current, next, axis, bound));
    } else if (!currentInside && !nextInside) {
      // Both outside: emit nothing
    } else {
      // Entering: emit intersection, then second vertex
      result.push(intersect(current, next, axis, bound));
      result.push(next);
    }
  }

  return result;
}

function intersectX(a: Vertex, b: Vertex, _axis: 'x' | 'y', bound: number): Vertex {
  const t = (bound - a.x) / (b.x - a.x);
  return { x: bound, y: a.y + t * (b.y - a.y) };
}

function intersectY(a: Vertex, b: Vertex, _axis: 'x' | 'y', bound: number): Vertex {
  const t = (bound - a.y) / (b.y - a.y);
  return { x: a.x + t * (b.x - a.x), y: bound };
}
