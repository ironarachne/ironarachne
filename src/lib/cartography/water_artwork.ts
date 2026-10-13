import { distancePointToSegmentSquared, type Vertex } from '$lib/geometry';
import { CARTOGRAPHY, STROKE_WIDTHS } from './cartography';
import type { InkedPath, WaterArtwork, WaterArtworkConfig } from './cartography_types';
import { canonicalLoop } from './coastlines';
import { hash01 } from './edges';
import { createHatching } from './hatching';
import { createInkedPath } from './inked_paths';

const length = (a: Vertex, b: Vertex) => Math.hypot(b.x - a.x, b.y - a.y);
const mix = (a: Vertex, b: Vertex, t: number): Vertex => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const edgesOf = (points: Vertex[], closed = true) =>
  points.slice(0, closed ? points.length : -1).map((a, i) => ({
    a,
    b: points[(i + 1) % points.length],
  }));

function inside(point: Vertex, polygon: Vertex[]): boolean {
  let result = false;
  for (const { a, b } of edgesOf(polygon))
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y)
    )
      result = !result;
  return result;
}

function segmentsCross(a: Vertex, b: Vertex, c: Vertex, d: Vertex): boolean {
  const side = (p: Vertex, q: Vertex, r: Vertex) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
}

/** Exact segment clearance, including endpoints, prevents strokes jumping across narrow land. */
function segmentsNear(a: Vertex, b: Vertex, c: Vertex, d: Vertex, margin: number): boolean {
  if (
    Math.max(a.x, b.x) + margin < Math.min(c.x, d.x) ||
    Math.min(a.x, b.x) - margin > Math.max(c.x, d.x) ||
    Math.max(a.y, b.y) + margin < Math.min(c.y, d.y) ||
    Math.min(a.y, b.y) - margin > Math.max(c.y, d.y)
  )
    return false;
  return (
    segmentsCross(a, b, c, d) ||
    Math.min(
      distancePointToSegmentSquared(a, c, d),
      distancePointToSegmentSquared(b, c, d),
      distancePointToSegmentSquared(c, a, b),
      distancePointToSegmentSquared(d, a, b),
    ) <=
      margin * margin
  );
}

function artworkClearance(config: WaterArtworkConfig, side: 'water' | 'land' = 'water') {
  const shore = edgesOf(config.shoreline);
  const obstacles = config.exclusions.filter((polygon) => polygon.length >= 3);
  const obstacleEdges = obstacles.flatMap((polygon) => edgesOf(polygon));
  return (points: Vertex[], margin: number, shoreMargin = margin): boolean => {
    if (
      points.length < 2 ||
      inside(points[0], config.shoreline) !== (side === 'water') ||
      obstacles.some((polygon) => inside(points[0], polygon))
    )
      return false;
    if (
      points.some(
        (p) =>
          p.x < margin ||
          p.x > config.width - margin ||
          p.y < margin ||
          p.y > config.height - margin,
      )
    )
      return false;
    return edgesOf(points, false).every(
      ({ a, b }) =>
        shore.every(({ a: c, b: d }) => !segmentsNear(a, b, c, d, shoreMargin)) &&
        obstacleEdges.every(({ a: c, b: d }) => !segmentsNear(a, b, c, d, margin)),
    );
  };
}

/** Uniform arc samples make run lengths independent of contour simplification. */
function samples(points: Vertex[], closed: boolean, step: number): Vertex[] {
  if (points.length < 2) return [];
  const result = [points[0]];
  let next = step;
  let traveled = 0;
  for (const { a, b } of edgesOf(points, closed)) {
    const distance = length(a, b);
    while (next < traveled + distance) {
      result.push(mix(a, b, (next - traveled) / distance));
      next += step;
    }
    traveled += distance;
  }
  if (!closed) result.push(points[points.length - 1]);
  return result;
}

