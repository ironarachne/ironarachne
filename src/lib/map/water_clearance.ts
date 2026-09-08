import { distancePointToSegmentSquared } from '$lib/geometry';
import type { Edge, Vertex } from '$lib/geometry';

function pointInside(point: Vertex, edges: Edge[]): boolean {
  let inside = false;
  for (const { a, b } of edges) {
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y)
    )
      inside = !inside;
  }
  return inside;
}

function signedSide(a: Vertex, b: Vertex, p: Vertex): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function edgesTooClose(a: Edge, b: Edge, marginSquared: number): boolean {
  if (
    signedSide(a.a, a.b, b.a) * signedSide(a.a, a.b, b.b) < 0 &&
    signedSide(b.a, b.b, a.a) * signedSide(b.a, b.b, a.b) < 0
  )
    return true;
  return (
    distancePointToSegmentSquared(a.a, b.a, b.b) <= marginSquared ||
    distancePointToSegmentSquared(a.b, b.a, b.b) <= marginSquared ||
    distancePointToSegmentSquared(b.a, a.a, a.b) <= marginSquared ||
    distancePointToSegmentSquared(b.b, a.a, a.b) <= marginSquared
  );
}

function outlineEdges(points: Vertex[]): Edge[] {
  return points.map((a, i) => ({ a, b: points[(i + 1) % points.length] }));
}

/** Row bins make exact outline clearance inexpensive during glyph scale fitting. */
export function makeWaterClearanceTest(
  outlines: Vertex[][],
  margin: number,
): (outline: Vertex[]) => boolean {
  const rowSize = Math.max(1, margin * 2);
  const prepared = outlines
    .filter((points) => points.length >= 3)
    .map((points) => {
      const edges = outlineEdges(points);
      const rows = new Map<number, Edge[]>();
      for (const edge of edges) {
        const first = Math.floor((Math.min(edge.a.y, edge.b.y) - margin) / rowSize);
        const last = Math.floor((Math.max(edge.a.y, edge.b.y) + margin) / rowSize);
        for (let row = first; row <= last; row++) {
          const bucket = rows.get(row) ?? [];
          bucket.push(edge);
          rows.set(row, bucket);
        }
      }
      return {
        rows,
        minX: Math.min(...points.map((p) => p.x)) - margin,
        maxX: Math.max(...points.map((p) => p.x)) + margin,
      };
    });
  return (outline) => {
    if (outline.length === 0) return true;
    const edges = outlineEdges(outline);
    const minX = Math.min(...outline.map((p) => p.x));
    const maxX = Math.max(...outline.map((p) => p.x));
    const firstRow = Math.floor(Math.min(...outline.map((p) => p.y)) / rowSize);
    const lastRow = Math.floor(Math.max(...outline.map((p) => p.y)) / rowSize);
    for (const water of prepared) {
      if (maxX < water.minX || minX > water.maxX) continue;
      if (pointInside(outline[0], water.rows.get(Math.floor(outline[0].y / rowSize)) ?? []))
        return false;
      const nearby = new Set<Edge>();
      for (let row = firstRow; row <= lastRow; row++)
        for (const edge of water.rows.get(row) ?? []) nearby.add(edge);
      for (const coast of nearby) {
        if (
          Math.max(coast.a.x, coast.b.x) + margin < minX ||
          Math.min(coast.a.x, coast.b.x) - margin > maxX
        )
          continue;
        if (
          pointInside(coast.a, edges) ||
          edges.some((edge) => edgesTooClose(edge, coast, margin * margin))
        )
          return false;
      }
    }
    return true;
  };
}
