import { expect, it } from 'vitest';
import type { MapNode, RegionMap } from './map_graph';
import { assignTerrainGlyphs } from './terrain_glyph_assignment';
import { buildRegionMapSvgString } from './region_map_svg';
import { TERRAIN_GLYPH_VARIANTS } from './terrain_glyph_catalog';
import { makeWaterClearanceTest } from './water_clearance';

function node(id: number, biomeId: string, elevation = 0.1): MapNode {
  const x = (id % 4) * 20,
    y = Math.floor(id / 4) * 20;
  return {
    id,
    biomeId,
    elevation,
    moisture: 0.8,
    temperature: 15,
    isWater: false,
    isOcean: false,
    isCoast: false,
    center: { x: x + 10, y: y + 10 },
    polygon: {
      vertices: [
        { x, y },
        { x: x + 20, y },
        { x: x + 20, y: y + 20 },
        { x, y: y + 20 },
      ],
      edges: [],
    },
    neighbors: [],
    edges: [],
    corners: [],
  };
}
function fixture(): RegionMap {
  return {
    width: 80,
    height: 80,
    edges: [],
    corners: [],
    nodes: [
      node(0, 'boreal forest', 1),
      node(1, 'temperate deciduous forest', 0.6),
      node(2, 'temperate deciduous forest', 0.3),
      node(3, 'temperate deciduous forest'),
      node(4, 'boreal forest'),
      node(5, 'mangrove forest'),
      node(6, 'flooded grassland', 0.3),
      node(7, 'temperate grassland'),
      ...Array.from({ length: 8 }, (_, i) => node(i + 8, 'desert')),
    ],
  };
}

it('assigns vegetation, relief, and desert families with mountain, wetland, hill, forest, prairie precedence', () => {
  const map = fixture();
  const original = structuredClone(map);
  const assignments = assignTerrainGlyphs(map);
  expect([...assignments.values()].map((a) => a.family)).toEqual([
    'mountainHigh',
    'mountain',
    'hill',
    'treeDeciduous',
    'treeConifer',
    'treePalm',
    'marsh',
    'prairie',
    ...Array(8).fill('desertDune'),
  ]);
  expect(assignments.get(2)?.landform).toBe('hill');
  expect(assignments.get(6)?.landform).toBe('hill');
  expect(assignments.get(8)?.family).toBe('desertDune');
  expect(map).toEqual(original);
});

it.each(['marsh', 'bog', 'fen', 'swamp', 'freshwater wetland', 'flooded grassland', ' MARSH '])(
  'recognizes %s on land only',
  (biome) => {
    const map = fixture();
    map.nodes[7].biomeId = biome;
    expect(assignTerrainGlyphs(map).get(7)?.family).toBe('marsh');
    map.nodes[7].isWater = true;
    expect(assignTerrainGlyphs(map).has(7)).toBe(false);
    map.nodes[7].isWater = false;
    map.nodes[7].isOcean = true;
    expect(assignTerrainGlyphs(map).has(7)).toBe(false);
  },
);

it.each(['montane grassland', 'tropical savanna', 'tundra', 'unknown', 'salt marsh grass'])(
  'does not invent prairie or marsh evidence for %s',
  (biome) => {
    const map = fixture();
    map.nodes[7].biomeId = biome;
    expect(assignTerrainGlyphs(map).has(7)).toBe(false);
  },
);

it.each([
  ['tropical rainforest', 'treePalm'],
  ['boreal forest', 'treeConifer'],
  ['montane woodland', 'treeConifer'],
  ['coniferous forest', 'treeConifer'],
  ['pine woodland', 'treeConifer'],
  ['temperate woodland', 'treeDeciduous'],
  ['prairie', 'prairie'],
])('preserves the %s vocabulary', (biome, family) => {
  const map = fixture();
  map.nodes[7].biomeId = biome;
  expect(assignTerrainGlyphs(map).get(7)?.family).toBe(family);
});

it('omits empty maps, missing biome plains, and respects mountains above wetland', () => {
  expect(assignTerrainGlyphs({ width: 0, height: 0, nodes: [], edges: [], corners: [] }).size).toBe(
    0,
  );
  const map = fixture();
  delete map.nodes[7].biomeId;
  map.nodes[0].biomeId = 'marsh';
  map.nodes[1].biomeId = 'marsh';
  const assigned = assignTerrainGlyphs(map);
  expect(assigned.get(0)?.family).toBe('mountainHigh');
  expect(assigned.get(1)?.family).toBe('mountain');
  expect(assigned.has(7)).toBe(false);
});

