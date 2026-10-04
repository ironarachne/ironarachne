import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rollRegionSnapshot } from '$lib/regions';
import type { RegionMap } from './map_graph';
import { buildRiverNetwork } from './river_network';
import { generateRiverGeometry, legacyRiverNetwork } from './river_generation';
import {
  incomingRiverReaches,
  isRiverWaterAt,
  outgoingRiverReaches,
  riverEnvelope,
  riverOutlets,
  riverTerrainElevation,
} from './river_geometry';
import { riverGraphError, riverNetworkError } from './river_validation';
import { buildRegionMapSvgString } from './region_map_svg';

/** Opt-in review artifacts: RIVER_REVIEW_DIRECTORY=/path npm run test -- river_network.test.ts. */
function reviewSvg(name: string, svg: string): void {
  if (process.env.RIVER_REVIEW_DIRECTORY)
    writeFileSync(join(process.env.RIVER_REVIEW_DIRECTORY, name), svg);
}

/** Two columns of four cells, with a confluence, local springs, and a wide ocean mouth. */
function fixture(): RegionMap {
  const map: RegionMap = { width: 10, height: 16, nodes: [], edges: [], corners: [] };
  for (let row = 0; row <= 4; row++)
    for (let col = 0; col <= 2; col++) {
      map.corners.push({
        id: map.corners.length,
        point: { x: col * 5, y: row * 4 },
        touches: [],
        protrudes: [],
        adjacent: [],
        elevation: 0.2 - row * 0.04,
        moisture: 0.5,
        temperature: 15,
        isWater: row >= 3,
        isOcean: row >= 3,
        isCoast: row === 3,
        river: 0,
      });
    }
  map.corners[3].elevation = 0.4;
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 2; col++) {
      const id = map.nodes.length,
        corners = [row * 3 + col, row * 3 + col + 1, (row + 1) * 3 + col + 1, (row + 1) * 3 + col];
      const vertices = corners.map((i) => map.corners[i].point),
        edges: number[] = [];
      for (const [i, from] of corners.entries()) {
        const to = corners[(i + 1) % corners.length];
        let edge = map.edges.find(
          (e) => (e.v0 === from && e.v1 === to) || (e.v1 === from && e.v0 === to),
        );
        if (edge) edge.d1 = id;
        else {
          const a = map.corners[from],
            b = map.corners[to];
          edge = {
            id: map.edges.length,
            d0: id,
            v0: from,
            v1: to,
            river: 0,
            midpoint: { x: (a.point.x + b.point.x) / 2, y: (a.point.y + b.point.y) / 2 },
          };
          map.edges.push(edge);
          a.protrudes.push(edge.id);
          b.protrudes.push(edge.id);
          a.adjacent.push(to);
          b.adjacent.push(from);
        }
        edges.push(edge.id);
        map.corners[from].touches.push(id);
      }
      map.nodes.push({
        id,
        center: { x: col * 5 + 2.5, y: row * 4 + 2 },
        polygon: {
          vertices,
          edges: vertices.map((a, i) => ({ a, b: vertices[(i + 1) % vertices.length] })),
        },
        corners,
        edges,
        neighbors: [],
        elevation: 0.18 - row * 0.04,
        moisture: 0.5,
        temperature: 15,
        isWater: row === 3,
        isOcean: row === 3,
        isCoast: row === 2,
        biomeId: 'grassland',
      });
    }
  for (const edge of map.edges)
    if (edge.d1 !== undefined) {
      map.nodes[edge.d0].neighbors.push(edge.d1);
      map.nodes[edge.d1].neighbors.push(edge.d0);
    }
  for (const [from, to, flow] of [
    [1, 4, 1],
    [3, 4, 2],
    [4, 7, 5],
    [7, 10, 10],
  ]) {
    map.corners[from].downslope = to;
    map.corners[from].river = flow;
    map.edges.find((e) => (e.v0 === from && e.v1 === to) || (e.v1 === from && e.v0 === to))!.river =
      flow;
  }
  map.rivers = buildRiverNetwork(
    map,
    new Map([
      [1, 1],
      [3, 2],
      [4, 2],
      [7, 5],
    ]),
  );
  return map;
}

function controlled(delta: boolean, islands: boolean): RNG {
  const rng = new RNG('controlled');
  vi.spyOn(rng, 'int').mockImplementation((min, max) =>
    min === -1000 ? 0 : max === 200 ? 100 : delta || islands ? 0 : max,
  );
  return rng;
}

