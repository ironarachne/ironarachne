import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { buildBaseMapGraph } from './builder.js';
import { buildRegionMapSvgString } from './region_map_svg.js';

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
});