it('renders reproducible, varied terrain inside every assigned cell using its actual footprint', () => {
  const map = fixture();
  const original = structuredClone(map);
  const svg = buildRegionMapSvgString(map);
  expect(buildRegionMapSvgString(structuredClone(map))).toBe(svg);
  expect(map).toEqual(original);
  const variants = new Map(TERRAIN_GLYPH_VARIANTS.map((v) => [v.id, v]));
  const seen = new Set<string>();
  const usedFamilies = new Set<string>();
  for (const match of svg.matchAll(
    /<use href="#([^"]+)" transform="translate\((-?[\d.]+), (-?[\d.]+)\) rotate\((-?[\d.]+)\) scale\(([\d.]+)\)"/g,
  )) {
    const [, id, sx, sy, rotation, scale] = match;
    const x = Number(sx),
      y = Number(sy),
      s = Number(scale),
      angle = (Number(rotation) * Math.PI) / 180;
    const cell = map.nodes.find(
      (n) =>
        x > n.polygon.vertices[0].x &&
        x < n.polygon.vertices[2].x &&
        y > n.polygon.vertices[0].y &&
        y < n.polygon.vertices[2].y,
    )!;
    expect(cell.id).toBeLessThan(16);
    for (const p of variants.get(id)!.footprint) {
      const px = x + s * (p.x * Math.cos(angle) - p.y * Math.sin(angle));
      const py = y + s * (p.x * Math.sin(angle) + p.y * Math.cos(angle));
      expect(px).toBeGreaterThan(cell.polygon.vertices[0].x);
      expect(px).toBeLessThan(cell.polygon.vertices[2].x);
      expect(py).toBeGreaterThan(cell.polygon.vertices[0].y);
      expect(py).toBeLessThan(cell.polygon.vertices[2].y);
    }
    seen.add(id);
    usedFamilies.add(id.replace(/-\d$/, ''));
    expect(svg).toContain(`<g id="${id}">`);
  }
  expect(usedFamilies.size).toBe(9);
  expect(seen.size).toBeGreaterThan(16);
  expect(svg).toContain('data-terrain-ink="true"');
  expect(svg).not.toMatch(/NaN|Infinity|undefined/);
});

it('keeps reed tufts and their ground water strokes clear of an adjacent drawn lake', () => {
  const map = fixture();
  map.nodes[10].isWater = true;
  map.nodes[10].biomeId = 'lake';
  const vertices = map.nodes[10].polygon.vertices;
  map.nodes[10].corners = [0, 1, 2, 3];
  map.nodes[10].edges = [0, 1, 2, 3];
  map.corners = vertices.map((point, id) => ({
    id,
    point,
    touches: [10],
    protrudes: [id, (id + 3) % 4],
    adjacent: [(id + 1) % 4, (id + 3) % 4],
    elevation: 0,
    moisture: 1,
    temperature: 15,
    isWater: true,
    isOcean: false,
    isCoast: true,
    river: 0,
  }));
  map.edges = vertices.map((point, id) => ({
    id,
    d0: 10,
    v0: id,
    v1: (id + 1) % 4,
    river: 0,
    midpoint: {
      x: (point.x + vertices[(id + 1) % 4].x) / 2,
      y: (point.y + vertices[(id + 1) % 4].y) / 2,
    },
  }));
  const svg = buildRegionMapSvgString(map);
  const water = [...svg.matchAll(/<path data-water-body="lake" d="([^"]+)"/g)].map((match) => {
    const numbers = [...match[1].matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
    return Array.from({ length: numbers.length / 2 }, (_, i) => ({
      x: numbers[i * 2],
      y: numbers[i * 2 + 1],
    }));
  });
  expect(water).toHaveLength(1);
  const clear = makeWaterClearanceTest(water, 0.18);
  let reeds = 0;
  for (const match of svg.matchAll(
    /<use href="#(marsh-[0-3])" transform="translate\((-?[\d.]+), (-?[\d.]+)\) rotate\((-?[\d.]+)\) scale\(([\d.]+)\)"/g,
  )) {
    const [, id, sx, sy, rotation, scale] = match;
    const angle = (Number(rotation) * Math.PI) / 180;
    const footprint = TERRAIN_GLYPH_VARIANTS.find((v) => v.id === id)!.footprint.map((p) => ({
      x: Number(sx) + Number(scale) * (p.x * Math.cos(angle) - p.y * Math.sin(angle)),
      y: Number(sy) + Number(scale) * (p.x * Math.sin(angle) + p.y * Math.cos(angle)),
    }));
    expect(clear(footprint)).toBe(true);
    reeds++;
  }
  expect(reeds).toBeGreaterThan(0);
});