describe('saved river network', () => {
  it.each(['kzv0w4a5zmhvj', 'river-stress-46', 'river-stress-120'])(
    'generates and renders regression seed %s',
    (seed) => {
      const snapshot = rollRegionSnapshot(seed);
      expect(riverNetworkError(snapshot.map, snapshot.map.rivers)).toBeNull();
      expect(buildRegionMapSvgString(snapshot.map)).toContain('data-map-rivers');
    },
  );
  it('records duplicate/local supplies, unequal tributaries, and all downstream outlets', () => {
    const map = fixture(),
      n = map.rivers!;
    expect(riverGraphError(map)).toBeNull();
    expect(n.junctions.map((j) => [j.id, j.localSupply])).toEqual([
      ['river-corner:1', 1],
      ['river-corner:3', 2],
      ['river-corner:4', 2],
      ['river-corner:7', 5],
      ['river-corner:10', 0],
    ]);
    expect(incomingRiverReaches(n, 'river-corner:4')).toHaveLength(2);
    expect(outgoingRiverReaches(n, 'river-corner:4')[0].flow).toBe(5);
    expect(riverOutlets(n, 'river-corner:1')).toEqual(['river-corner:10']);
    expect(n.reaches.map((r) => r.sizeClass)).toEqual(['stream', 'stream', 'channel', 'broad']);
  });

  it('reconciles submerged springs without preserving phantom downstream supply', () => {
    const map = fixture();
    map.corners[3].isWater = true;
    const n = buildRiverNetwork(
      map,
      new Map([
        [1, 1],
        [3, 2],
        [4, 2],
        [7, 5],
      ]),
    );
    expect(n.reaches.map((r) => r.flow)).toEqual([1, 3, 8]);
    expect(n.junctions.find((j) => j.id === 'river-corner:4')!.localSupply).toBe(2);
  });

  it('persists deterministic curves, leaves inputs untouched, and treats empty networks as empty', () => {
    const map = fixture(),
      before = structuredClone(map);
    const a = generateRiverGeometry(map, new RNG('curves'));
    expect(generateRiverGeometry(map, new RNG('curves'))).toEqual(a);
    expect(generateRiverGeometry(map, new RNG('other-curves')).rivers).not.toEqual(a.rivers);
    expect(map).toEqual(before);
    expect(riverNetworkError(a, a.rivers)).toBeNull();
    expect(structuredClone(a.rivers)).toEqual(a.rivers);
    const empty = {
      ...map,
      rivers: { ...map.rivers!, junctions: [], reaches: [], islands: [], deltas: [] },
    };
    expect(buildRegionMapSvgString(empty)).not.toContain('data-map-rivers');
    expect(riverTerrainElevation(map, [0], { x: 100, y: 100 })).toBeNull();
  });

  it('replaces a mouth with conserved fractional distributaries, never an extra full-flow river', () => {
    const map = fixture();
    const result = generateRiverGeometry(map, controlled(true, false));
    expect(result.rivers!.deltas).toHaveLength(1);
    const delta = result.rivers!.deltas[0];
    const branches = result.rivers!.reaches.filter((r) => delta.branchReachIds.includes(r.id));
    expect(branches).toHaveLength(2);
    expect(branches.reduce((sum, r) => sum + r.flow, 0)).toBe(10);
    expect(
      result.rivers!.reaches.filter(
        (r) => r.drainageEdgeId === delta.drainageEdgeId && r.kind === 'ordinary',
      ),
    ).toHaveLength(0);
    expect(riverNetworkError(result, result.rivers)).toBeNull();
    expect(riverOutlets(result.rivers!, delta.splitJunctionId)).toHaveLength(2);
    const svg = buildRegionMapSvgString(result);
    reviewSvg('delta.svg', svg);
    expect(svg).toContain('data-river-kind="distributary"');
    expect(svg).toContain('data-river-size="stream"');
  });

  it('retains lake mouths and failed-chance ocean mouths, and saves real island holes', () => {
    const map = fixture();
    const noDelta = generateRiverGeometry(map, controlled(false, false));
    expect(noDelta.rivers!.deltas).toHaveLength(0);
    const lake = fixture();
    for (const node of lake.nodes.filter((n) => n.isWater)) node.isOcean = false;
    for (const j of lake.rivers!.junctions)
      if (j.role.kind === 'outlet' && j.role.target.kind === 'ocean') j.role.target.kind = 'lake';
    const result = generateRiverGeometry(lake, controlled(false, true));
    expect(result.rivers!.deltas).toHaveLength(0);
    expect(result.rivers!.islands).toHaveLength(1);
    const island = result.rivers!.islands[0],
      reach = result.rivers!.reaches.find((r) => r.id === island.reachId)!;
    const centre = island.outline.reduce(
      (p, q) => ({ x: p.x + q.x / island.outline.length, y: p.y + q.y / island.outline.length }),
      { x: 0, y: 0 },
    );
    expect(isRiverWaterAt(result.rivers!, centre)).toBe(false);
    expect(
      isRiverWaterAt(result.rivers!, {
        x: centre.x + reach.samples[Math.floor(reach.samples.length / 2)].waterWidth * 0.35,
        y: centre.y,
      }),
    ).toBe(true);
    expect(riverEnvelope(reach)).toHaveLength(reach.samples.length * 2);
    const svg = buildRegionMapSvgString(result);
    expect(svg).toContain('data-river-island=');
    reviewSvg('island.svg', svg);
  });

  it('pins an actual road crossing while bending elsewhere', () => {
    const map = fixture(),
      edge = map.edges.find((e) => (e.v0 === 4 && e.v1 === 7) || (e.v1 === 4 && e.v0 === 7))!;
    edge.road = 1;
    const result = generateRiverGeometry(map, new RNG('road'));
    const reach = result.rivers!.reaches.find((r) => r.drainageEdgeId === edge.id)!;
    expect(
      reach.samples.some((s) => Math.abs(s.point.x - 5) < 1e-10 && Math.abs(s.point.y - 6) < 1e-10),
    ).toBe(true);
    expect(result.edges).toEqual(map.edges);
  });

  it('saves visible bends in gentle terrain instead of adding renderer-only jitter', () => {
    const map = fixture(),
      rng = new RNG('meanders');
    vi.spyOn(rng, 'int').mockImplementation((min, max) => (min === -1000 ? 650 : max));
    const result = generateRiverGeometry(map, rng);
    const main = result.rivers!.reaches.find((r) => r.flow === 10)!;
    expect(main.samples.some((sample) => Math.abs(sample.point.x - 5) > 0.01)).toBe(true);
    expect(riverNetworkError(result, result.rivers)).toBeNull();
    reviewSvg('meanders.svg', buildRegionMapSvgString(result));
  });

  it('adopts only valid legacy topology and rejects malformed graph/network data safely', () => {
    const map = generateRiverGeometry(fixture(), controlled(false, false));
    const legacy = legacyRiverNetwork(map);
    expect(legacy?.origin).toBe('legacy');
    expect(legacy?.islands).toEqual([]);
    expect(legacyRiverNetwork({})).toBeUndefined();
    const bad = (change: (copy: RegionMap) => void) => {
      const copy = structuredClone(map);
      change(copy);
      expect(riverNetworkError(copy, copy.rivers)).not.toBeNull();
    };
    bad((m) => {
      m.rivers!.junctions[0].localSupply += 1;
    });
    bad((m) => {
      m.rivers!.reaches[0].fromJunctionId = 'missing';
    });
    bad((m) => {
      m.rivers!.reaches[0].flow = NaN;
    });
    bad((m) => {
      m.rivers!.reaches[0].samples[0].point.x = Infinity;
    });
    bad((m) => {
      m.rivers!.reaches[0].samples[0].waterWidth = 1;
    });
    bad((m) => {
      m.rivers!.reaches[0].samples[1].waterWidth = -1;
    });
    bad((m) => {
      m.rivers!.reaches[0].drainageEdgeId = 999;
    });
    bad((m) => {
      m.rivers!.junctions[1].id = m.rivers!.junctions[0].id;
    });
    bad((m) => {
      m.nodes[0].edges = [];
    });
    bad((m) => {
      m.corners[1].protrudes = [];
    });
    bad((m) => {
      m.edges[0].v0 = 999;
    });
    bad((m) => {
      m.nodes[0].center.x = 1e20;
    });
    bad((m) => {
      m.corners[0].point.y = -100;
    });
    bad((m) => {
      const j = m.rivers!.junctions[0];
      j.location = { kind: 'surface', nodeId: 6 };
      j.point = { ...m.nodes[6].center };
    });
    bad((m) => {
      m.rivers!.junctions.at(-1)!.role = { kind: 'outlet', target: { kind: 'lake', nodeId: 0 } };
    });
    expect(riverNetworkError(map, { ...map.rivers, version: 99 })).toContain('Unsupported');
    expect(riverNetworkError(map, { ...map.rivers, reaches: null })).toContain('lists');
    expect(() =>
      buildRegionMapSvgString({ ...map, rivers: { ...map.rivers!, version: 99 } as never }),
    ).toThrow('Unsupported');
  });
});
