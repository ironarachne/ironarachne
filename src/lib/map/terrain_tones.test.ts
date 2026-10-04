import { describe, expect, it } from 'vitest';
import type { MapNode, RegionMap } from './map_graph';
import { buildTerrainToneLayer, REGION_WATER_FILL, terrainToneSvg } from './terrain_tones';
import { buildBaseMapGraph } from './builder';
import { buildRegionMapSvgString } from './region_map_svg';
import { RNG } from '@ironarachne/rng';

function node(id: number, biomeId?: string, elevation = 0): MapNode {
  return {
    id,
    biomeId,
    elevation,
    center: { x: id + 0.5, y: 0.5 },
    polygon: {
      vertices: [
        { x: id, y: 0 },
        { x: id + 1, y: 0 },
        { x: id + 1, y: 1 },
        { x: id, y: 1 },
      ],
      edges: [],
    },
    neighbors: [],
    edges: [],
    corners: [],
    moisture: 0,
    temperature: 0,
    isWater: false,
    isOcean: false,
    isCoast: false,
  };
}

function map(nodes: MapNode[]): RegionMap {
  return { width: Math.max(1, nodes.length), height: 1, nodes, corners: [], edges: [] };
}

describe('terrain tones', () => {
  it.each([
    [undefined, 'land'],
    ['unknown', 'land'],
    ['marsh', 'land'],
    ['savanna', 'land'],
    [' ALPINE TUNDRA ', 'tundra'],
    ['ice cap', 'tundra'],
    ['polar', 'tundra'],
    ['hot desert', 'desert'],
    ['boreal forest', 'coniferForest'],
    ['montane woodland', 'coniferForest'],
    ['coniferous forest', 'coniferForest'],
    ['pine forest', 'coniferForest'],
    ['temperate deciduous forest', 'deciduousForest'],
    ['tropical forest', 'deciduousForest'],
  ])('classifies %s as %s', (biome, family) => {
    expect(buildTerrainToneLayer(map([node(0, biome)])).tones[0].family).toBe(family);
  });

  it('darkens relative relief while retaining biome hue and leaving high water pale', () => {
    const nodes = [0, 0, 0, 0, 0.2, 0.4, 0.7].map((elevation, id) =>
      node(id, 'boreal forest', elevation),
    );
    nodes.push({ ...node(7, 'desert', 10), isWater: true });
    nodes.push({ ...node(8, 'tundra', 20), isOcean: true });
    const tones = buildTerrainToneLayer(map(nodes)).tones;
    expect(tones.slice(3, 7).map((tone) => tone.color.red)).toEqual([189, 185, 178, 170]);
    for (const tone of tones.slice(3, 7)) {
      expect(tone.color.green).toBeGreaterThan(tone.color.blue);
      expect(tone.color.blue).toBeGreaterThan(tone.color.red);
    }
    expect(tones.slice(7).map((tone) => tone.family)).toEqual(['water', 'water']);
    expect(tones[7].color).toEqual({ red: 230, green: 238, blue: 244 });
    expect(tones[8].color).toEqual(tones[7].color);
  });

  it('makes water lighter than tundra, desert, and ordinary land', () => {
    const tones = buildTerrainToneLayer(
      map([node(0), node(1, 'tundra'), node(2, 'desert'), { ...node(3), isWater: true }]),
    ).tones;
    const brightness = tones.map(
      ({ color: c }) => 0.2126 * c.red + 0.7152 * c.green + 0.0722 * c.blue,
    );
    expect(brightness[3]).toBeGreaterThan(brightness[1]);
    expect(brightness[1]).toBeGreaterThan(brightness[2]);
    expect(brightness[2]).toBeGreaterThan(brightness[0]);
  });

  it('scales blend width with geometry and preserves input deterministically', () => {
    const input = map([node(0, 'desert')]);
    const before = structuredClone(input);
    const layer = buildTerrainToneLayer(input);
    expect(buildTerrainToneLayer(input)).toEqual(layer);
    expect(input).toEqual(before);
    expect(buildTerrainToneLayer({ ...input, width: 4, height: 4 }).blurRadius).toBe(
      layer.blurRadius * 4,
    );
  });

  it('clips after filtering and fills processed water geometry without blurring it', () => {
    const svg = terrainToneSvg(map([node(0), { ...node(1), isWater: true }]), ['waterBody0']);
    expect(svg).toContain('<g mask="url(#terrain-tone-land)"><g filter="url(#terrain-tone-blur)">');
    expect(svg).toContain('<use href="#waterBody0" fill="black"/>');
    expect(svg).toContain(
      `<g data-water-tones="true" fill="${REGION_WATER_FILL}"><use href="#waterBody0"/></g>`,
    );
    expect(svg.match(/<polygon /g)).toHaveLength(1);
    expect(svg.match(/<feGaussianBlur /g)).toHaveLength(1);
  });

  it('supports empty, all-land, all-water and degenerate polygons without invalid numbers', () => {
    for (const nodes of [
      [],
      [node(0)],
      [{ ...node(0), isWater: true }],
      [{ ...node(0), polygon: { vertices: [], edges: [] } }],
    ]) {
      const svg = terrainToneSvg(map(nodes), []);
      expect(svg).not.toMatch(/NaN|Infinity|undefined/);
    }
  });

  it('places the wash before water ink, terrain symbols and labels in the complete renderer', () => {
    const input = buildBaseMapGraph({
      width: 14,
      height: 12,
      seed: 'tones',
      pointSpacing: 4,
      rng: new RNG('tones'),
    });
    for (const cell of input.nodes) cell.biomeId = 'boreal forest';
    input.nodes[0].isOcean = true;
    const svg = buildRegionMapSvgString(input, { title: 'Terrain tones' });
    expect(svg).toEqual(buildRegionMapSvgString(input, { title: 'Terrain tones' }));
    expect(svg.indexOf('data-terrain-tones')).toBeLessThan(svg.indexOf('id="title-cartouche"'));
    const symbol = svg.indexOf('<use href="#tree-pine-');
    expect(symbol).toBeGreaterThan(0);
    expect(svg.indexOf('data-terrain-tones')).toBeLessThan(symbol);
    expect(svg.indexOf('data-terrain-tones')).toBeLessThan(svg.indexOf('data-water-hatching'));
  });
});
