import { describe, expect, it } from 'vitest';
import { settlementReferencesFixture } from '../../../test_fixtures/region_settlement_references';
import { buildRegionMapSvgString } from './region_map_svg';
import { placeSettlementIcon } from './settlement_icons';
import {
  placeSettlementKeys,
  settlementIndexLines,
  settlementLeaderBoxes,
  settlementMapReferences,
} from './settlement_references';
import { inscriptionBounds, mapTextStyle, mapTextWidth } from './region_map_typography';
import type { SettlementMapReference } from './settlement_reference_types';
import type { TextBox } from './terrain_glyph_types';

const overlaps = (a: TextBox, b: TextBox) =>
  a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;

describe('settlement map references', () => {
  it('retains every saved identity and literal name in deterministic standalone exports', () => {
    const { map, options } = settlementReferencesFixture();
    const before = structuredClone({ map, options });
    const svg = buildRegionMapSvgString(map, options);
    expect(svg).toContain('id="settlement-index"');
    expect(svg).toContain('Ilistair’s Folly');
    expect(svg).toContain('Maenas');
    expect(svg).toContain('W'.repeat(100));
    expect(svg).toContain('East &amp; West &lt;Harbor&gt;');
    for (const [index, settlement] of options.settlements!.entries()) {
      expect(svg).toContain(
        `data-feature-id="${settlement.id}" data-feature-kind="settlement" data-settlement-key="${index + 1}"`,
      );
      expect(svg).toContain(
        `data-feature-id="${settlement.id}" data-feature-kind="settlement" data-settlement-index="${index + 1}"`,
      );
    }
    expect(buildRegionMapSvgString(map, options)).toBe(svg);
    expect(
      buildRegionMapSvgString(map, {
        ...options,
        settlements: [...options.settlements!].reverse(),
      }),
    ).toBe(svg);
    expect({ map, options }).toEqual(before);
  });

  it('does not redraw building artwork when a rename requires the index fallback', () => {
    const { map, options } = settlementReferencesFixture();
    const before = buildRegionMapSvgString(map, options);
    options.settlements = options.settlements!.map((settlement) => ({ ...settlement, name: 'A' }));
    const renamed = buildRegionMapSvgString(map, options);
    const icons = (svg: string) =>
      [...svg.matchAll(/<g[^>]+data-settlement-icon[^>]+>[\s\S]*?<\/g><\/g>/g)].map(
        (match) => match[0],
      );
    expect(icons(before)).toHaveLength(options.settlements.length);
    expect(icons(renamed)).toEqual(icons(before));
  });

  it('uses unchanged site coordinates and reserves keys before names, including edge sites', () => {
    const { map, options } = settlementReferencesFixture();
    const icons = options.settlements!.map((s) =>
      placeSettlementIcon(map, map.nodes.find((n) => n.id === s.mapNodeId)!, s, 0.3),
    );
    const references = settlementMapReferences(map, icons);
    const forbidden = icons.map((icon) => icon.bounds);
    const keys = placeSettlementKeys(map, references, forbidden, 0.36);
    expect(keys).toHaveLength(references.length);
    for (const reference of references) {
      expect(reference.site).toEqual(
        map.nodes.find(
          (n) =>
            n.id === options.settlements!.find((s) => s.id === reference.settlementId)!.mapNodeId,
        )!.center,
      );
      const key = keys.find((key) => key.settlementId === reference.settlementId)!;
      const measured = inscriptionBounds(String(key.key), mapTextStyle(0.36), {
        kind: 'straight',
        origin: key.origin,
        anchor: 'middle',
      });
      expect(key.bounds).toEqual(measured);
      for (const box of forbidden) expect(overlaps(key.bounds, box)).toBe(false);
      for (const other of keys)
        if (key !== other) expect(overlaps(key.bounds, other.bounds)).toBe(false);
    }
  });

  it('uses distinct IDs for duplicate names and excludes unmapped and unnamed inputs', () => {
    const { map, options } = settlementReferencesFixture();
    options.settlements![0].name = options.settlements![1].name;
    options.settlements!.push(
      { id: 'unmapped', mapNodeId: 999, name: 'No false site' },
      { id: 'unnamed', mapNodeId: 4 },
    );
    const svg = buildRegionMapSvgString(map, options);
    expect(svg).not.toContain('No false site');
    expect(svg).not.toContain(
      'data-feature-id="unnamed" data-feature-kind="settlement" data-settlement-key',
    );
    expect(svg).toContain(
      'data-feature-id="settlement:1" data-feature-kind="settlement" data-settlement-key="1"',
    );
    expect(svg).toContain(
      'data-feature-id="settlement:2" data-feature-kind="settlement" data-settlement-key="2"',
    );
  });

  it('routes gutter keys to saved sites without crossing unrelated artwork or each other', () => {
    const { map } = settlementReferencesFixture();
    map.width = 4;
    map.height = 4;
    const a: SettlementMapReference = {
      settlementId: 'a',
      key: 1,
      name: 'A',
      site: { x: 1, y: 2 },
      markerBounds: { minX: 0, maxX: 1.8, minY: 0, maxY: 4 },
    };
    const b: SettlementMapReference = {
      settlementId: 'b',
      key: 2,
      name: 'B',
      site: { x: 3, y: 2 },
      markerBounds: { minX: 2.2, maxX: 4, minY: 0, maxY: 4 },
    };
    const keys = placeSettlementKeys(map, [a, b], [a.markerBounds, b.markerBounds], 1);
    expect(keys.map((key) => key.kind)).toEqual(['gutter', 'gutter']);
    for (const [index, key] of keys.entries()) {
      expect(key.leader.at(-1)).toEqual([a, b][index].site);
      for (const segment of settlementLeaderBoxes(key.leader, 0.03)) {
        expect(overlaps(segment, [b, a][index].markerBounds)).toBe(false);
        for (const other of keys) {
          expect(overlaps(segment, other.bounds)).toBe(false);
          if (other !== key)
            for (const otherSegment of settlementLeaderBoxes(other.leader, 0.03))
              expect(overlaps(segment, otherSegment)).toBe(false);
        }
      }
    }
    expect(placeSettlementKeys(map, [a, b], [a.markerBounds, b.markerBounds], 1)).toEqual(keys);
  });

  it('bends a gutter leader around an intervening reservation', () => {
    const { map } = settlementReferencesFixture();
    map.width = 1;
    map.height = 1;
    const reference: SettlementMapReference = {
      settlementId: 'a',
      key: 1,
      name: 'A',
      site: { x: 0.5, y: 0.5 },
      markerBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    };
    const obstacle = { minX: -0.8, maxX: -0.2, minY: 0.2, maxY: 0.8 };
    const [key] = placeSettlementKeys(map, [reference], [reference.markerBounds, obstacle], 1);
    expect(key.kind).toBe('gutter');
    expect(key.leader.length).toBeGreaterThanOrEqual(4);
    for (const box of settlementLeaderBoxes(key.leader, 0.03))
      expect(overlaps(box, obstacle)).toBe(false);
    expect(key.leader.at(-1)).toEqual(reference.site);
  });

  it('wraps full authored names by measured width without losing spaces or Unicode characters', () => {
    for (const name of [
      'W'.repeat(500),
      'a WWWWMWMW',
      'Éléonore’s House & Harbor',
      'The  Court of Many Long Names',
      '💎'.repeat(30),
    ]) {
      const lines = settlementIndexLines(name, 5, 1);
      expect(lines.join('')).toBe(name);
      expect(lines.length).toBeGreaterThan(1);
      for (const line of lines) expect(mapTextWidth(line, mapTextStyle(1))).toBeLessThanOrEqual(5);
    }
    const decomposed = 'e\u0301'.repeat(20);
    const decomposedLines = settlementIndexLines(decomposed, 2, 1);
    expect(decomposedLines.join('')).toBe(decomposed);
    expect(decomposedLines.every((line) => !/^\p{Mark}/u.test(line))).toBe(true);
    expect(settlementIndexLines('', 5, 1)).toEqual([]);
  });
});
