import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { buildBaseMapGraph } from './builder.js';
import { buildRegionMapSvgString } from './region_map_svg.js';
import type { RegionMap } from './map_graph.js';

type PlacedSymbol = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

const PLACED_SYMBOL_PATTERN =
  /<use href="#([^"]+)" transform="translate\((-?[\d.]+), (-?[\d.]+)\) rotate\((-?[\d.]+)\) scale\(([\d.]+)\)"/g;

function parsePlacedSymbols(svg: string): PlacedSymbol[] {
  const out: PlacedSymbol[] = [];
  for (const m of svg.matchAll(PLACED_SYMBOL_PATTERN)) {
    out.push({
      id: m[1],
      x: Number(m[2]),
      y: Number(m[3]),
      rotation: Number(m[4]),
      scale: Number(m[5]),
    });
  }
  return out;
}

/** Places a point of a glyph's silhouette (symbol space) into map space. */
function placeSilhouettePoint(symbol: PlacedSymbol, sx: number, sy: number) {
  const a = (symbol.rotation * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: symbol.x + (sx * cos - sy * sin) * symbol.scale,
    y: symbol.y + (sx * sin + sy * cos) * symbol.scale,
  };
}

function squareCellNode(id: number, minX: number, minY: number, size: number) {
  return {
    id,
    center: { x: minX + size / 2, y: minY + size / 2 },
    polygon: {
      vertices: [
        { x: minX, y: minY },
        { x: minX + size, y: minY },
        { x: minX + size, y: minY + size },
        { x: minX, y: minY + size },
      ],
      edges: [],
    },
    neighbors: [] as number[],
    edges: [] as number[],
    corners: [] as number[],
    elevation: 0.1,
    moisture: 0.8,
    temperature: 15,
    isWater: false,
    isOcean: false,
    isCoast: false,
  };
}

