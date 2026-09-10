import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate, getDefaultConfig } from '$lib/regions';
import { buildRegionMapSvgString } from './region_map_svg';
import { atMapEdge } from './river_paths';

for (const seed of ['alpha', 'bravo', 'charlie']) {
  describe(`reference routes: ${seed}`, () => {
    it('keeps corner rivers connected downstream and draws rivers below terrain and roads above it', () => {
      const config = getDefaultConfig(new RNG(seed));
      config.rng = new RNG(seed);
      config.nameGeneratorSet = getFantasyNameGeneratorSet('tiefling', new RNG(seed));
      config.mapWidth = 60;
      config.mapHeight = 35;
      const region = generate(config),
        map = region.map;
      const original = structuredClone(map);
      const options = {
        title: region.name,
        settlements: region.settlements.map((s, i) => ({ ...s, isCapital: i === 0 })),
      };
      const svg = buildRegionMapSvgString(map, options);
      const drawn = [...svg.matchAll(/data-river-edge="(\d+)" data-flow="([\d.]+)"/g)];
      // Rivers now stop at lake shores; their segment count is not a rendering contract.
      expect(drawn.length).toBeGreaterThan(0);
      for (const match of drawn) {
        const edge = map.edges[Number(match[1])];
        expect(Number(match[2])).toBe(edge.river);
        let corner = map.corners[edge.v0].downslope === edge.v1 ? edge.v1 : edge.v0;
        const seen = new Set<number>();
        while (
          !atMapEdge(map.corners[corner].point, map) &&
          !map.corners[corner].touches.some((id) => map.nodes[id].isWater || map.nodes[id].isOcean)
        ) {
          expect(seen.has(corner)).toBe(false);
          seen.add(corner);
          const next = map.corners[corner].downslope;
          expect(next).toBeDefined();
          if (next === undefined) break;
          expect(
            map.edges.some(
              (e) =>
                e.river > 0 &&
                ((e.v0 === corner && e.v1 === next) || (e.v1 === corner && e.v0 === next)),
            ),
          ).toBe(true);
          corner = next;
        }
      }
      // #244: ocean outlets must belong to mapped water, regardless of corner renumbering.
      for (const corner of map.corners.filter((c) => c.isOcean)) {
        expect(corner.touches.some((id) => map.nodes[id].isWater)).toBe(true);
      }
      const lastGlyph = Math.max(
        svg.lastIndexOf('<use href="#tree-'),
        svg.lastIndexOf('<use href="#mountain-'),
      );
      expect(svg.indexOf('data-map-roads')).toBeGreaterThan(lastGlyph);
      const firstGlyph = [...svg.matchAll(/<use href="#(?:tree|mountain)-/g)][0]?.index;
      expect(firstGlyph).toBeDefined();
      expect(svg.indexOf('data-map-rivers')).toBeLessThan(firstGlyph!);
      expect(svg.indexOf('id="map-text"')).toBeGreaterThan(svg.indexOf('data-map-rivers'));
      expect(svg).not.toMatch(/NaN|Infinity|rvTapG/);
      expect(buildRegionMapSvgString(map, options)).toBe(svg);
      expect(map).toEqual(original);
    });
  });
}
