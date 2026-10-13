import { describe, expect, it } from 'vitest';
import { denseForestFixture } from '../../../scripts/region_dense_forest_fixture';
import { denseForestGeometryError, detectDenseForests } from './dense_forests';
import { makeWaterClearanceTest } from './water_clearance';
import { buildRegionMapSvgString } from './region_map_svg';

const biomes = [
  'temperate deciduous forest',
  'boreal forest',
  'tropical rainforest',
  'mangrove forest',
  'mediterranean woodland',
  'temperate rainforest',
];

describe('dense forest geography', () => {
  it.each([
    ['boreal forest', 12],
    ['temperate coniferous forest', 12],
    ['temperate deciduous forest', 8],
  ])('renders dense %s with the correct crown silhouette', (biome, segments) => {
    const map = denseForestFixture(biome);
    const denseForests = detectDenseForests(map).map((patch) => ({ ...patch, id: 'forest' }));
    const svg = buildRegionMapSvgString(map, { denseForests });
    const bodies = [...svg.matchAll(/<path data-forest-canopy="true"[^>]* d="([^"]+)"/g)];
    expect(bodies.length).toBeGreaterThan(3);
    for (const body of bodies) expect(body[1].match(/C /g)).toHaveLength(segments);
    expect(buildRegionMapSvgString(map, { denseForests })).toBe(svg);
  });

  it.each(biomes)('recognizes a compact portion of %s without changing the graph', (biome) => {
    const map = denseForestFixture(biome),
      before = structuredClone(map);
    const patches = detectDenseForests(map);
    expect(patches).toHaveLength(1);
    expect(patches[0].mapNodeIds).toHaveLength(42);
    expect(denseForestGeometryError(map, patches[0])).toBeNull();
    expect(map).toEqual(before);
    const shuffled = structuredClone(map);
    shuffled.nodes.reverse().forEach((node) => {
      node.neighbors.reverse();
      node.edges.reverse();
    });
    shuffled.edges.reverse();
    expect(detectDenseForests(shuffled)).toEqual(patches);
  });
  it('leaves small forests, savanna, water, and mountains outside patches', () => {
    const map = denseForestFixture('tropical savanna');
    expect(detectDenseForests(map)).toEqual([]);
    map.nodes.forEach((node) => {
      node.biomeId = 'boreal forest';
      node.isWater = true;
    });
    expect(detectDenseForests(map)).toEqual([]);
    map.nodes.forEach((node) => {
      node.isWater = false;
      node.elevation = node.id < 150 ? 0.95 : 0.1;
      node.biomeId = node.id < 150 ? 'boreal forest' : 'prairie';
    });
    expect(detectDenseForests(map)).toEqual([]);
    map.nodes.forEach((node) => {
      node.elevation = 0.3;
      node.biomeId = node.id < 8 ? 'boreal forest' : 'prairie';
    });
    expect(detectDenseForests(map)).toEqual([]);
  });
  it('does not cross missing edges, families, lakes, or malformed polygons', () => {
    const map = denseForestFixture();
    const patch = detectDenseForests(map)[0];
    const member = map.nodes.find((node) => node.id === patch.mapNodeIds[0])!;
    member.isWater = true;
    expect(denseForestGeometryError(map, patch)).toMatch(/ineligible/);
    member.isWater = false;
    member.biomeId = 'boreal forest';
    expect(denseForestGeometryError(map, patch)).toMatch(/disconnected|families/);
    member.biomeId = 'temperate deciduous forest';
    member.edges = [];
    expect(denseForestGeometryError(map, patch)).toMatch(/disconnected/);
    expect(denseForestGeometryError(map, { mapNodeIds: [1, 1, 2] })).toMatch(/distinct/);
    expect(denseForestGeometryError(map, { mapNodeIds: [3, 2, 1] })).toMatch(/sorted/);
    expect(denseForestGeometryError(map, { mapNodeIds: [900, 901, 902] })).toMatch(/missing/);
    map.nodes.forEach((node) => {
      node.polygon.vertices = [];
    });
    expect(detectDenseForests(map)).toEqual([]);
  });
  it('keeps at most three disjoint components, ordered by area', () => {
    const map = denseForestFixture();
    map.nodes.forEach((node) => {
      node.biomeId = biomes[Math.floor(node.id / 60)];
    });
    const patches = detectDenseForests(map);
    expect(patches).toHaveLength(3);
    const ids = patches.flatMap((patch) => patch.mapNodeIds);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('dense forest artwork', () => {
  it.each(biomes)(
    'draws %s as a coherent mass with selective ink and scattered trees outside',
    (biome) => {
      const map = denseForestFixture(biome);
      const denseForests = detectDenseForests(map).map((patch) => ({
        ...patch,
        id: 'forest:dense:test',
      }));
      const options = {
        denseForests,
        features: [
          {
            id: 'landmark:forest:dense:test',
            name: 'Greywood',
            kind: 'landmark' as const,
            nodeIds: denseForests[0].mapNodeIds,
            edgeIds: [],
          },
        ],
      };
      const svg = buildRegionMapSvgString(map, options);
      expect(svg).toContain('data-dense-forest-id="forest:dense:test"');
      expect(svg).toContain('data-forest-interior-ink="true"');
      expect(svg).toContain('data-forest-canopy="true"');
      expect(svg).toContain('data-forest-trunk="true"');
      expect(svg).not.toContain('dense-forest-clip');
      expect(svg).toContain('filter="url(#dense-forest-outline)"');
      expect(svg).toContain('Greywood');
      expect(svg).not.toContain('data-feature-marker="true"');
      expect(svg).toMatch(/<use href="#tree-/);
      expect(buildRegionMapSvgString(map, options)).toBe(svg);
      expect(buildRegionMapSvgString(map)).not.toContain('data-dense-forest-id=');
    },
  );
  it('ignores invalid forest membership and keeps road and settlement openings', () => {
    const map = denseForestFixture();
    expect(
      buildRegionMapSvgString(map, { denseForests: [{ id: 'bad', mapNodeIds: [900, 901, 902] }] }),
    ).not.toContain('data-dense-forest-id=');
    const patch = detectDenseForests(map)[0];
    const members = new Set(patch.mapNodeIds);
    const edge = map.edges.find(
      (edge) => members.has(edge.d0) && edge.d1 !== undefined && members.has(edge.d1),
    )!;
    edge.road = 1;
    const options = { denseForests: [{ ...patch, id: 'forest:dense:test' }] };
    const before = buildRegionMapSvgString(
      { ...map, edges: map.edges.map((edge) => ({ ...edge, road: 0 })) },
      options,
    );
    const after = buildRegionMapSvgString(map, {
      ...options,
      settlements: [{ mapNodeId: patch.mapNodeIds[10], name: 'Village' }],
    });
    expect(after).toContain('data-dense-forest-id=');
    expect(after).toContain('Village');
    expect(after).not.toBe(before);
    const a = map.nodes.find((node) => node.id === edge.d0)!.center;
    const b = map.nodes.find((node) => node.id === edge.d1)!.center;
    const scale = Math.min(map.width, map.height) / 35;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const dx = ((b.y - a.y) / length) * 0.12 * scale,
      dy = ((a.x - b.x) / length) * 0.12 * scale;
    const clear = makeWaterClearanceTest(
      [
        [
          { x: a.x + dx, y: a.y + dy },
          { x: b.x + dx, y: b.y + dy },
          { x: b.x - dx, y: b.y - dy },
          { x: a.x - dx, y: a.y - dy },
        ],
      ],
      0.08 * scale,
    );
    const placements = [...after.matchAll(/data-canopy-outline="([^" ]+(?: [^" ]+){3})"/g)];
    expect(placements.length).toBeGreaterThan(0);
    for (const [, points] of placements) {
      const outline = points.split(' ').map((point) => {
        const [x, y] = point.split(',').map(Number);
        return { x, y };
      });
      expect(clear(outline)).toBe(true);
    }
  });
});
