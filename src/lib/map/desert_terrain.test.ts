import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { desertBiomeKind, desertCellProfile, deriveDesertOasisSites } from './desert_terrain';
import type { MapNode, RegionMap } from './map_graph';
import { assignTerrainGlyphs } from './terrain_glyph_assignment';
import { buildRegionMapSvgString } from './region_map_svg';
import { TERRAIN_GLYPH_VARIANTS } from './terrain_glyph_catalog';
import { makeWaterClearanceTest } from './water_clearance';
import { riverEnvelope } from './river_geometry';

function cell(id: number, x = 45, y = 45, size = 5): MapNode {
  return {
    id,
    biomeId: 'subtropical desert',
    elevation: 0.1,
    moisture: 0.1,
    temperature: 30,
    isWater: false,
    isOcean: false,
    isCoast: false,
    center: { x: x + size / 2, y: y + size / 2 },
    polygon: {
      vertices: [
        { x, y },
        { x: x + size, y },
        { x: x + size, y: y + size },
        { x, y: y + size },
      ],
      edges: [],
    },
    neighbors: [],
    edges: [],
    corners: [],
  };
}

function lakeFixture(): RegionMap {
  const water = { ...cell(0), isWater: true, biomeId: 'freshwater lake', neighbors: [1, 2] };
  return {
    width: 100,
    height: 100,
    nodes: [water, { ...cell(1, 40), neighbors: [0] }, { ...cell(2, 50), neighbors: [0] }],
    edges: [],
    corners: [],
  };
}

/** Full grid with graph edges so the renderer can derive the lake's processed shoreline. */
function drawnFixture(waterId = 209): RegionMap {
  const width = 20,
    size = 5;
  const map: RegionMap = { width: 100, height: 100, nodes: [], edges: [], corners: [] };
  for (let row = 0; row < width; row++)
    for (let col = 0; col < width; col++) {
      const id = row * width + col;
      const node = cell(id, col * size, row * size, size);
      node.neighbors = [
        col > 0 ? id - 1 : -1,
        col < width - 1 ? id + 1 : -1,
        row > 0 ? id - width : -1,
        row < width - 1 ? id + width : -1,
      ].filter((id) => id >= 0);
      map.nodes.push(node);
    }
  const water = map.nodes[waterId];
  water.isWater = true;
  water.biomeId = 'freshwater lake';
  water.corners = [0, 1, 2, 3];
  water.edges = [0, 1, 2, 3];
  map.corners = water.polygon.vertices.map((point, id) => ({
    id,
    point,
    touches: [water.id],
    protrudes: [id, (id + 3) % 4],
    adjacent: [(id + 1) % 4, (id + 3) % 4],
    elevation: 0,
    moisture: 1,
    temperature: 30,
    isWater: true,
    isOcean: false,
    isCoast: true,
    river: 0,
  }));
  map.edges = water.polygon.vertices.map((point, id) => ({
    id,
    d0: water.id,
    v0: id,
    v1: (id + 1) % 4,
    river: 0,
    midpoint: {
      x: (point.x + water.polygon.vertices[(id + 1) % 4].x) / 2,
      y: (point.y + water.polygon.vertices[(id + 1) % 4].y) / 2,
    },
  }));
  return map;
}

function placed(svg: string) {
  return [
    ...svg.matchAll(
      /<use href="#(desert-[^"]+)" transform="translate\((-?[\d.]+), (-?[\d.]+)\) rotate\((-?[\d.]+)\) scale\(([\d.]+)\)"/g,
    ),
  ].map((m) => {
    const angle = (Number(m[4]) * Math.PI) / 180,
      scale = Number(m[5]);
    return {
      id: m[1],
      anchor: { x: Number(m[2]), y: Number(m[3]) },
      footprint: TERRAIN_GLYPH_VARIANTS.find((v) => v.id === m[1])!.footprint.map((p) => ({
        x: Number(m[2]) + scale * (p.x * Math.cos(angle) - p.y * Math.sin(angle)),
        y: Number(m[3]) + scale * (p.x * Math.sin(angle) + p.y * Math.cos(angle)),
      })),
    };
  });
}

