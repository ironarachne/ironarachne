import { describe, expect, it } from 'vitest';
import { distancePointToSegmentSquared, type Vertex } from '$lib/geometry';
import { createWaterArtwork, type InkedPath, type WaterArtworkConfig } from './index';

const box = (x: number, y: number, width: number, height = width): Vertex[] => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
];
const config = (change: Partial<WaterArtworkConfig> = {}): WaterArtworkConfig => ({
  shoreline: box(3, 3, 29),
  width: 35,
  height: 35,
  kind: 'ocean',
  exclusions: [],
  ...change,
});
const serialized = (settings: WaterArtworkConfig) => {
  const artwork = createWaterArtwork(settings);
  return Object.values(artwork).map((paths: InkedPath[]) => paths.map((path) => path.toSvg()));
};
const distance = (point: Vertex, polygon: Vertex[]) =>
  Math.sqrt(
    Math.min(
      ...polygon.map((a, i) =>
        distancePointToSegmentSquared(point, a, polygon[(i + 1) % polygon.length]),
      ),
    ),
  );

function cornerAngle(points: Vertex[], index: number): number {
  const a = points[index - 1],
    p = points[index],
    b = points[index + 1];
  const ax = a.x - p.x,
    ay = a.y - p.y,
    bx = b.x - p.x,
    by = b.y - p.y;
  return Math.acos((ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by)));
}

