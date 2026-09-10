import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate, getDefaultConfig } from '$lib/regions';
import type { RegionMap } from './map_graph';
import { simulateWater } from './water';

/** A strip of square cells; all elevations start above sea level, with no ocean seed. */
function stripMap(count: number): RegionMap {
  const map: RegionMap = { width: count + 2, height: 3, nodes: [], corners: [], edges: [] };
  for (let i = 0; i < (count + 1) * 2; i++) {
    map.corners.push({
      id: i,
      point: { x: 1 + Math.floor(i / 2), y: 1 + (i % 2) },
      touches: [],
      protrudes: [],
      adjacent: [],
      elevation: 0.5,
      moisture: 0,
      temperature: 0,
      isWater: false,
      isOcean: false,
      isCoast: false,
      river: 0,
    });
  }
  for (let i = 0; i < count; i++) {
    const corners = [i * 2, i * 2 + 2, i * 2 + 3, i * 2 + 1];
    const edges: number[] = [];
    for (const [j, id] of corners.entries()) {
      const next = corners[(j + 1) % corners.length];
      let edge = map.edges.find(
        (e) => (e.v0 === id && e.v1 === next) || (e.v1 === id && e.v0 === next),
      );
      if (edge) edge.d1 = i;
      else {
        const a = map.corners[id],
          b = map.corners[next];
        edge = {
          id: map.edges.length,
          d0: i,
          v0: id,
          v1: next,
          river: 0,
          midpoint: { x: (a.point.x + b.point.x) / 2, y: (a.point.y + b.point.y) / 2 },
        };
        map.edges.push(edge);
        a.adjacent.push(next);
        b.adjacent.push(id);
        a.protrudes.push(edge.id);
        b.protrudes.push(edge.id);
      }
      edges.push(edge.id);
      map.corners[id].touches.push(i);
    }
    const vertices = corners.map((id) => map.corners[id].point);
    map.nodes.push({
      id: i,
      center: { x: i + 1.5, y: 1.5 },
      polygon: {
        vertices,
        edges: vertices.map((a, j) => ({ a, b: vertices[(j + 1) % vertices.length] })),
      },
      neighbors: [i - 1, i + 1].filter((id) => id >= 0 && id < count),
      edges,
      corners,
      elevation: 0.5,
      moisture: 0,
      temperature: 0,
      isOcean: false,
      isWater: false,
      isCoast: false,
    });
  }
  return map;
}

describe('simulateWater', () => {
  it('floods ocean through submerged cells from the rim, leaving disconnected water as lake', () => {
    const map = stripMap(5);
    map.nodes[0].isOcean = true; // Boundary-site marker supplied by the builder.
    for (const id of [1, 2, 4]) map.nodes[id].elevation = -0.2;
    const result = simulateWater(map, {
      seaLevel: -0.1,
      springCountPercentage: 0,
      rng: new RNG('water'),
    });
    expect(result.nodes.map((n) => n.isOcean)).toEqual([true, true, true, false, false]);
    expect(result.nodes.map((n) => n.isWater)).toEqual([true, true, true, false, true]);
    expect(result.nodes.map((n) => n.isCoast)).toEqual([false, false, false, true, false]);
    expect(result.corners[6]).toMatchObject({ isOcean: true, isWater: true, isCoast: true });
    expect(result.corners[8]).toMatchObject({ isOcean: false, isWater: true, isCoast: false });
    expect(result.corners[0].isCoast).toBe(false);
  });

  it('retains the submerged-corner cell rule and does not flood uphill through dry cells', () => {
    const map = stripMap(3);
    map.nodes[0].isOcean = true;
    map.corners[2].elevation = -0.2;
    map.corners[3].elevation = -0.2;
    const result = simulateWater(map, {
      seaLevel: -0.1,
      springCountPercentage: 0,
      rng: new RNG('water'),
    });
    expect(result.nodes.map((n) => n.isOcean)).toEqual([true, true, false]);
    expect(result.nodes[2].isWater).toBe(false);
  });

  it('routes a river into a sub-sea-level pocket and creates mapped lake water there', () => {
    const map = stripMap(1);
    [1, 0.8, 0.4, -0.2].forEach((elevation, id) => {
      map.corners[id].elevation = elevation;
    });
    const original = structuredClone(map);
    const rng = new RNG('pocket');
    const spring = vi.spyOn(rng, 'int').mockReturnValue(0);
    const result = simulateWater(map, { seaLevel: -0.1, springCountPercentage: 0.25, rng });
    expect(spring).toHaveBeenCalledTimes(1);
    expect(result.edges.filter((e) => e.river > 0).map((e) => [e.v0, e.v1])).toEqual([
      [0, 2],
      [2, 3],
    ]);
    expect(result.corners[3]).toMatchObject({
      isOcean: false,
      isWater: true,
      downslope: undefined,
    });
    expect(result.nodes[0]).toMatchObject({ isOcean: false, isWater: true });
    expect(map).toEqual(original);
  });

  it('stops rivers on the shore of an existing inland lake', () => {
    const map = stripMap(3);
    map.nodes[2].elevation = -0.2;
    [1, 2, 0.8, 2, 0.6, 2, 0.4, 2].forEach((elevation, id) => {
      map.corners[id].elevation = elevation;
    });
    const rng = new RNG('lake');
    vi.spyOn(rng, 'int').mockReturnValue(0);
    const result = simulateWater(map, { seaLevel: -0.1, springCountPercentage: 0.25, rng });
    expect(result.edges.filter((e) => e.river > 0).map((e) => [e.v0, e.v1])).toEqual([
      [0, 2],
      [2, 4],
    ]);
    expect(result.corners[4]).toMatchObject({ isOcean: false, isWater: true, downslope: 6 });
  });
});

