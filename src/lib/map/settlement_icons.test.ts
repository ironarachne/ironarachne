import { describe, expect, it } from 'vitest';
import { all as settlementCategories } from '$lib/settlements';
import {
  CAPITAL_PENNANT,
  SETTLEMENT_BUILDING_VARIANTS,
  SETTLEMENT_ICON_PROFILES,
} from './settlement_icon_catalog';
import {
  capitalPennantAnchor,
  composeSettlementIcon,
  normalizeSettlementIconCategory,
  placeSettlementIcon,
  resolveSettlementIconCategory,
  transformIconBounds,
} from './settlement_icons';
import { expandInkStroke } from './terrain_glyph_ink';
import { buildRegionMapSvgString } from './region_map_svg';
import type { MapNode, RegionMap } from './map_graph';
import type { RegionMapSvgSettlement } from './region_map_svg_types';

const node: MapNode = {
  id: 7,
  center: { x: 20, y: 15 },
  polygon: {
    edges: [],
    vertices: [
      { x: 15, y: 10 },
      { x: 25, y: 10 },
      { x: 25, y: 20 },
      { x: 15, y: 20 },
    ],
  },
  neighbors: [],
  edges: [],
  corners: [],
  elevation: 0.3,
  moisture: 0.5,
  temperature: 15,
  isWater: false,
  isOcean: false,
  isCoast: false,
  biomeId: 'temperate grassland',
};
const map: RegionMap = { width: 40, height: 30, nodes: [node], edges: [], corners: [] };
const settlement: RegionMapSvgSettlement = {
  id: 'town:1',
  mapNodeId: 7,
  category: 'city',
  name: 'Town',
  population: 20000,
};
const contains = (
  outer: { minX: number; maxX: number; minY: number; maxY: number },
  inner: { minX: number; maxX: number; minY: number; maxY: number },
) => {
  expect(inner.minX).toBeGreaterThanOrEqual(outer.minX - 1e-9);
  expect(inner.maxX).toBeLessThanOrEqual(outer.maxX + 1e-9);
  expect(inner.minY).toBeGreaterThanOrEqual(outer.minY - 1e-9);
  expect(inner.maxY).toBeLessThanOrEqual(outer.maxY + 1e-9);
};

/** Ray crossing against the filled artwork, independently of the placement footprint model. */
function insideBody(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside;
  }
  return inside;
}

describe('settlement icon categories and artwork', () => {
  it('uses every existing category and its population boundaries, with safe fallbacks', () => {
    expect(SETTLEMENT_ICON_PROFILES.map((p) => p.category)).toEqual(
      settlementCategories().map((c) => c.name),
    );
    for (const category of settlementCategories()) {
      expect(resolveSettlementIconCategory({ population: category.minSize })).toBe(category.name);
      expect(resolveSettlementIconCategory({ population: category.maxSize })).toBe(category.name);
      expect(normalizeSettlementIconCategory(` ${category.name.toUpperCase()} `)).toBe(
        category.name,
      );
    }
    for (const population of [undefined, NaN, Infinity, -1, 0, 1])
      expect(resolveSettlementIconCategory({ population })).toBe('hamlet');
    expect(resolveSettlementIconCategory({ population: 4000000 })).toBe('metropolis');
    expect(resolveSettlementIconCategory({ category: 'village', population: 999999 })).toBe(
      'village',
    );
    expect(normalizeSettlementIconCategory('unknown')).toBeUndefined();
    expect(normalizeSettlementIconCategory(undefined)).toBeUndefined();
    expect(
      resolveSettlementIconCategory({
        category: 'unknown' as unknown as RegionMapSvgSettlement['category'],
        population: 1000,
      }),
    ).toBe('town');
  });

  it('uses isometric ground axes and vertical walls for every building variant', () => {
    for (const variant of SETTLEMENT_BUILDING_VARIANTS) {
      const coordinates = variant.artwork.bodyPaths[0].match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      const points = Array.from({ length: coordinates.length / 2 }, (_, i) => ({
        x: coordinates[i * 2],
        y: coordinates[i * 2 + 1],
      }));
      const [left, front, right, rightEave, ridgeBack, ridgeFront] = points;
      expect((front.y - left.y) / (front.x - left.x)).toBeCloseTo(1 / Math.sqrt(3), 8);
      expect((right.y - front.y) / (right.x - front.x)).toBeCloseTo(-1 / Math.sqrt(3), 8);
      expect(rightEave.x).toBe(right.x);
      expect(rightEave.y).toBeLessThan(right.y);
      expect((ridgeBack.y - ridgeFront.y) / (ridgeBack.x - ridgeFront.x)).toBeCloseTo(
        -1 / Math.sqrt(3),
        8,
      );
    }
  });

  it('encloses all parchment bodies and expanded ink, with three variants per kind', () => {
    for (const kind of ['cottage', 'hall', 'tower'])
      expect(SETTLEMENT_BUILDING_VARIANTS.filter((v) => v.kind === kind)).toHaveLength(3);
    for (const artwork of [
      ...SETTLEMENT_BUILDING_VARIANTS.map((v) => v.artwork),
      CAPITAL_PENNANT,
    ]) {
      const bounds = transformIconBounds(artwork.footprint, { x: 0, y: 0 }, 1);
      const points = artwork.strokes.flatMap(expandInkStroke);
      for (const path of artwork.bodyPaths) {
        const numbers = path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        for (let i = 0; i < numbers.length; i += 2)
          points.push({ x: numbers[i], y: numbers[i + 1] });
      }
      contains(bounds, transformIconBounds(points, { x: 0, y: 0 }, 1));
    }
  });
});