describe('desert classification', () => {
  it.each([
    ['subtropical desert', 'warm'],
    [' HOT DESERT ', 'warm'],
    ['cold desert', 'cold'],
    ['desert', 'unspecified'],
    ['dry scrub', null],
    ['savanna', null],
    ['desert woodland', null],
    [undefined, null],
  ])('classifies %s exactly', (name, kind) => expect(desertBiomeKind(name)).toBe(kind));

  it('restricts cactus evidence to warm, finite, plain land', () => {
    expect(desertCellProfile(cell(0), 'plain')?.cactusEligible).toBe(true);
    for (const patch of [
      { temperature: 19.99 },
      { temperature: NaN },
      { temperature: Infinity },
      { biomeId: 'cold desert' },
    ])
      expect(desertCellProfile({ ...cell(0), ...patch }, 'plain')?.cactusEligible).toBe(false);
    expect(
      desertCellProfile({ ...cell(0), biomeId: 'desert', temperature: 20 }, 'plain')
        ?.cactusEligible,
    ).toBe(true);
    expect(desertCellProfile(cell(0), 'hill')?.cactusEligible).toBe(false);
    expect(desertCellProfile({ ...cell(0), isWater: true }, 'plain')).toBeNull();
    expect(desertCellProfile({ ...cell(0), isOcean: true }, 'plain')).toBeNull();
    expect(desertCellProfile({ ...cell(0), biomeId: 'unknown' }, 'plain')).toBeNull();
  });

  it('uses relief without losing peaks, selects reproducible sparse cacti, and leaves cold deserts bare of vegetation', () => {
    const map = drawnFixture();
    map.nodes[0].elevation = 1;
    map.nodes[1].elevation = 0.6;
    map.nodes[2].elevation = 0.3;
    const result = assignTerrainGlyphs(map);
    expect(result.get(0)?.family).toBe('mountainHigh');
    expect(result.get(1)?.family).toBe('mountain');
    expect(result.get(2)?.family).toBe('desertRock');
    expect(result.has(209)).toBe(false);
    const cacti = [...result.values()].filter((a) => a.family === 'desertCactus');
    expect(cacti.length).toBeGreaterThan(30);
    expect(cacti.length).toBeLessThan(120);
    expect(assignTerrainGlyphs(structuredClone(map))).toEqual(result);
    map.nodes.forEach((node) => (node.biomeId = 'cold desert'));
    expect([...assignTerrainGlyphs(map).values()].some((a) => a.family === 'desertCactus')).toBe(
      false,
    );
  });
});

