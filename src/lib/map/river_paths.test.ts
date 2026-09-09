import { describe, expect, it } from 'vitest';
import type { Vertex } from '$lib/geometry';
import type { RegionMap } from './map_graph';
import {
  atMapEdge,
  connectedRiverReaches,
  riverChannelWidth,
  riverRibbon,
  sampleRiverCurve,
} from './river_paths';
import { buildRegionMapSvgString } from './region_map_svg';

function network(): RegionMap {
  const points = [
    { x: 2, y: 2 },
    { x: 2, y: 8 },
    { x: 5, y: 5 },
    { x: 10, y: 5 },
    { x: 13, y: 5 },
  ];
  return {
    width: 10,
    height: 10,
    nodes: points.map((center, id) => ({
      id,
      center,
      polygon: { vertices: [], edges: [] },
      neighbors: [],
      edges: [],
      corners: [],
      elevation: 0.5,
      moisture: 0.5,
      temperature: 15,
      isWater: false,
      isOcean: false,
      isCoast: false,
    })),
    corners: points.map((point, id) => ({
      id,
      point,
      touches: [id],
      protrudes: [],
      adjacent: [],
      elevation: 0.5,
      moisture: 0.5,
      temperature: 15,
      isWater: false,
      isOcean: false,
      isCoast: false,
      river: 0,
      downslope: [2, 2, 3, undefined, undefined][id],
    })),
    edges: [
      [0, 2, 1],
      [2, 1, 3],
      [2, 3, 4],
    ].map(([v0, v1, river], id) => ({
      id,
      v0,
      v1,
      d0: v0,
      d1: v1,
      river,
      road: 1,
      midpoint: { x: 5, y: 5 },
    })),
  };
}

describe('river paths', () => {
  it('uses downslope in either edge orientation, widens at confluences, and preserves mouth flow', () => {
    const map = network(),
      before = structuredClone(map);
    const reaches = connectedRiverReaches(map, new Set([3]));
    expect(
      reaches.map(({ from, to, source, startFlow, endFlow }) => ({
        from,
        to,
        source,
        startFlow,
        endFlow,
      })),
    ).toEqual([
      { from: 0, to: 2, source: true, startFlow: 1, endFlow: 4 },
      { from: 1, to: 2, source: true, startFlow: 3, endFlow: 4 },
      { from: 2, to: 3, source: false, startFlow: 4, endFlow: 4 },
    ]);
    expect(map).toEqual(before);
    expect(riverChannelWidth(4, 1)).toBeGreaterThan(riverChannelWidth(1, 1));
    expect(riverChannelWidth(4, 2)).toBe(riverChannelWidth(4, 1) * 2);
  });

  it('omits all tributaries of a dry sink and rejects cycles and undirected edges', () => {
    const map = network();
    expect(connectedRiverReaches(map, new Set())).toEqual([]);
    map.corners[2].downslope = 0;
    expect(connectedRiverReaches(map, new Set([3]))).toEqual([]);
    map.corners.forEach((corner) => {
      corner.downslope = undefined;
    });
    expect(connectedRiverReaches(map, new Set([3]))).toEqual([]);
    expect(connectedRiverReaches({ ...map, edges: [] }, new Set())).toEqual([]);
  });

  it('does not retain a branch that leaves water and ends in open country', () => {
    const map = network();
    map.corners[3].downslope = 4;
    map.edges.push({ id: 3, v0: 3, v1: 4, d0: 3, d1: 4, river: 1, midpoint: { x: 12, y: 5 } });
    expect(connectedRiverReaches(map, new Set([3])).map((reach) => reach.edge.id)).toEqual([
      0, 1, 2,
    ]);
  });

  it('recognizes every crop boundary and points beyond it', () => {
    const map = network();
    for (const point of [
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 10 },
      { x: -100, y: 5 },
    ])
      expect(atMapEdge(point, map)).toBe(true);
    expect(atMapEdge({ x: 5, y: 5 }, map)).toBe(false);
  });

  it('keeps curve endpoints and makes a pointed source without pinching a join or mouth', () => {
    const knots = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ];
    const samples = sampleRiverCurve(knots);
    expect(samples[0]).toEqual(knots[0]);
    expect(samples.at(-1)).toEqual(knots.at(-1));
    const source = riverRibbon(samples, 0.2, 0.4, true, 0.08, 1);
    expect(source[0]).toEqual(knots[0]);
    expect(source.at(-1)).toEqual(knots[0]);
    expect(source.filter((p) => p.x === 4).map((p) => p.y)).toEqual([0.28, -0.28]);
    const joined = riverRibbon(samples, 0.2, 0.4, false, 0, 1);
    expect(joined[0].y).toBe(0.1);
    expect(joined.at(-1)?.y).toBe(-0.1);
    expect(source.length).toBeLessThan(samples.length);
  });

  it('handles short and degenerate paths without nonfinite coordinates', () => {
    expect(sampleRiverCurve([])).toEqual([]);
    expect(sampleRiverCurve([{ x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }]);
    for (const points of [
      [],
      [{ x: 1, y: 1 }],
      [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
    ] as Vertex[][])
      expect(riverRibbon(points, 1, 1, true, 0.1, 1)).toEqual([]);
    const points = sampleRiverCurve([
      { x: 1, y: 1 },
      { x: 1.0001, y: 1.0001 },
    ]);
    expect(
      riverRibbon(points, 1, 1, true, 0.1, 1).every(
        (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
      ),
    ).toBe(true);
  });
});

describe('rendered route continuity', () => {
  it('preserves a road junction, prunes a dangling branch, and never mutates the map', () => {
    const map = network(),
      before = structuredClone(map);
    const svg = buildRegionMapSvgString(map, { settlements: [{ mapNodeId: 0 }, { mapNodeId: 1 }] });
    const road = svg.match(/<g data-map-roads="true"[\s\S]*?<\/g>\s*<\/g>/)?.[0] ?? '';
    // Node 3 is a valid crop exit. All three routes meet at the same centre.
    expect(road).toContain('5 5');
    expect(road).toContain('10 5');
    expect(svg.match(/data-river-edge=/g)).toHaveLength(3);
    expect(svg).not.toContain('rvTapG');
    expect(
      buildRegionMapSvgString(map, { settlements: [{ mapNodeId: 0 }, { mapNodeId: 1 }] }),
    ).toBe(svg);
    expect(map).toEqual(before);
    map.nodes[3].center = { x: 9, y: 5 };
    const pruned = buildRegionMapSvgString(map, {
      settlements: [{ mapNodeId: 0 }, { mapNodeId: 1 }],
    });
    const prunedRoad = pruned.match(/<g data-map-roads="true"[\s\S]*?<\/g>\s*<\/g>/)?.[0] ?? '';
    expect(prunedRoad).toContain('5 5');
    expect(prunedRoad).not.toContain('9 5');
  });

  it('does not draw an isolated road with no mapped destinations', () => {
    const map = network();
    map.nodes[3].center = { x: 9, y: 5 };
    expect(buildRegionMapSvgString(map)).not.toContain('data-map-roads');
  });
});