describe('settlement icon composition', () => {
  it('keeps exact category counts and visible roofs across varied identities', () => {
    const expected = [
      [2, 0, 0],
      [3, 1, 0],
      [4, 1, 0],
      [4, 2, 1],
      [5, 2, 2],
      [6, 3, 3],
    ];
    for (const [index, profile] of SETTLEMENT_ICON_PROFILES.entries()) {
      for (let seed = 0; seed < 40; seed++) {
        const icon = composeSettlementIcon(map, node, {
          ...settlement,
          category: profile.category,
          id: String(seed),
        });
        expect(
          ['cottage', 'hall', 'tower'].map(
            (kind) => icon.buildings.filter((b) => b.variantId.includes(kind)).length,
          ),
        ).toEqual(expected[index]);
        const boxes = icon.buildings.map((b) =>
          transformIconBounds(
            SETTLEMENT_BUILDING_VARIANTS.find((v) => v.id === b.variantId)!.artwork.footprint,
            b.anchor,
            b.scale,
          ),
        );
        for (const box of boxes) contains(icon.bounds, box);
        // Ground depth controls painter order: a rear building can never paint over a nearer one.
        for (let i = 1; i < icon.buildings.length; i++)
          expect(icon.buildings[i - 1].anchor.y).toBeLessThanOrEqual(icon.buildings[i].anchor.y);

        const bodies = icon.buildings.map((building) => {
          const artwork = SETTLEMENT_BUILDING_VARIANTS.find(
            (v) => v.id === building.variantId,
          )!.artwork;
          const numbers = artwork.bodyPaths[0].match(/-?\d+(?:\.\d+)?/g)!.map(Number);
          return Array.from({ length: numbers.length / 2 }, (_, i) => ({
            x: numbers[i * 2] * building.scale + building.anchor.x,
            y: numbers[i * 2 + 1] * building.scale + building.anchor.y,
          }));
        });
        for (const [i, body] of bodies.entries()) {
          // An intersection must include filled body interior, not just a padded footprint.
          const box = transformIconBounds(body, { x: 0, y: 0 }, 1);
          const samples = Array.from({ length: 40 * 40 }, (_, sample) => ({
            x: box.minX + (((sample % 40) + 0.5) / 40) * (box.maxX - box.minX),
            y: box.minY + ((Math.floor(sample / 40) + 0.5) / 40) * (box.maxY - box.minY),
          })).filter((point) => insideBody(point, body));
          expect(
            samples.some((point) => bodies.some((other, j) => j !== i && insideBody(point, other))),
          ).toBe(true);
          // Upper roof ink remains exposed after all later parchment bodies are painted.
          expect(
            samples.some(
              (point) =>
                point.y < box.minY + (box.maxY - box.minY) * 0.4 &&
                bodies.slice(i + 1).every((other) => !insideBody(point, other)),
            ),
          ).toBe(true);
        }
      }
    }
  });

  it('repeats exactly, varies between sites, and ignores names, population, and neighbor ordering', () => {
    const original = composeSettlementIcon(map, node, settlement);
    expect(
      composeSettlementIcon(
        structuredClone(map),
        structuredClone(node),
        structuredClone(settlement),
      ),
    ).toEqual(original);
    expect(
      composeSettlementIcon(map, node, { ...settlement, name: 'Renamed', population: 40000 }),
    ).toEqual(original);
    expect(
      composeSettlementIcon({ ...map, nodes: [...map.nodes].reverse() }, node, settlement),
    ).toEqual(original);
    expect(composeSettlementIcon(map, node, { ...settlement, id: 'town:2' })).not.toEqual(original);
    expect(composeSettlementIcon(map, node, { mapNodeId: 7 })).toEqual(
      composeSettlementIcon(map, node, { mapNodeId: 7 }),
    );
    const capital = composeSettlementIcon(map, node, { ...settlement, isCapital: true });
    expect(capital.buildings).toEqual(original.buildings);
    expect(capital.bounds.minY).toBeLessThan(original.bounds.minY);
    contains(
      capital.bounds,
      transformIconBounds(CAPITAL_PENNANT.footprint, capitalPennantAnchor(capital), 1),
    );
  });

  it('fits every category and capital at ordinary, near-edge, and exact-edge sites', () => {
    for (const profile of SETTLEMENT_ICON_PROFILES)
      for (const isCapital of [false, true]) {
        for (const center of [
          { x: 20, y: 15 },
          { x: 0.001, y: 0.001 },
          { x: 39.999, y: 29.999 },
          { x: 0, y: 0 },
          { x: 40, y: 30 },
        ]) {
          const site = { ...node, center };
          const placed = placeSettlementIcon(
            map,
            site,
            { ...settlement, category: profile.category, isCapital },
            0.5,
          );
          expect(placed.scale).toBeGreaterThan(0);
          expect(Number.isFinite(placed.scale)).toBe(true);
          contains({ minX: 0, minY: 0, maxX: 40, maxY: 30 }, placed.bounds);
          expect(placed.settlement.mapNodeId).toBe(7);
          if (center.x === 20) expect(placed.anchor).toEqual(center);
        }
        const ordinary = placeSettlementIcon(
          map,
          node,
          { ...settlement, category: profile.category },
          0.5,
        );
        const capital = placeSettlementIcon(
          map,
          node,
          { ...settlement, category: profile.category, isCapital: true },
          0.5,
        );
        expect(capital.scale).toBe(ordinary.scale);
      }
  });

  it('renders semantic identity, category, and capital treatment without losing road sites', () => {
    const input = { ...settlement, id: 'town:"<&', isCapital: true };
    const svg = buildRegionMapSvgString(map, { settlements: [input] });
    expect(svg).toBe(buildRegionMapSvgString(map, { settlements: [input] }));
    expect(svg).toContain('data-feature-id="town:&quot;&lt;&amp;"');
    expect(svg).toContain('data-settlement-icon="city"');
    expect(svg.match(/data-settlement-building=/g)).toHaveLength(9);
    expect(svg.match(/data-capital-pennant=/g)).toHaveLength(1);
    expect(svg).not.toMatch(/NaN|Infinity|★/);
    expect(buildRegionMapSvgString(map, { settlements: [{ mapNodeId: 999 }, {}] })).not.toContain(
      'data-settlement-icon=',
    );
    const nearEdgeMap = { ...map, nodes: [{ ...node, center: { x: 1e-6, y: 1e-6 } }] };
    const nearEdgeSvg = buildRegionMapSvgString(nearEdgeMap, { settlements: [input] });
    expect(nearEdgeSvg).not.toContain('scale(0)');
    const edgeMap = { ...map, nodes: [{ ...node, center: { x: 0, y: 0 } }] };
    expect(buildRegionMapSvgString(edgeMap, { settlements: [input] })).toContain('M 0 0 L');
  });
});