describe('oasis evidence', () => {
  it('derives sorted, stable connected lake evidence without mutating the map', () => {
    const map = lakeFixture(),
      original = structuredClone(map);
    const sites = deriveDesertOasisSites(map);
    expect(sites).toEqual([
      { id: 'desert-oasis:0', waterNodeIds: [0], shoreNodeIds: [1, 2], waterArea: 25 },
    ]);
    expect(map).toEqual(original);
    const second = { ...cell(3, 45, 50), isWater: true, neighbors: [0, 2] };
    map.nodes.push(second);
    map.nodes[0].neighbors.push(3);
    const joined = deriveDesertOasisSites(map);
    expect(joined[0].waterNodeIds).toEqual([0, 3]);
    expect(joined[0].waterArea).toBe(50);
    map.nodes.reverse().forEach((node) => node.neighbors.reverse());
    expect(deriveDesertOasisSites(map)).toEqual(joined);
  });

  it('accepts the exact area limit and rejects larger, empty, invalid, and boundary water', () => {
    const map = lakeFixture();
    map.nodes[0].polygon = cell(0, 45, 45, 10).polygon;
    expect(deriveDesertOasisSites(map)).toHaveLength(1);
    map.nodes[0].polygon = cell(0, 45, 45, 10.01).polygon;
    expect(deriveDesertOasisSites(map)).toEqual([]);
    for (const vertices of [
      [],
      [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
      cell(0, 0, 45).polygon.vertices,
      cell(0, 95, 45).polygon.vertices,
      cell(0, 45, 0).polygon.vertices,
      cell(0, 45, 95).polygon.vertices,
      cell(0, NaN).polygon.vertices,
    ]) {
      map.nodes[0].polygon.vertices = vertices;
      expect(deriveDesertOasisSites(map)).toEqual([]);
    }
    expect(deriveDesertOasisSites({ ...map, width: 0 })).toEqual([]);
    expect(deriveDesertOasisSites({ ...map, height: Infinity })).toEqual([]);
  });

  it('requires a fully desert land boundary and at least one eligible warm plain shore', () => {
    for (const patch of [{ biomeId: 'savanna' }, { isOcean: true }]) {
      const map = lakeFixture();
      Object.assign(map.nodes[1], patch);
      expect(deriveDesertOasisSites(map)).toEqual([]);
    }
    const map = lakeFixture();
    map.nodes[0].neighbors = [];
    expect(deriveDesertOasisSites(map)).toEqual([]);
    map.nodes[0].neighbors = [999];
    expect(deriveDesertOasisSites(map)).toEqual([]);
    map.nodes[0].neighbors = [1, 2];
    map.nodes[1].biomeId = 'cold desert';
    expect(deriveDesertOasisSites(map)[0].shoreNodeIds).toEqual([2]);
    map.nodes[2].temperature = 19;
    expect(deriveDesertOasisSites(map)).toEqual([]);
    map.nodes[2].temperature = 30;
    map.nodes[2].elevation = 0.8;
    expect(deriveDesertOasisSites(map)).toEqual([]);
  });

  it('cannot derive an oasis from moisture or rivers without a lake', () => {
    const map = lakeFixture();
    map.nodes[0].isWater = false;
    map.nodes[0].moisture = 1;
    map.nodes[0].biomeId = 'subtropical desert';
    map.rivers = {
      version: 1,
      origin: 'generated',
      junctions: [],
      reaches: [],
      islands: [],
      deltas: [],
    };
    expect(deriveDesertOasisSites(map)).toEqual([]);
    map.nodes[0].isOcean = true;
    map.nodes[0].isWater = true;
    expect(deriveDesertOasisSites(map)).toEqual([]);
  });
});

describe('desert rendering', () => {
  it('places one water-supported oasis and keeps every desert footprint clear of drawn water', () => {
    const map = drawnFixture(),
      original = structuredClone(map);
    const svg = buildRegionMapSvgString(map);
    expect(svg).toBe(buildRegionMapSvgString(structuredClone(map)));
    expect(map).toEqual(original);
    const glyphs = placed(svg);
    expect(glyphs.filter((g) => g.id.startsWith('desert-oasis'))).toHaveLength(1);
    expect(glyphs.some((g) => g.id.startsWith('desert-cactus'))).toBe(true);
    expect(glyphs.some((g) => g.id.startsWith('desert-dune'))).toBe(true);
    const waterPath = svg.match(/<path data-water-body="lake" d="([^"]+)"/)![1];
    const numbers = [...waterPath.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
    const outline = Array.from({ length: numbers.length / 2 }, (_, i) => ({
      x: numbers[i * 2],
      y: numbers[i * 2 + 1],
    }));
    const clear = makeWaterClearanceTest([outline], 0.18);
    for (const glyph of glyphs) {
      expect(clear(glyph.footprint), glyph.id).toBe(true);
      expect(glyph.footprint.every((p) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100)).toBe(
        true,
      );
    }
    expect(svg).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('omits unselected lakes, missing processed shores, cold-only shores, and unfittable marks', () => {
    const unselected = drawnFixture(210);
    expect(
      new RNG('region-glyphs:100:100:400:desert-oasis:210:selection').float(0, 1),
    ).toBeGreaterThan(0.35);
    expect(
      placed(buildRegionMapSvgString(unselected)).some((g) => g.id.startsWith('desert-oasis')),
    ).toBe(false);
    const missing = drawnFixture();
    missing.edges = [];
    expect(
      placed(buildRegionMapSvgString(missing)).some((g) => g.id.startsWith('desert-oasis')),
    ).toBe(false);
    const cold = drawnFixture();
    cold.nodes.forEach((node) => (node.biomeId = 'cold desert'));
    expect(placed(buildRegionMapSvgString(cold)).every((g) => !/oasis|cactus/.test(g.id))).toBe(
      true,
    );
    const noFit = drawnFixture();
    for (const id of noFit.nodes[209].neighbors) {
      const node = noFit.nodes[id];
      node.polygon.vertices = cell(id, node.center.x, node.center.y, 0.001).polygon.vertices;
    }
    expect(
      placed(buildRegionMapSvgString(noFit)).some((g) => g.id.startsWith('desert-oasis')),
    ).toBe(false);
    // A failed fit must not leave a spacing reservation behind.
    const withoutSite = structuredClone(noFit);
    for (const id of withoutSite.nodes[209].neighbors) withoutSite.nodes[id].temperature = 19;
    expect(buildRegionMapSvgString(withoutSite)).toBe(buildRegionMapSvgString(noFit));
  });

  it('keeps desert ink outside the saved river channel and its join disks', () => {
    const map = drawnFixture();

    for (const id of [129, 149, 169, 189]) {
      const node = map.nodes[id];
      node.corners = node.polygon.vertices.map((point) => {
        const cornerId = map.corners.length;
        map.corners.push({
          ...map.corners[0],
          id: cornerId,
          point,
          touches: [id],
          protrudes: [],
          adjacent: [],
          elevation: 0.1,
          isWater: false,
        });
        return cornerId;
      });
    }
    const sourceCorner = map.corners.length;
    const edgeId = map.edges.length;
    map.corners.push({
      ...map.corners[0],
      id: sourceCorner,
      point: { x: 47, y: 30 },
      touches: [129],
      protrudes: [edgeId],
      adjacent: [0],
      downslope: 0,
      elevation: 0.1,
      isWater: false,
    });
    map.corners[0].touches.push(129);
    map.corners[0].protrudes.push(edgeId);
    map.corners[0].adjacent.push(sourceCorner);
    map.nodes[129].corners.push(sourceCorner, 0);
    map.nodes[129].edges.push(edgeId);
    map.edges.push({
      id: edgeId,
      d0: 129,
      v0: sourceCorner,
      v1: 0,
      river: 3,
      midpoint: { x: 46, y: 40 },
    });
    map.rivers = {
      version: 1,
      origin: 'legacy',
      islands: [],
      deltas: [],
      junctions: [
        {
          id: 'source',
          point: { x: 47, y: 30 },
          localSupply: 3,
          location: { kind: 'corner', cornerId: sourceCorner },
          role: { kind: 'source' },
        },
        {
          id: 'outlet',
          point: { x: 45, y: 50 },
          localSupply: 0,
          location: { kind: 'corner', cornerId: 0 },
          role: { kind: 'outlet', target: { kind: 'lake', nodeId: 209 } },
        },
      ],
      reaches: [
        {
          id: 'channel',
          fromJunctionId: 'source',
          toJunctionId: 'outlet',
          drainageEdgeId: edgeId,
          kind: 'ordinary',
          flow: 3,
          sizeClass: 'channel',
          corridorNodeIds: [129, 149, 169, 189, 209],
          samples: [
            { point: { x: 47, y: 30 }, waterWidth: 0 },
            { point: { x: 45, y: 50 }, waterWidth: 1 },
          ],
        },
      ],
    };
    const glyphs = placed(buildRegionMapSvgString(map));
    const clear = makeWaterClearanceTest([riverEnvelope(map.rivers.reaches[0], 0.2)], 0.18);
    expect(glyphs.length).toBeGreaterThan(5);
    for (const glyph of glyphs) expect(clear(glyph.footprint), glyph.id).toBe(true);
  });
});
