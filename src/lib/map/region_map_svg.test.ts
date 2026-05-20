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
    const vertices1 = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    const vertices2 = [{ x: 20, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 20, y: 10 }];
    const vertices3 = [{ x: 40, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 10 }, { x: 40, y: 10 }];

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
});

