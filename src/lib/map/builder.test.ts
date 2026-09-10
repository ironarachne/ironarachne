import { afterEach, describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Geometry from '$lib/geometry';
import { buildBaseMapGraph } from './builder';

afterEach(() => vi.restoreAllMocks());

describe('corner interning', () => {
  it('merges across bucket boundaries without collapsing distant vertices in the same bucket', () => {
    const vertices = [
      { x: 26.21, y: 33.54 },
      { x: 26.22, y: 33.56 },
      { x: 27.09, y: 34.09 },
      { x: 27.11, y: 34.11 },
      { x: -0.01, y: -0.01 },
      { x: 0.01, y: 0.01 },
      { x: 1.051, y: 1.051 },
      { x: 1.149, y: 1.149 },
    ];
    vi.spyOn(Geometry, 'computeVoronoi').mockReturnValue({
      cells: [{ site: { x: 20, y: 20 }, polygon: { vertices, edges: [] }, neighbors: [] }],
      edges: [],
    });
    const map = buildBaseMapGraph({
      width: 60,
      height: 35,
      seed: 'intern',
      pointSpacing: 10,
      rng: new RNG('intern'),
    });
    expect(map.corners.map((c) => c.point)).toEqual([
      vertices[0],
      vertices[2],
      vertices[4],
      vertices[6],
      vertices[7],
    ]);
    expect(map.edges).toHaveLength(5);
    expect(map.edges.every((e) => e.v0 !== e.v1)).toBe(true);
    expect(map.nodes[0].polygon.vertices).toEqual(map.corners.map((c) => c.point));
    expect(map.nodes[0].polygon.edges).toHaveLength(5);
    expect(map.nodes[0].neighbors).toEqual([]);
  });

  it.each(['charlie', 'alpha', 'golf'])(
    'keeps the generated %s graph canonical and connected',
    (seed) => {
      const map = buildBaseMapGraph({
        width: 60,
        height: 35,
        seed,
        pointSpacing: 2,
        rng: new RNG(seed),
      });
      let nearest = Infinity;
      for (const [i, a] of map.corners.entries()) {
        for (const b of map.corners.slice(i + 1)) {
          nearest = Math.min(nearest, Math.hypot(a.point.x - b.point.x, a.point.y - b.point.y));
        }
        expect(a.adjacent).not.toContain(a.id);
        for (const id of a.touches) expect(map.nodes[id].corners).toContain(a.id);
      }
      expect(nearest).toBeGreaterThan(0.1);
      for (const node of map.nodes) {
        expect(new Set(node.corners).size).toBe(node.corners.length);
        expect(node.polygon.vertices).toEqual(node.corners.map((id) => map.corners[id].point));
        expect(node.neighbors).not.toContain(node.id);
        for (const id of node.neighbors) expect(map.nodes[id].neighbors).toContain(node.id);
      }
      for (const edge of map.edges) {
        expect(edge.v0).not.toBe(edge.v1);
        expect(map.nodes[edge.d0].edges).toContain(edge.id);
        if (edge.d1 !== undefined) expect(map.nodes[edge.d1].edges).toContain(edge.id);
      }
    },
  );
});
