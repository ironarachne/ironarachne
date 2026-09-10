import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate, getDefaultConfig } from '$lib/regions';
import { buildRegionMapSvgString } from './region_map_svg';
import type { RegionMap } from './map_graph';

function checkFrame(svg: string, width: number, height: number) {
  const view = svg
    .match(/viewBox="([^"]+)"/)![1]
    .split(' ')
    .map(Number);
  expect(view).toEqual([-width * 0.05, -height * 0.05, width * 1.1, height * 1.1]);
  expect(svg).toContain('<g id="map-content" clip-path="url(#map-content-clip)">');
  expect(svg).toContain(
    `<clipPath id="map-content-clip"><rect width="${width}" height="${height}"/>`,
  );
  const frame = svg.slice(svg.indexOf('<g id="map-frame"'));
  const lines = [
    ...frame.matchAll(
      /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" stroke-width="([^"]+)"/g,
    ),
  ];
  expect(lines).toHaveLength(2);
  for (const line of lines) {
    const [x, y, w, h, stroke] = line.slice(1).map(Number);
    expect(x - stroke / 2).toBeGreaterThan(view[0]);
    expect(y - stroke / 2).toBeGreaterThan(view[1]);
    expect(x + w + stroke / 2).toBeLessThan(view[0] + view[2]);
    expect(y + h + stroke / 2).toBeLessThan(view[1] + view[3]);
  }
}

describe('region furniture', () => {
  it.each(['alpha', 'bravo', 'charlie'])(
    'frames %s with a compass clear of its text and markers',
    (seed) => {
      const config = getDefaultConfig(new RNG(seed));
      config.rng = new RNG(seed);
      config.nameGeneratorSet = getFantasyNameGeneratorSet('tiefling', new RNG(seed));
      config.mapWidth = 60;
      config.mapHeight = 35;
      const region = generate(config),
        original = structuredClone(region.map);
      const options = {
        title: region.name,
        settlements: region.settlements.map((s, i) => ({ ...s, isCapital: i === 0 })),
      };
      const svg = buildRegionMapSvgString(region.map, options);
      checkFrame(svg, 60, 35);
      const compass = svg.match(/id="map-compass" data-reserved-box="([^"]+)"/);
      expect(compass).not.toBeNull();
      const [left, top, right, bottom] = compass![1].split(' ').map(Number);
      expect(left).toBeGreaterThan(0);
      expect(top).toBeGreaterThan(0);
      expect(right).toBeLessThan(60);
      expect(bottom).toBeLessThan(35);
      for (const text of svg.matchAll(/data-text-box="([^"]+)"/g)) {
        const [x0, y0, x1, y1] = text[1].split(' ').map(Number);
        expect(left < x1 && right > x0 && top < y1 && bottom > y0).toBe(false);
      }
      expect(svg).toContain('aria-label="North"');
      expect(svg).not.toMatch(/scale-bar|map-legend|miles|leagues/);
      expect(buildRegionMapSvgString(region.map, options)).toBe(svg);
      expect(region.map).toEqual(original);
    },
  );

  it.each([
    [20, 20],
    [80, 10],
    [10, 80],
  ])('frames an empty inland %sx%s map without changing its aspect ratio', (width, height) => {
    const map: RegionMap = { width, height, nodes: [], edges: [], corners: [] };
    const svg = buildRegionMapSvgString(map);
    checkFrame(svg, width, height);
    expect(svg).toContain('id="map-compass"');
    const dimensions = svg
      .match(/<svg[^>]+width="([^"]+)" height="([^"]+)"/)!
      .slice(1)
      .map(Number);
    expect(dimensions[0] / dimensions[1]).toBeCloseTo(width / height, 4);
  });
});
