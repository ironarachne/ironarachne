import { describe, expect, it } from 'vitest';
import type { Vertex } from '$lib/geometry';
import { createWaterEdgeTreatment } from './index';

const rectangle = [
  { x: 5, y: 5 },
  { x: 25, y: 5 },
  { x: 25, y: 20 },
  { x: 5, y: 20 },
];
const distance = (a: Vertex, b: Vertex) => Math.hypot(a.x - b.x, a.y - b.y);
const side = (a: Vertex, b: Vertex, p: Vertex) =>
  (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

function expectSimple(points: Vertex[]) {
  expect(points.length).toBeGreaterThan(3);
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    for (let j = i + 2; j < points.length; j++) {
      const c = points[j],
        d = points[(j + 1) % points.length];
      expect(side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0).toBe(false);
    }
  }
}

describe('water edge treatment', () => {
  it('rounds corners, roughens long straight runs, and bounds every segment including the closing edge', () => {
    const result = createWaterEdgeTreatment(60, 35).displace(rectangle);
    expectSimple(result);
    for (let i = 0; i < result.length; i++)
      expect(distance(result[i], result[(i + 1) % result.length])).toBeLessThanOrEqual(0.3000001);
    for (const corner of rectangle)
      expect(Math.min(...result.map((p) => distance(corner, p)))).toBeGreaterThan(0.1);
    const top = result.filter((p) => p.x > 8 && p.x < 22 && p.y < 6).map((p) => p.y);
    expect(Math.max(...top) - Math.min(...top)).toBeGreaterThan(0.1);
    expect(result.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  });

  it('does not depend on ids, winding, starting corner, or redundant source subdivisions', () => {
    const treatment = createWaterEdgeTreatment(60, 35);
    const expected = treatment.displace(rectangle);
    expect(treatment.displace([...rectangle].reverse())).toEqual(expected);
    expect(treatment.displace([...rectangle.slice(2), ...rectangle.slice(0, 2)])).toEqual(expected);
    const split = rectangle.flatMap((a, i) => {
      const b = rectangle[(i + 1) % rectangle.length];
      return [a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }];
    });
    expect(
      treatment.displace(
        [...split, split[0]],
        split.map((_, i) => i + 50),
      ),
    ).toEqual(expected);
    expect(rectangle[0]).toEqual({ x: 5, y: 5 });
  });

  it('scales character with the map dimensions', () => {
    const small = createWaterEdgeTreatment(60, 35).displace(rectangle);
    const large = createWaterEdgeTreatment(120, 70).displace(
      rectangle.map((p) => ({ x: p.x * 2, y: p.y * 2 })),
    );
    expect(large).toEqual(small.map((p) => ({ x: p.x * 2, y: p.y * 2 })));
  });

  it('clips far-off-map water as polygons and keeps the crop covered', () => {
    const result = createWaterEdgeTreatment(60, 35).displace([
      { x: -10000, y: -10000 },
      { x: 10000, y: -10000 },
      { x: 10000, y: 10000 },
      { x: -10000, y: 10000 },
    ]);
    expect(result.length).toBeLessThan(1000);
    expect(Math.min(...result.map((p) => p.x))).toBeLessThan(-1);
    expect(Math.max(...result.map((p) => p.x))).toBeGreaterThan(61);
    expect(result.filter((p) => p.x > 5 && p.x < 55).every((p) => p.y < 0 || p.y > 35)).toBe(true);
    expect(
      createWaterEdgeTreatment(60, 35).displace(rectangle.map((p) => ({ x: p.x + 500, y: p.y }))),
    ).toEqual([]);
    expectSimple(
      createWaterEdgeTreatment(60, 35).displace([
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 60, y: 35 },
        { x: 0, y: 35 },
      ]),
    );
  });

  it('keeps a narrow inlet from crossing itself', () => {
    expectSimple(
      createWaterEdgeTreatment(60, 35).displace([
        { x: 5, y: 5 },
        { x: 25, y: 5 },
        { x: 25, y: 20 },
        { x: 15.2, y: 20 },
        { x: 15.2, y: 9 },
        { x: 14.8, y: 9 },
        { x: 14.8, y: 20 },
        { x: 5, y: 20 },
      ]),
    );
  });

  it('rejects invalid dimensions and ignores degenerate loops', () => {
    for (const dimensions of [
      [0, 35],
      [60, -1],
      [NaN, 35],
      [60, Infinity],
    ])
      expect(() => createWaterEdgeTreatment(...(dimensions as [number, number]))).toThrow(
        RangeError,
      );
    const treatment = createWaterEdgeTreatment(60, 35);
    for (const points of [
      [],
      [{ x: 1, y: 1 }],
      [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ],
      [
        { x: 1, y: 1 },
        { x: 4, y: 4 },
        { x: 1, y: 4 },
        { x: 4, y: 1 },
      ],
    ])
      expect(treatment.displace(points)).toEqual([]);
  });
});