describe('buildRegionMapSvgString', () => {
  it('returns SVG with viewBox and at least one cell path for a built map', () => {
    const rng = new RNG('region-svg-test-seed');
    const map = buildBaseMapGraph({
      width: 14,
      height: 12,
      seed: 'svg-smoke',
      pointSpacing: 4,
      rng,
    });

    const svg = buildRegionMapSvgString(map, { title: 'Test & <Region>' });

    expect(svg.startsWith('<?xml')).toBe(true);
    expect(svg).toContain('<svg ');
    expect(svg).toContain('viewBox="0 0 14 12"');
    // Fits inside 900×600: scale = min(900/14, 600/12) = 50 → 700×600
    expect(svg).toContain('width="700"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('<path ');
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
  });

  it('correctly maps forest biomes to tree types and renders them', () => {
    const vertices1 = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const vertices2 = [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 10 },
      { x: 20, y: 10 },
    ];
    const vertices3 = [
      { x: 40, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 10 },
      { x: 40, y: 10 },
    ];

    const map: RegionMap = {
      width: 60,
      height: 20,
      nodes: [
        {
          id: 0,
          center: { x: 5, y: 5 },
          polygon: { vertices: vertices1, edges: [] },
          neighbors: [],
          edges: [],
          corners: [],
          elevation: 0.1,
          moisture: 0.8,
          temperature: 15,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'temperate deciduous forest',
        },
        {
          id: 1,
          center: { x: 25, y: 5 },
          polygon: { vertices: vertices2, edges: [] },
          neighbors: [],
          edges: [],
          corners: [],
          elevation: 0.1,
          moisture: 0.8,
          temperature: 5,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'boreal forest',
        },
        {
          id: 2,
          center: { x: 45, y: 5 },
          polygon: { vertices: vertices3, edges: [] },
          neighbors: [],
          edges: [],
          corners: [],
          elevation: 0.1,
          moisture: 0.9,
          temperature: 25,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'tropical rainforest',
        },
      ],
      edges: [],
      corners: [],
    };

    const svg = buildRegionMapSvgString(map);

    // Verify SVG contains tree symbols in defs
    expect(svg).toContain('<g id="tree-oak">');
    expect(svg).toContain('<g id="tree-pine">');
    expect(svg).toContain('<g id="tree-palm">');

    // Verify SVG references the tree symbols
    expect(svg).toContain('href="#tree-oak"');
    expect(svg).toContain('href="#tree-pine"');
    expect(svg).toContain('href="#tree-palm"');

    // Verify the old biome symbol for forest (♣) is NOT present
    expect(svg).not.toContain('♣');
  });

  it('correctly maps mountain/hill nodes to high/low peak symbols and renders them', () => {
    const vertices1 = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const vertices2 = [
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 10 },
      { x: 20, y: 10 },
    ];

    const map: RegionMap = {
      width: 40,
      height: 20,
      nodes: [
        {
          id: 0,
          center: { x: 5, y: 5 },
          polygon: { vertices: vertices1, edges: [] },
          neighbors: [],
          edges: [],
          corners: [],
          elevation: 0.85, // triggers 'high' peak symbol
          moisture: 0.2,
          temperature: 10,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'alpine',
        },
        {
          id: 1,
          center: { x: 25, y: 5 },
          polygon: { vertices: vertices2, edges: [] },
          neighbors: [],
          edges: [],
          corners: [],
          elevation: 0.65, // triggers 'low' peak symbol
          moisture: 0.2,
          temperature: 10,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'hills',
        },
      ],
      edges: [],
      corners: [],
    };

    const svg = buildRegionMapSvgString(map);

    // Verify SVG contains mountain symbols in defs
    expect(svg).toContain('<g id="mountain-high">');
    expect(svg).toContain('<g id="mountain-low">');

    // Verify SVG references the mountain symbols
    expect(svg).toContain('href="#mountain-high"');
    expect(svg).toContain('href="#mountain-low"');

    // Verify the old mountain text symbols (▲ and △) are NOT present
    expect(svg).not.toContain('▲');
    expect(svg).not.toContain('△');
  });

  it('keeps a mountain glyph, base included, inside the mountain region', () => {
    const mountain = { ...squareCellNode(0, 0, 0, 10), elevation: 0.9, biomeId: 'alpine' };
    const plain = {
      ...squareCellNode(1, 10, 0, 10),
      elevation: 0.1,
      biomeId: 'temperate grassland',
    };
    const map: RegionMap = {
      width: 20,
      height: 10,
      nodes: [mountain, plain],
      edges: [],
      corners: [],
    };

    const peaks = parsePlacedSymbols(buildRegionMapSvgString(map)).filter((s) =>
      s.id.startsWith('mountain-'),
    );
    expect(peaks.length).toBeGreaterThan(0);

    // Silhouette extremes of #mountain-high: both base corners and the apex.
    for (const peak of peaks) {
      const outline = [
        placeSilhouettePoint(peak, -1.4, 0),
        placeSilhouettePoint(peak, 1.4, 0),
        placeSilhouettePoint(peak, -0.4, -1.8),
      ];
      for (const p of outline) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(10);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(10);
      }
    }
  });

  it('keeps tree canopies inside the forest region', () => {
    const forest = { ...squareCellNode(0, 0, 0, 10), biomeId: 'temperate deciduous forest' };
    const grass = { ...squareCellNode(1, 10, 0, 10), biomeId: 'temperate grassland' };
    const map: RegionMap = {
      width: 20,
      height: 10,
      nodes: [forest, grass],
      edges: [],
      corners: [],
    };

    const trees = parsePlacedSymbols(buildRegionMapSvgString(map)).filter((s) =>
      s.id.startsWith('tree-'),
    );
    expect(trees.length).toBeGreaterThan(0);

    // Canopy extremes of #tree-oak: widest points and crown.
    for (const tree of trees) {
      const outline = [
        placeSilhouettePoint(tree, -1.2, -1.1),
        placeSilhouettePoint(tree, 1.2, -1.1),
        placeSilhouettePoint(tree, 0, -2.2),
      ];
      for (const p of outline) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(10);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(10);
      }
    }
  });

  it('draws scattered symbols back to front, so lower symbols overlap higher ones', () => {
    const map: RegionMap = {
      width: 40,
      height: 20,
      nodes: [
        { ...squareCellNode(0, 0, 0, 10), biomeId: 'temperate deciduous forest' },
        { ...squareCellNode(1, 10, 0, 10), elevation: 0.9, biomeId: 'alpine' },
        { ...squareCellNode(2, 0, 10, 10), biomeId: 'boreal forest' },
        { ...squareCellNode(3, 10, 10, 10), elevation: 0.65, biomeId: 'hills' },
      ],
      edges: [],
      corners: [],
    };

    const placed = parsePlacedSymbols(buildRegionMapSvgString(map));
    expect(placed.length).toBeGreaterThan(0);

    const baseYs = placed.map((s) => s.y);
    expect(baseYs).toEqual([...baseYs].sort((a, b) => a - b));

    // Trees and mountains share one ordering rather than being drawn in separate passes.
    const kinds = placed.map((s) => (s.id.startsWith('tree-') ? 'tree' : 'mountain'));
    const kindSwitches = kinds.filter((kind, i) => i > 0 && kind !== kinds[i - 1]).length;
    expect(kindSwitches).toBeGreaterThan(1);
  });

  it('renders ocean chart border when the map includes ocean', () => {
    const map: RegionMap = {
      width: 20,
      height: 15,
      nodes: [
        {
          id: 0,
          center: { x: 5, y: 5 },
          polygon: {
            vertices: [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
              { x: 10, y: 10 },
              { x: 0, y: 10 },
            ],
            edges: [],
          },
          neighbors: [],
          edges: [],
          corners: [],
          elevation: 0,
          moisture: 1,
          temperature: 10,
          isWater: true,
          isOcean: true,
          isCoast: false,
        },
      ],
      edges: [],
      corners: [],
    };

    const svg = buildRegionMapSvgString(map);
    expect(svg).toContain('stroke="#1e2a32"');
  });

  it('renders rivers, roads, and settlements on a connected map', () => {
    const map: RegionMap = {
      width: 30,
      height: 20,
      nodes: [
        {
          id: 0,
          center: { x: 5, y: 5 },
          polygon: {
            vertices: [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
              { x: 10, y: 10 },
              { x: 0, y: 10 },
            ],
            edges: [],
          },
          neighbors: [1],
          edges: [0],
          corners: [0, 1],
          elevation: 0.2,
          moisture: 0.5,
          temperature: 15,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'grassland',
        },
        {
          id: 1,
          center: { x: 20, y: 5 },
          polygon: {
            vertices: [
              { x: 15, y: 0 },
              { x: 25, y: 0 },
              { x: 25, y: 10 },
              { x: 15, y: 10 },
            ],
            edges: [],
          },
          neighbors: [0],
          edges: [0],
          corners: [1, 2],
          elevation: 0.2,
          moisture: 0.5,
          temperature: 15,
          isWater: false,
          isOcean: false,
          isCoast: false,
          biomeId: 'grassland',
        },
      ],
      edges: [
        {
          id: 0,
          d0: 0,
          d1: 1,
          v0: 0,
          v1: 2,
          river: 2,
          midpoint: { x: 12.5, y: 5 },
          road: 1,
        },
      ],
      corners: [
        {
          id: 0,
          point: { x: 10, y: 0 },
          touches: [0],
          protrudes: [0],
          adjacent: [1],
          elevation: 0.2,
          moisture: 0.5,
          temperature: 15,
          isWater: false,
          isOcean: false,
          isCoast: false,
          river: 0,
        },
        {
          id: 1,
          point: { x: 10, y: 10 },
          touches: [0, 1],
          protrudes: [0],
          adjacent: [0, 2],
          elevation: 0.2,
          moisture: 0.5,
          temperature: 15,
          isWater: false,
          isOcean: false,
          isCoast: false,
          river: 1,
        },
        {
          id: 2,
          point: { x: 15, y: 5 },
          touches: [1],
          protrudes: [0],
          adjacent: [1],
          elevation: 0.2,
          moisture: 0.5,
          temperature: 15,
          isWater: false,
          isOcean: false,
          isCoast: false,
          river: 0,
        },
      ],
    };

    const svg = buildRegionMapSvgString(map, {
      settlements: [{ mapNodeId: 0 }, { mapNodeId: 1, isCapital: true }],
    });

    expect(svg).toContain('stroke="#5a7a6e"');
    expect(svg).toContain('stroke-dasharray="0.45 0.4"');
    expect(svg).toContain('<circle ');
    expect(svg).toContain('★');
  });

  it('renders a procedurally built map with roads or rivers when present', () => {
    const rng = new RNG('region-svg-features');
    const map = buildBaseMapGraph({
      width: 48,
      height: 36,
      seed: 'feature-rich-region',
      pointSpacing: 3,
      rng,
    });

    const svg = buildRegionMapSvgString(map, { title: 'Generated Region' });
    const hasRiver = map.edges.some((e) => e.river > 0);
    const hasRoad = map.edges.some((e) => (e.road ?? 0) > 0);
    const hasOcean = map.nodes.some((n) => n.isOcean);

    if (hasRiver) {
      expect(svg).toContain('stroke="#5a7a6e"');
    }
    if (hasRoad) {
      expect(svg).toContain('stroke-dasharray="0.45 0.4"');
    }
    if (hasOcean) {
      expect(svg).toContain('stroke="#1e2a32"');
    }
    expect(svg).toContain('Generated Region');
  });
});
