import { distancePointToSegmentSquared } from '$lib/geometry';
import type { Edge, Vertex } from '$lib/geometry';
import type { InkedPath } from './cartography_types';
import type { sampleWaterDistance } from './water_distance';

function interpolate(a: Vertex, b: Vertex, va: number, vb: number, level: number): Vertex {
  const t = (level - va) / (vb - va);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Marching squares produces noncrossing segments even where inset bands split at a narrow neck. */
function contourSegments(field: ReturnType<typeof sampleWaterDistance>, level: number): Edge[] {
  const { columns, rows, values, step } = field;
  const segments: Edge[] = [];
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < columns - 1; col++) {
      const index = row * columns + col;
      const v = [
        values[index],
        values[index + 1],
        values[index + columns + 1],
        values[index + columns],
      ];
      const x = (col - 1) * step,
        y = (row - 1) * step;
      const p = [
        { x, y },
        { x: x + step, y },
        { x: x + step, y: y + step },
        { x, y: y + step },
      ];
      const cuts: Vertex[] = [];
      for (let edge = 0; edge < 4; edge++) {
        const next = (edge + 1) % 4;
        if (v[edge] > level !== v[next] > level)
          cuts.push(interpolate(p[edge], p[next], v[edge], v[next], level));
      }
      if (cuts.length === 2) segments.push({ a: cuts[0], b: cuts[1] });
      if (cuts.length === 4) {
        // Bilinear asymptotic decider, rather than joining opposite edges through a saddle.
        const topRight = (v[0] - level) * (v[2] - level) >= (v[1] - level) * (v[3] - level);
        const pairs = topRight
          ? [
              [0, 1],
              [2, 3],
            ]
          : [
              [0, 3],
              [1, 2],
            ];
        for (const [a, b] of pairs) segments.push({ a: cuts[a], b: cuts[b] });
      }
    }
  }
  return segments;
}

/** Douglas-Peucker bounds geometric error while removing collinear grid samples. */
function simplify(points: Vertex[], tolerance: number): Vertex[] {
  if (points.length < 3) return points;
  const keep = new Set([0, points.length - 1]);
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    let furthest = -1,
      distance = tolerance * tolerance;
    for (let i = first + 1; i < last; i++) {
      const d = distancePointToSegmentSquared(points[i], points[first], points[last]);
      if (d > distance) {
        distance = d;
        furthest = i;
      }
    }
    if (furthest >= 0) {
      keep.add(furthest);
      stack.push([first, furthest], [furthest, last]);
    }
  }
  return [...keep].sort((a, b) => a - b).map((i) => points[i]);
}

/** Round grid-scale corners before simplifying, preserving open endpoints at the crop. */
function roundContour(points: Vertex[], closed: boolean): Vertex[] {
  const rounded: Vertex[] = closed ? [] : [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i],
      b = points[i + 1];
    rounded.push(
      { x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 },
      { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 },
    );
  }
  rounded.push(closed ? rounded[0] : points[points.length - 1]);
  return rounded;
}

function joinSegments(segments: Edge[], tolerance: number): Pick<InkedPath, 'points' | 'closed'>[] {
  const nodes = new Map<string, { point: Vertex; edges: number[] }>();
  const key = (p: Vertex) => `${p.x.toFixed(7)},${p.y.toFixed(7)}`;
  const links = segments.map(({ a, b }, i) => {
    const ka = key(a),
      kb = key(b);
    for (const [k, p] of [
      [ka, a],
      [kb, b],
    ] as const) {
      const node = nodes.get(k) ?? { point: p, edges: [] };
      node.edges.push(i);
      nodes.set(k, node);
    }
    return [ka, kb];
  });
  const used = new Set<number>();
  const contours: Pick<InkedPath, 'points' | 'closed'>[] = [];
  // Open contours first; starting one in the middle would split it unnecessarily.
  const starts = [...nodes.keys()].sort(
    (a, b) => nodes.get(a)!.edges.length - nodes.get(b)!.edges.length,
  );
  for (const start of starts) {
    const first = nodes.get(start)!;
    if (first.edges.every((edge) => used.has(edge))) continue;
    const points: Vertex[] = [first.point];
    let current = start;
    while (true) {
      const edge = nodes.get(current)!.edges.find((id) => !used.has(id));
      if (edge === undefined) break;
      used.add(edge);
      const [a, b] = links[edge];
      current = current === a ? b : a;
      points.push(nodes.get(current)!.point);
      if (current === start) break;
    }
    const closed = current === start;
    const simplified = simplify(roundContour(points, closed), tolerance);
    if (closed) simplified.pop();
    if (simplified.length >= (closed ? 3 : 2)) contours.push({ points: simplified, closed });
  }
  return contours;
}

export function traceDistanceContours(
  field: ReturnType<typeof sampleWaterDistance>,
  level: number,
): Pick<InkedPath, 'points' | 'closed'>[] {
  return joinSegments(contourSegments(field, level), field.step * 0.2);
}
