import { describe, expect, it } from 'vitest';
import type { Vertex } from '$lib/geometry';
import { createHatching, createInkedPath, CARTOGRAPHY } from './index';
import { sampleWaterDistance } from './water_distance';
import { traceDistanceContours } from './distance_contours';

const box = (x: number, y: number, width: number, height = width): Vertex[] => [
  { x, y },
  { x: x + width, y },
  { x: x + width, y: y + height },
  { x, y: y + height },
];
const hatch = (shoreline: Vertex[], maxBands = 4) =>
  createHatching({ shoreline, spacing: 0.45, falloff: 1.4, maxBands }, 35, 35);
const side = (a: Vertex, b: Vertex, p: Vertex) =>
  (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

function expectNoCrossings(paths: ReturnType<ReturnType<typeof createHatching>['toPaths']>) {
  const edges = paths.flatMap((path) =>
    path.points.flatMap((a, i) =>
      i === path.points.length - 1 && !path.closed
        ? []
        : [{ a, b: path.points[(i + 1) % path.points.length] }],
    ),
  );
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const { a, b } = edges[i],
        { a: c, b: d } = edges[j];
      expect(side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0).toBe(false);
    }
}

describe('coast-following hatching', () => {
  it('follows the shore with increasingly distant, lighter closed bands', () => {
    const paths = hatch(box(5, 5, 25)).toPaths();
    expect(paths).toHaveLength(4);
    let level = 0;
    for (let band = 0; band < paths.length; band++) {
      level += 0.45 * Math.pow(1.4, band);
      const path = paths[band];
      expect(path.closed).toBe(true);
      expect(path.weight).toBe('hairline');
      if (band > 0) expect(path.ink.opacity).toBeLessThan(paths[band - 1].ink.opacity);
      for (const p of path.points) {
        const distance = Math.min(p.x - 5, 30 - p.x, p.y - 5, 30 - p.y);
        expect(Math.abs(distance - level)).toBeLessThan(0.2);
      }
    }
    expectNoCrossings(paths);
    expect(paths.reduce((n, p) => n + p.points.length, 0)).toBeLessThan(100);
  });

  it('follows diagonal coastlines rather than the map axes', () => {
    const diamond = [
      { x: 17.5, y: 2.5 },
      { x: 32.5, y: 17.5 },
      { x: 17.5, y: 32.5 },
      { x: 2.5, y: 17.5 },
    ];
    const paths = hatch(diamond, 1).toPaths();
    expect(paths).toHaveLength(1);
    for (const p of paths[0].points) {
      const distance = (15 - Math.abs(p.x - 17.5) - Math.abs(p.y - 17.5)) / Math.SQRT2;
      expect(Math.abs(distance - 0.45)).toBeLessThan(0.2);
    }
  });

  it('splits bands at a narrow inlet without crossing offset curves', () => {
    const shore = [
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 9.7 },
      { x: 20, y: 9.7 },
      { x: 20, y: 2 },
      { x: 28, y: 2 },
      { x: 28, y: 18 },
      { x: 20, y: 18 },
      { x: 20, y: 10.3 },
      { x: 10, y: 10.3 },
      { x: 10, y: 18 },
      { x: 2, y: 18 },
    ];
    const paths = hatch(shore, 1).toPaths();
    expect(paths).toHaveLength(2);
    expect(paths.every((p) => p.closed)).toBe(true);
    expect(paths.flatMap((p) => p.points).every((p) => p.x < 10 || p.x > 20)).toBe(true);
    expectNoCrossings(paths);
  });

  it('leaves tiny water and distant open ocean empty and allows bands to exit the crop', () => {
    expect(hatch(box(10, 10, 0.3)).toPaths()).toEqual([]);
    expect(hatch(box(-2, -2, 39)).toPaths()).toEqual([]);
    const paths = hatch(
      [
        { x: -2, y: -2 },
        { x: 17, y: -2 },
        { x: 17, y: 37 },
        { x: -2, y: 37 },
      ],
      2,
    ).toPaths();
    expect(paths).toHaveLength(2);
    expect(paths.every((p) => !p.closed)).toBe(true);
    expect(paths.flatMap((p) => p.points).every((p) => p.x > 15 && p.x < 17)).toBe(true);
  });

  it('is deterministic, does not mutate its shoreline, and honors the empty-band choice', () => {
    const shore = box(5, 5, 20),
      original = structuredClone(shore);
    const hatching = hatch(shore);
    expect(hatching.toPaths().map((p) => p.toSvg())).toEqual(
      hatching.toPaths().map((p) => p.toSvg()),
    );
    expect(shore).toEqual(original);
    expect(hatch(shore, 0).toPaths()).toEqual([]);
    expect(hatch([]).toPaths()).toEqual([]);
    for (const change of [
      { spacing: 0 },
      { falloff: 0.5 },
      { maxBands: 9 },
      { maxBands: -1 },
      { maxBands: 1.5 },
    ])
      expect(() =>
        createHatching(
          { shoreline: shore, spacing: 0.4, falloff: 1.4, maxBands: 4, ...change },
          35,
          35,
        ),
      ).toThrow(RangeError);
    expect(() =>
      createHatching({ shoreline: shore, spacing: 0.4, falloff: 1.4, maxBands: 4 }, NaN, 35),
    ).toThrow(RangeError);
  });

  it('resolves both saddle orientations into two disjoint contours', () => {
    for (const values of [
      [3, 0, 0, 2],
      [1, 0, 0, 1],
      [0, 3, 2, 0],
    ]) {
      const field = { columns: 2, rows: 2, values: new Float64Array(values), step: 1 };
      const paths = traceDistanceContours(field, 0.75).map((p) =>
        createInkedPath(p.points, CARTOGRAPHY.palette.secondary, 'hairline', p.closed),
      );
      expect(paths).toHaveLength(2);
      expectNoCrossings(paths);
    }
  });

  it('caps its field far offshore, and measures zero outside water', () => {
    const field = sampleWaterDistance(box(5, 5, 20), 35, 35, 1, 2);
    const at = (x: number, y: number) => field.values[(y + 1) * field.columns + x + 1];
    expect(at(1, 1)).toBe(0);
    expect(at(6, 10)).toBe(1);
    expect(at(15, 15)).toBe(4);
  });
});

it('serializes inked contours compactly without a fill, and escapes ink attributes', () => {
  const ink = { color: '"<&>', opacity: 0.123456 };
  const path = createInkedPath(
    [
      { x: 1.123456, y: 2 },
      { x: 3, y: 4 },
    ],
    ink,
    'fine',
    false,
  ).toSvg();
  expect(path).toContain('M 1.123 2 L 3 4');
  expect(path).toContain('fill="none"');
  expect(path).toContain('stroke="&quot;&lt;&amp;&gt;"');
  expect(path).toContain('stroke-opacity="0.123"');
  expect(path).not.toContain(' Z');
  expect(
    createInkedPath(box(0, 0, 1), CARTOGRAPHY.palette.body, 'hairline', true).toSvg(),
  ).toContain(' Z');
  expect(createInkedPath([], ink, 'fine', false).toSvg()).toBe('');
});