function wiggle(points: Vertex[], scale: number, salt: number): Vertex[] {
  const phase = hash01(points[0].x / scale, points[0].y / scale, salt) * Math.PI * 2;
  return points.map((point, i) => {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)];
    const distance = length(a, b) || 1;
    const t = i / (points.length - 1);
    const offset = scale * 0.08 * Math.sin(Math.PI * t) * Math.sin(i * 1.1 + phase);
    return {
      x: point.x - ((b.y - a.y) / distance) * offset,
      y: point.y + ((b.x - a.x) / distance) * offset,
    };
  });
}

function brokenRipples(
  config: WaterArtworkConfig,
  scale: number,
  clear: ReturnType<typeof artworkClearance>,
): InkedPath[] {
  const area =
    Math.abs(
      config.shoreline.reduce((sum, a, i) => {
        const b = config.shoreline[(i + 1) % config.shoreline.length];
        return sum + a.x * b.y - b.x * a.y;
      }, 0),
    ) / 2;
  const base = createHatching(
    {
      shoreline: config.shoreline,
      spacing: (config.kind === 'ocean' ? 0.45 : 0.28) * scale,
      falloff: 1.4,
      maxBands: config.kind === 'ocean' ? 4 : area >= 6 * scale * scale ? 2 : 0,
    },
    config.width,
    config.height,
  ).toPaths();
  const result: InkedPath[] = [];
  const acceptedEdges: ReturnType<typeof edgesOf> = [];
  for (const [band, contour] of base.entries()) {
    const points = samples(contour.points, contour.closed, 0.24 * scale);
    let index = Math.ceil(1 + hash01(band, points.length, 417) * 3);
    while (index < points.length - 2) {
      const start = points[index];
      const count = Math.round((1.2 + 2.3 * hash01(start.x / scale, start.y / scale, 418)) / 0.24);
      const run = wiggle(points.slice(index, index + count), scale, band + 419);
      const edges = edgesOf(run, false);
      if (
        clear(run, (STROKE_WIDTHS.hairline * scale) / 2) &&
        edges.every(({ a, b }) =>
          acceptedEdges.every(({ a: c, b: d }) => !segmentsNear(a, b, c, d, 0.08 * scale)),
        )
      ) {
        result.push(createInkedPath(run, contour.ink, 'hairline', false));
        acceptedEdges.push(...edges);
      }
      index +=
        count + Math.ceil((0.3 + 0.7 * hash01(start.x / scale, start.y / scale, 420)) / 0.24);
    }
  }
  return result;
}

function shoreMarks(
  config: WaterArtworkConfig,
  scale: number,
  clear: ReturnType<typeof artworkClearance>,
): InkedPath[] {
  const points = samples(config.shoreline, true, 0.12 * scale);
  const result: InkedPath[] = [];
  const ink = { ...CARTOGRAPHY.palette.secondary, opacity: 0.32 };
  let index = 3;
  while (index < points.length - 2) {
    const origin = points[index];
    const count = Math.round((0.8 + hash01(origin.x / scale, origin.y / scale, 421)) / 0.12);
    for (let i = index; i < Math.min(points.length - 1, index + count); i += 2) {
      const a = points[i],
        b = points[i + 1];
      const distance = length(a, b) || 1;
      const tx = (b.x - a.x) / distance,
        ty = (b.y - a.y) / distance;
      const depth = (0.22 + 0.13 * hash01(a.x / scale, a.y / scale, 422)) * scale;
      for (const slope of [-1, 1]) {
        const mark = [
          {
            x: a.x + ty * 0.07 * scale - tx * slope * 0.08 * scale,
            y: a.y - tx * 0.07 * scale - ty * slope * 0.08 * scale,
          },
          {
            x: a.x + ty * depth + tx * slope * 0.08 * scale,
            y: a.y - tx * depth + ty * slope * 0.08 * scale,
          },
        ];
        if (clear(mark, (STROKE_WIDTHS.hairline * scale) / 2))
          result.push(createInkedPath(mark, ink, 'hairline', false));
      }
    }
    index += count + Math.ceil((1.3 + 3 * hash01(origin.x / scale, origin.y / scale, 423)) / 0.12);
  }
  return result;
}