describe('water artwork', () => {
  it('breaks all ripples into unequal open wavy runs while keeping them away from shore', () => {
    const settings = config();
    const artwork = createWaterArtwork(settings);
    expect(artwork.ripples.length).toBeGreaterThan(12);
    const lengths = artwork.ripples.map((path) =>
      path.points.reduce(
        (sum, point, i) =>
          i === 0
            ? sum
            : sum + Math.hypot(point.x - path.points[i - 1].x, point.y - path.points[i - 1].y),
        0,
      ),
    );
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeGreaterThan(0.8);
    const opacities = new Set(artwork.ripples.map((path) => path.ink.opacity));
    expect(opacities.size).toBe(4);
    for (const path of artwork.ripples) {
      expect(path.closed).toBe(false);
      expect(path.toSvg()).not.toContain(' Z');
      for (const point of path.points) {
        expect(point.x).toBeGreaterThan(3.04);
        expect(point.x).toBeLessThan(31.96);
        expect(point.y).toBeGreaterThan(3.04);
        expect(point.y).toBeLessThan(31.96);
      }
    }
    const topRun = artwork.ripples.find(
      (path) => path.points.length >= 8 && path.points.every((p) => p.y < 4 && p.x > 6 && p.x < 28),
    )!;
    expect(topRun).toBeDefined();
    const ys = topRun.points.map((p) => p.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(0.05);
    // Adjacent runs of the same band have actual gaps, not only open-path metadata.
    const firstBand = artwork.ripples.filter((p) => p.ink.opacity === 0.72);
    for (let i = 1; i < firstBand.length; i++) {
      const a = firstBand[i - 1].points.at(-1)!,
        b = firstBand[i].points[0];
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0.25);
    }
  });

  it('places paired crossing hairlines in separated light patches', () => {
    const { shoreHatching } = createWaterArtwork(config());
    expect(shoreHatching.length).toBeGreaterThan(10);
    for (const path of shoreHatching) {
      expect(path.points).toHaveLength(2);
      expect(path.ink.opacity).toBeLessThan(0.4);
      expect(path.weight).toBe('hairline');
      for (const point of path.points)
        expect(distance(point, config().shoreline)).toBeLessThanOrEqual(0.351);
    }
    const top = shoreHatching.filter((path) => path.points.every((p) => p.y < 4));
    expect(top.some((path) => path.points[1].x > path.points[0].x)).toBe(true);
    expect(top.some((path) => path.points[1].x < path.points[0].x)).toBe(true);
    const anchors = top.map((path) => path.points[0].x).sort((a, b) => a - b);
    expect(anchors.some((x, i) => i > 0 && x - anchors[i - 1] > 1)).toBe(true);
  });

  it('uses sparse groups of curved waves only offshore in oceans', () => {
    const { waves } = createWaterArtwork(config());
    expect(waves.length).toBeGreaterThan(6);
    expect(waves.length).toBeLessThan(100);
    for (const path of waves) {
      expect(path.closed).toBe(false);
      const ys = path.points.map((p) => p.y);
      expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(0.2);
      for (const point of path.points)
        expect(distance(point, config().shoreline)).toBeGreaterThan(3.6);
      const peaks = path.points.flatMap((p, i) =>
        i > 0 &&
        i < path.points.length - 1 &&
        p.y < path.points[i - 1].y &&
        p.y < path.points[i + 1].y
          ? [i]
          : [],
      );
      expect(peaks).toHaveLength(2);
      for (const i of peaks) expect(cornerAngle(path.points, i)).toBeLessThan(Math.PI / 2);
      const middle = path.points.slice(peaks[0] + 1, peaks[1]);
      const trough = middle.reduce((best, p) => (p.y > best.y ? p : best));
      expect(trough.y - path.points[peaks[0]].y).toBeGreaterThan(0.2);
      expect(cornerAngle(path.points, path.points.indexOf(trough))).toBeGreaterThan(
        (2 * Math.PI) / 3,
      );
    }
    expect(createWaterArtwork(config({ kind: 'lake' })).waves).toEqual([]);
    expect(createWaterArtwork(config({ kind: 'lake', shoreline: box(10, 10, 1) })).ripples).toEqual(
      [],
    );
    expect(
      new Set(createWaterArtwork(config({ kind: 'lake' })).ripples.map((p) => p.ink.opacity)).size,
    ).toBe(2);
  });

  it('respects entire exclusion footprints, including a narrow obstacle between sampled vertices', () => {
    const plain = createWaterArtwork(config());
    const a = plain.waves[0].points[2],
      b = plain.waves[0].points[3];
    const exclusion = box((a.x + b.x) / 2 - 0.01, (a.y + b.y) / 2 - 0.01, 0.02);
    const decorated = createWaterArtwork(config({ exclusions: [exclusion] }));
    expect(decorated.waves.length).toBeLessThan(plain.waves.length);
    expect(decorated.waves.some((wave) => wave.toSvg() === plain.waves[0].toSvg())).toBe(false);
    const covered = createWaterArtwork(config({ exclusions: [box(0, 0, 35)] }));
    expect(covered).toEqual({ ripples: [], shoreHatching: [], waves: [] });
  });

  it('is stable across repeat calls, equivalent loops, and source subdivisions without mutations', () => {
    const settings = config();
    const original = structuredClone(settings);
    const expected = serialized(settings);
    expect(serialized(settings)).toEqual(expected);
    expect(serialized({ ...settings, shoreline: [...settings.shoreline].reverse() })).toEqual(
      expected,
    );
    expect(
      serialized({
        ...settings,
        shoreline: [...settings.shoreline.slice(2), ...settings.shoreline.slice(0, 2)],
      }),
    ).toEqual(expected);
    const split = settings.shoreline.flatMap((a, i) => {
      const b = settings.shoreline[(i + 1) % settings.shoreline.length];
      return [a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }];
    });
    expect(serialized({ ...settings, shoreline: [...split, split[0]] })).toEqual(expected);
    expect(settings).toEqual(original);
    expect(serialized(config({ shoreline: box(4, 4, 27) }))).not.toEqual(expected);
  });

  it('scales artwork with the map and leaves crop closing edges undecorated', () => {
    const original = createWaterArtwork(config());
    const scaled = createWaterArtwork(
      config({
        width: 70,
        height: 70,
        shoreline: config().shoreline.map((p) => ({ x: p.x * 2, y: p.y * 2 })),
      }),
    );
    for (const key of ['ripples', 'shoreHatching', 'waves'] as const)
      expect(scaled[key].map((p) => p.points)).toEqual(
        original[key].map((path) => path.points.map((p) => ({ x: p.x * 2, y: p.y * 2 }))),
      );
    const ocean = createWaterArtwork(config({ shoreline: box(-2, -2, 39) }));
    expect(ocean.ripples).toEqual([]);
    expect(ocean.shoreHatching).toEqual([]);
    expect(ocean.waves.length).toBeGreaterThan(0);
  });

  it('contains marks in concave water and omits cramped or invalid geometry', () => {
    const shore = [
      { x: 2, y: 2 },
      { x: 12, y: 2 },
      { x: 12, y: 10 },
      { x: 22, y: 10 },
      { x: 22, y: 2 },
      { x: 32, y: 2 },
      { x: 32, y: 22 },
      { x: 22, y: 22 },
      { x: 22, y: 10.3 },
      { x: 12, y: 10.3 },
      { x: 12, y: 22 },
      { x: 2, y: 22 },
    ];
    const artwork = createWaterArtwork(config({ shoreline: shore }));
    for (const paths of Object.values(artwork)) {
      for (const path of paths) {
        for (const point of path.points) {
          expect(point.x < 12 || point.x > 22 || (point.y > 10 && point.y < 10.3)).toBe(true);
          expect(distance(point, shore)).toBeGreaterThan(0.04);
          expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
        }
      }
    }
    expect(createWaterArtwork(config({ shoreline: box(10, 10, 0.05) }))).toEqual({
      ripples: [],
      shoreHatching: [],
      waves: [],
    });
    for (const shoreline of [
      [],
      [{ x: 1, y: 1 }],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ],
    ])
      expect(createWaterArtwork(config({ shoreline }))).toEqual({
        ripples: [],
        shoreHatching: [],
        waves: [],
      });
    for (const change of [
      { width: 0 },
      { height: -1 },
      { width: Infinity },
      { height: NaN },
      { shoreline: [{ x: NaN, y: 2 }] },
      { exclusions: [[{ x: 2, y: Infinity }]] },
    ])
      expect(() => createWaterArtwork(config(change))).toThrow(RangeError);
  });
});
