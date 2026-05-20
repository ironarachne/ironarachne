import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { buildBaseMapGraph } from './builder.js';
import { buildRegionMapSvgString } from './region_map_svg.js';
import type { RegionMap } from './map_graph.js';

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