function waveMarks(
  config: WaterArtworkConfig,
  scale: number,
  clear: ReturnType<typeof artworkClearance>,
): InkedPath[] {
  if (config.kind !== 'ocean') return [];
  const result: InkedPath[] = [];
  const ink = { ...CARTOGRAPHY.palette.secondary, opacity: 0.65 };
  for (let row = 0; (row + 0.5) * 4 * scale < config.height; row++) {
    for (let col = 0; (col + 0.5) * 4 * scale < config.width; col++) {
      if (hash01(col, row, 424) < 0.3) continue;
      const x = (col * 4 + 2 + (hash01(col, row, 425) - 0.5) * 1.2) * scale;
      const y = (row * 4 + 2 + (hash01(col, row, 426) - 0.5) * 1.2) * scale;
      const width = (1 + 0.4 * hash01(col, row, 427)) * scale;
      const strokes = Array.from({ length: hash01(col, row, 428) < 0.5 ? 2 : 3 }, (_, line) =>
        pointedWavePoints(x, y + line * 0.22 * scale, width * (1 - line * 0.16), scale),
      );
      // Full strokes, not just anchors, must fit beyond the last ocean band.
      if (
        // A miter limit of three bounds the pointed crest beyond the centerline.
        strokes.every((stroke) => clear(stroke, STROKE_WIDTHS.hairline * scale * 1.5, 3.6 * scale))
      )
        result.push(...strokes.map((stroke) => createInkedPath(stroke, ink, 'hairline', false)));
    }
  }
  return result;
}

/** Cubic troughs meet at sharp crests; sample each join explicitly so no peak is rounded away. */
function pointedWavePoints(x: number, y: number, width: number, scale: number): Vertex[] {
  const curves = [
    [
      { x: 0, y: 0 },
      { x: 0.08, y: 0.08 },
      { x: 0.08, y: 0 },
      { x: 0.22, y: -0.14 },
    ],
    [
      { x: 0.22, y: -0.14 },
      { x: 0.34, y: 0.18 },
      { x: 0.5, y: 0.18 },
      { x: 0.7, y: -0.14 },
    ],
    [
      { x: 0.7, y: -0.14 },
      { x: 0.86, y: 0.08 },
      { x: 0.91, y: 0.1 },
      { x: 1, y: 0 },
    ],
  ];
  return curves.flatMap(([a, b, c, d], curve) =>
    Array.from({ length: curve === 0 ? 9 : 8 }, (_, i) => {
      const t = (i + (curve === 0 ? 0 : 1)) / 8;
      const u = 1 - t;
      const localX = u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x;
      const localY = u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y;
      return { x: x + (localX - 0.5) * width, y: y + localY * scale };
    }),
  );
}

/** Derived ink only: no generation RNG, persisted fields, or mutable rendering state. */
export function createWaterArtwork(config: WaterArtworkConfig): WaterArtwork {
  if (
    ![config.width, config.height].every((v) => Number.isFinite(v) && v > 0) ||
    [...config.shoreline, ...config.exclusions.flat()].some(
      (p) => !Number.isFinite(p.x) || !Number.isFinite(p.y),
    )
  )
    throw new RangeError('Water artwork needs positive finite dimensions and finite geometry');
  const shoreline = canonicalLoop(config.shoreline);
  if (shoreline.length < 3) return { ripples: [], shoreHatching: [], waves: [] };
  const prepared = { ...config, shoreline };
  const scale = Math.min(config.width, config.height) / 35;
  const clear = artworkClearance(prepared);
  return {
    ripples: brokenRipples(prepared, scale, clear),
    shoreHatching: shoreMarks(prepared, scale, artworkClearance(prepared, 'land')),
    waves: waveMarks(prepared, scale, clear),
  };
}