const seeds = [
  'charlie',
  'alpha',
  'bravo',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliet',
];

describe.each([
  [60, 35],
  [40, 30],
])('water outlet regressions at %i × %i', (width, height) => {
  it.each(seeds)('%s has mapped water at every river terminus and ocean corner', (seed) => {
    const config = getDefaultConfig(new RNG(seed));
    config.mapWidth = width;
    config.mapHeight = height;
    const map = generate(config).map;
    const rimOcean = map.nodes.filter(
      (node) =>
        node.isOcean &&
        (node.center.x <= 0.001 ||
          node.center.x >= width - 0.001 ||
          node.center.y <= 0.001 ||
          node.center.y >= height - 0.001),
    );
    const connected = new Set(rimOcean.map((node) => node.id));
    const queue = [...connected];
    for (let i = 0; i < queue.length; i++) {
      for (const id of map.nodes[queue[i]].neighbors) {
        if (map.nodes[id].isOcean && !connected.has(id)) {
          connected.add(id);
          queue.push(id);
        }
      }
    }
    expect(connected).toEqual(
      new Set(map.nodes.filter((node) => node.isOcean).map((node) => node.id)),
    );
    for (const corner of map.corners) {
      if (corner.isOcean) expect(corner.touches.some((id) => map.nodes[id].isOcean)).toBe(true);
      if (corner.isWater) expect(corner.touches.some((id) => map.nodes[id].isWater)).toBe(true);
    }
    const rivers = map.edges.filter((e) => e.river > 0);
    expect(rivers.length).toBeGreaterThan(0);
    for (const edge of rivers) {
      expect(
        map.corners[edge.v0].downslope === edge.v1 || map.corners[edge.v1].downslope === edge.v0,
      ).toBe(true);
      let corner = map.corners[map.corners[edge.v0].downslope === edge.v1 ? edge.v1 : edge.v0];
      const visited = new Set<number>();
      while (
        corner.downslope !== undefined &&
        corner.protrudes.some((id) => {
          const next = map.edges[id];
          return next.river > 0 && (next.v0 === corner.id ? next.v1 : next.v0) === corner.downslope;
        })
      ) {
        expect(visited.has(corner.id)).toBe(false);
        visited.add(corner.id);
        corner = map.corners[corner.downslope];
      }
      expect(corner.isWater).toBe(true);
      expect(corner.touches.some((id) => map.nodes[id].isWater)).toBe(true);
    }
  });
});
