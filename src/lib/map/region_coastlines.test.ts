import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate, getDefaultConfig } from '$lib/regions';
import type { Vertex } from '$lib/geometry';
import { buildRegionMapSvgString } from './region_map_svg';
import { makeWaterClearanceTest } from './water_clearance';

const silhouettes: Record<string, Vertex[]> = {
  'tree-oak': [
    { x: 0, y: 0 },
    { x: -0.8, y: -0.5 },
    { x: -1.2, y: -1.1 },
    { x: -0.7, y: -1.8 },
    { x: 0, y: -2.2 },
    { x: 0.7, y: -1.8 },
    { x: 1.2, y: -1.1 },
    { x: 0.8, y: -0.5 },
  ],
  'tree-pine': [
    { x: 0, y: 0 },
    { x: -0.8, y: -0.4 },
    { x: -0.6, y: -1.1 },
    { x: 0, y: -2 },
    { x: 0.6, y: -1.1 },
    { x: 0.8, y: -0.4 },
  ],
  'tree-palm': [
    { x: 0, y: 0 },
    { x: -0.8, y: -1.3 },
    { x: -0.55, y: -1.75 },
    { x: 0, y: -1.85 },
    { x: 0.55, y: -1.75 },
    { x: 0.8, y: -1.3 },
  ],
  'mountain-high': [
    { x: -1.4, y: 0 },
    { x: -0.4, y: -1.8 },
    { x: 0.1, y: -1.1 },
    { x: 0.6, y: -1.5 },
    { x: 1.4, y: 0 },
  ],
  'mountain-low': [
    { x: -1, y: 0 },
    { x: -0.3, y: -1 },
    { x: 0.1, y: -0.6 },
    { x: 0.5, y: -0.8 },
    { x: 1, y: 0 },
  ],
};

function parseLoop(d: string): Vertex[] {
  const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  const result: Vertex[] = [];
  for (let i = 0; i < numbers.length; i += 2) result.push({ x: numbers[i], y: numbers[i + 1] });
  return result;
}

const side = (a: Vertex, b: Vertex, p: Vertex) =>
  (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

function visibleCrossings(points: Vertex[]): number {
  let crossings = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    for (let j = i + 2; j < points.length; j++) {
      const c = points[j],
        d = points[(j + 1) % points.length];
      if (side(a, b, c) * side(a, b, d) >= 0 || side(c, d, a) * side(c, d, b) >= 0) continue;
      const t = side(c, d, a) / (side(c, d, a) - side(c, d, b));
      const x = a.x + (b.x - a.x) * t,
        y = a.y + (b.y - a.y) * t;
      if (x > 0 && x < 60 && y > 0 && y < 35) crossings++;
    }
  }
  return crossings;
}

describe.each(['alpha', 'bravo', 'charlie'])('reference coastline: %s', (seed) => {
  it('has short shore segments, shared water geometry, and glyphs clear of the rendered water', () => {
    const config = getDefaultConfig(new RNG(seed));
    config.rng = new RNG(seed);
    config.nameGeneratorSet = getFantasyNameGeneratorSet('tiefling', new RNG(seed));
    config.mapWidth = 60;
    config.mapHeight = 35;
    const region = generate(config);
    const original = structuredClone(region.map);
    const svg = buildRegionMapSvgString(region.map);
    const water = [...svg.matchAll(/<path data-water-body="(?:ocean|lake)" d="([^"]+)"/g)];
    expect(water.length).toBeGreaterThan(0);
    const loops = water.map((match) => parseLoop(match[1]));
    for (let i = 0; i < loops.length; i++) {
      const points = loops[i];
      for (let j = 0; j < points.length; j++) {
        const a = points[j],
          b = points[(j + 1) % points.length];
        // 0.3 map units (under 1% of the short dimension), plus 3-decimal rounding.
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThanOrEqual(0.302);
      }
      expect(visibleCrossings(points)).toBe(0);
      // Fill and stroke, plus river mask and the ocean clip where applicable, reuse the same path.
      expect(svg.split(`d="${water[i][1]}"`).length - 1).toBeGreaterThanOrEqual(2);
    }
    const clear = makeWaterClearanceTest(loops, 0.18);
    const glyphs = [
      ...svg.matchAll(
        /<use href="#([^"]+)" transform="translate\((-?[\d.]+), (-?[\d.]+)\) rotate\((-?[\d.]+)\) scale\(([\d.]+)\)"/g,
      ),
    ];
    expect(glyphs.length).toBeGreaterThan(100);
    for (const glyph of glyphs) {
      const [, id, x, y, rotation, scale] = glyph;
      const angle = (Number(rotation) * Math.PI) / 180;
      const outline = silhouettes[id].map((p) => ({
        x: Number(x) + Number(scale) * (p.x * Math.cos(angle) - p.y * Math.sin(angle)),
        y: Number(y) + Number(scale) * (p.x * Math.sin(angle) + p.y * Math.cos(angle)),
      }));
      expect(clear(outline), `${seed}: ${id} at ${x},${y}`).toBe(true);
    }
    expect(region.map).toEqual(original);
  });
});
