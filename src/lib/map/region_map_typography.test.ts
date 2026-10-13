import {
  typographyRiverFixture,
  typographyRangeFixture,
  typographyForestFixture,
} from '../../../test_fixtures/region_typography';
import { describe, expect, it } from 'vitest';
import type { MapNode, RegionMap } from './map_graph';
import {
  arcPoint,
  riverLabelSections,
  labelPolylineSections,
  areaLabelSections,
  boxesIntersect,
  inscriptionBounds,
  inscriptionFits,
  labelAreaNodes,
  mapInscription,
  mapTextRuns,
  mapTextStyle,
  mapScrollLayout,
  mapTextWidth,
  placeArcInscription,
  pointInLabelArea,
  serializeMapInscription,
} from './region_map_typography';
import { buildRegionMapSvgString } from './region_map_svg';
import type { MapArcBaseline } from './region_map_typography_types';

const sheet: RegionMap = { width: 60, height: 35, nodes: [], edges: [], corners: [] };
function cell(id: number, x: number, y: number, size = 10): MapNode {
  const vertices = [
    { x, y },
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
  ];
  return {
    id,
    center: { x: x + size / 2, y: y + size / 2 },
    polygon: { vertices, edges: [] },
    neighbors: [],
    edges: [],
    corners: [],
    elevation: 0.1,
    moisture: 0.5,
    temperature: 15,
    isWater: false,
    isOcean: false,
    isCoast: false,
    biomeId: 'temperate grassland',
  };
}
const arc: MapArcBaseline = {
  kind: 'arc',
  start: { x: 10, y: 15 },
  control: { x: 20, y: 10 },
  end: { x: 30, y: 15 },
};
const font = '&apos;Times New Roman&apos;, serif';

describe('map inscription geometry and typography', () => {
  it('measures the emitted small-cap runs, including accents and case expansion', () => {
    const style = mapTextStyle(1, { letterCase: 'smallCaps', trackingEms: 0.04 });
    const runs = mapTextRuns('Éléonore ß!', style);
    expect(runs[0]).toEqual({ text: 'É', fontSize: 1 });
    expect(runs.map((run) => run.text).join('')).toBe('ÉLÉONORE SS!');
    expect(runs.some((run) => run.fontSize === 0.8)).toBe(true);
    const width = mapTextWidth('Éléonore ß!', style);
    expect(width).toBeGreaterThan(mapTextWidth('Éléonore ß!', { ...style, trackingEms: 0 }));
    expect(mapTextRuns('e\u0301', style)).toEqual([{ text: 'E\u0301', fontSize: 0.8 }]);
    expect(mapTextWidth('é', mapTextStyle(1))).toBe(mapTextWidth('e', mapTextStyle(1)));
    expect(mapTextWidth('?', mapTextStyle(1))).toBe(1.1);
    expect(mapTextWidth('WW', mapTextStyle(1))).toBeGreaterThan(
      mapTextWidth('ii', mapTextStyle(1)),
    );
  });
  it('retains punctuation and non-cased characters and measures empty text', () => {
    expect(mapTextRuns('123 漢字', mapTextStyle(1, { letterCase: 'smallCaps' }))).toEqual([
      { text: '123 漢字', fontSize: 1 },
    ]);
    expect(mapTextRuns('', mapTextStyle(1))).toEqual([]);
    expect(mapTextWidth('', mapTextStyle(1))).toBe(0);
  });
  it('reserves italic overhang, tracking, halo, and clearance for all anchors', () => {
    const normal = mapTextStyle(1),
      italic = mapTextStyle(1, { italic: true, trackingEms: 0.04 });
    for (const anchor of ['start', 'middle', 'end'] as const) {
      const base = { kind: 'straight' as const, origin: { x: 20, y: 15 }, anchor };
      const a = inscriptionBounds('Old mill', normal, base),
        b = inscriptionBounds('Old mill', italic, base);
      expect(b.maxX - b.minX).toBeGreaterThan(a.maxX - a.minX);
      expect(b.minY).toBeLessThan(a.minY);
      expect(b.maxY).toBeGreaterThan(a.maxY);
      expect(b.minY).toBeLessThan(14);
    }
  });
  it('contains the entire curved glyph envelope between samples', () => {
    const style = mapTextStyle(1),
      bounds = inscriptionBounds('River', style, arc);
    for (let i = 0; i <= 128; i++) {
      const p = arcPoint(arc, i / 128);
      expect(p.x - 1.5).toBeGreaterThan(bounds.minX);
      expect(p.x + 1.5).toBeLessThan(bounds.maxX);
      expect(p.y - 1.5).toBeGreaterThan(bounds.minY);
      expect(p.y + 1.5).toBeLessThan(bounds.maxY);
    }
    expect(arcPoint(arc, 0.5)).toEqual({ x: 20, y: 12.5 });
    expect(inscriptionFits(bounds, sheet, [])).toBe(true);
    expect(inscriptionFits(bounds, sheet, [bounds])).toBe(false);
    expect(inscriptionFits({ ...bounds, minX: -1 }, sheet, [])).toBe(false);
    expect(boxesIntersect(bounds, { minX: 40, minY: 20, maxX: 50, maxY: 30 })).toBe(false);
  });
  it('selects a connected area in stable order and does not span separated patches', () => {
    const a = cell(2, 10, 10),
      b = cell(1, 20, 10),
      c = cell(3, 45, 10);
    a.neighbors = [1];
    b.neighbors = [2];
    const map = { ...sheet, nodes: [a, b, c] };
    const nodes = labelAreaNodes(map, [1, 2, 3, 999]);
    expect(nodes.map((node) => node.id)).toEqual([1, 2]);
    expect(labelAreaNodes({ ...map, nodes: [c, b, a] }, [3, 2, 1])).toEqual(nodes);
    expect(pointInLabelArea({ x: 15, y: 15 }, nodes)).toBe(true);
    expect(pointInLabelArea({ x: 40, y: 15 }, nodes)).toBe(false);
    expect(areaLabelSections(nodes)).toEqual(areaLabelSections([...nodes].reverse()));
    expect(areaLabelSections([])).toEqual([]);
    expect(labelAreaNodes({ ...sheet, nodes: [{ ...a, isWater: true }] }, [2])).toEqual([]);
  });
  it('places one shallow readable arc and rejects too-short, vertical, or blocked sections', () => {
    const style = mapTextStyle(1, { trackingEms: 0.04 });
    const sections = [
      [
        { x: 8, y: 17 },
        { x: 50, y: 17 },
      ],
    ];
    const placed = placeArcInscription('forest:1', 'Old Forest', style, sections, sheet, []);
    expect(placed?.baseline.kind).toBe('arc');
    expect(placeArcInscription('forest:1', 'Old Forest', style, sections, sheet, [])).toEqual(
      placed,
    );
    expect(
      placeArcInscription('forest:1', 'Old Forest', style, sections, sheet, [
        { minX: 0, minY: 0, maxX: 60, maxY: 35 },
      ]),
    ).toBeNull();
    expect(
      placeArcInscription(
        'id',
        'Long name',
        style,
        [
          [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
          ],
        ],
        sheet,
        [],
      ),
    ).toBeNull();
    expect(
      placeArcInscription(
        'id',
        'Name',
        style,
        [
          [
            { x: 20, y: 3 },
            { x: 20, y: 32 },
          ],
        ],
        sheet,
        [],
      ),
    ).toBeNull();
    expect(placeArcInscription('id', 'Name', style, sections, sheet, [], () => false)).toBeNull();
    expect(
      placeArcInscription(
        'id',
        'Name',
        style,
        [
          [
            { x: 50, y: 17 },
            { x: 8, y: 17 },
          ],
        ],
        sheet,
        [],
      )?.baseline,
    ).toEqual(placeArcInscription('id', 'Name', style, sections, sheet, [])?.baseline);
  });
  it('emits matching curved halo and ink, escaped metadata, and unambiguous SVG IDs', () => {
    const style = mapTextStyle(1, { italic: true });
    const inscription = mapInscription('river:"<&', 'The <& River', style, arc);
    const output = serializeMapInscription(inscription, font, '#332211', '#eeddbb');
    expect(output.halo).toContain('<defs><path id="map-label-');
    expect(output.halo).toContain(' Q ');
    expect(output.ink).toContain('rotate=');
    expect(output.ink).toContain('font-style="italic"');
    expect(output.ink).toContain('data-map-name="The &lt;&amp; River"');
    expect(output.halo.match(/<tspan[\s\S]*<\/text>/)![0]).toBe(
      output.ink.match(/<tspan[\s\S]*<\/text>/)![0],
    );
    const other = serializeMapInscription(
      mapInscription('river:<&"', 'River', style, arc),
      font,
      '#332211',
      '#eeddbb',
    );
    expect(output.halo.match(/id="([^"]+)"/)![1]).not.toBe(other.halo.match(/id="([^"]+)"/)![1]);
    const caps = serializeMapInscription(
      mapInscription('town', 'Town', mapTextStyle(1, { letterCase: 'smallCaps' }), {
        kind: 'straight',
        origin: { x: 20, y: 15 },
        anchor: 'middle',
      }),
      font,
      '#332211',
      '#eeddbb',
    );
    expect(caps.ink).toContain('<tspan font-size="0.8">OWN</tspan>');
    expect(caps.ink).toContain('aria-label="Town"');
  });
});

describe('region map typography integration', () => {
  it('uses a scroll footprint rather than a rectangular title panel', () => {
    const svg = buildRegionMapSvgString(sheet, { title: 'Duchy <& Coast' });
    expect(svg).toContain('data-title-scroll="true"');
    expect(svg).toContain('id="title-cartouche" data-reserved-box=');
    expect(svg).not.toContain('<rect id="title-cartouche"');
    expect(svg).toContain('Duchy &lt;&amp; Coast');
  });
  it.each(['hamlet', 'village', 'town', 'borough', 'city', 'metropolis'] as const)(
    'styles the saved %s category and a capital independently',
    (category) => {
      const map = { ...sheet, nodes: [cell(0, 20, 10)] };
      const svg = buildRegionMapSvgString(map, {
        settlements: [{ mapNodeId: 0, name: 'Test Haven', category }],
      });
      expect(svg).toContain(
        `data-map-case="${['hamlet', 'village'].includes(category) ? 'normal' : 'smallCaps'}"`,
      );
      const capital = buildRegionMapSvgString(map, {
        settlements: [{ mapNodeId: 0, name: 'Test Haven', category, isCapital: true }],
      });
      expect(capital).toContain('data-map-case="smallCaps"');
    },
  );
  it('makes point landmarks italic and larger while area names follow a single arc', () => {
    const map = { ...sheet, nodes: [cell(0, 5, 10, 25), cell(1, 40, 10)] };
    const svg = buildRegionMapSvgString(map, {
      features: [
        { id: 'landmark:1', name: 'Old Mill', kind: 'landmark', nodeIds: [1], edgeIds: [] },
        { id: 'area:1', name: 'Greenwood', kind: 'habitat', nodeIds: [0], edgeIds: [] },
      ],
    });
    const landmark = svg.match(/<text[^>]+data-map-name="Old Mill"[^>]*>/)![0];
    expect(landmark).toContain('font-style="italic"');
    expect(Number(landmark.match(/font-size="([^"]+)"/)![1])).toBeCloseTo(3 * 0.22 * 1.15, 3);
    expect(svg).toContain('rotate=');
    expect(svg).toContain('data-map-name="Greenwood"');
    const reordered = buildRegionMapSvgString(
      { ...map, nodes: [...map.nodes].reverse() },
      {
        features: [
          { id: 'area:1', name: 'Greenwood', kind: 'habitat', nodeIds: [0], edgeIds: [] },
          { id: 'landmark:1', name: 'Old Mill', kind: 'landmark', nodeIds: [1], edgeIds: [] },
        ],
      },
    );
    expect(reordered.slice(reordered.indexOf('<g id="map-text"'))).toBe(
      svg.slice(svg.indexOf('<g id="map-text"')),
    );
  });
  it('omits unnamed or unrendered river facts', () => {
    const base = buildRegionMapSvgString(sheet);
    expect(
      buildRegionMapSvgString(sheet, {
        rivers: [{ id: 'river:1', name: 'Invisible River', edgeIds: [999] }],
      }),
    ).toBe(base);
    expect(
      buildRegionMapSvgString(sheet, { rivers: [{ id: 'river:1', name: ' ', edgeIds: [] }] }),
    ).toBe(base);
  });
});

describe('named river label geometry', () => {
  const reach = (id: string, from: string, to: string, x: number, end: number) => ({
    id,
    edgeId: Number(id),
    from,
    to,
    points: [
      { x, y: 17 },
      { x: end, y: 17 },
    ],
  });
  it('joins a continuous named channel but never crosses a confluence or disconnected anchor', () => {
    const a = reach('1', 'a', 'b', 5, 20),
      b = reach('2', 'b', 'c', 20, 40),
      c = reach('3', 'x', 'b', 10, 20);
    expect(riverLabelSections([a, b], [1, 2])).toEqual([
      [
        { x: 5, y: 17 },
        { x: 20, y: 17 },
        { x: 40, y: 17 },
      ],
    ]);
    expect(riverLabelSections([b, a], [2, 1])).toEqual(riverLabelSections([a, b], [1, 2]));
    const split = riverLabelSections([a, b, c], [1, 2]);
    expect(split).toHaveLength(2);
    expect(split[0]).toEqual(b.points);
    expect(riverLabelSections([a, b], [1])).toEqual([a.points]);
    expect(riverLabelSections([a, b], [999])).toEqual([]);
  });
  it('terminates on cycles and uses bounded continuous local sections', () => {
    const a = reach('1', 'a', 'b', 5, 20),
      b = reach('2', 'b', 'a', 20, 5);
    expect(riverLabelSections([a, b], [1, 2])).toHaveLength(1);
    expect(labelPolylineSections([])).toEqual([]);
    const points = Array.from({ length: 12 }, (_, i) => ({ x: i, y: 17 }));
    expect(labelPolylineSections(points)).toHaveLength(3);
    expect(labelPolylineSections(points)[1]).toEqual(points.slice(0, 5));
  });
});

it.each([true, false])('labels only the rendered named river in network=%s', (network) => {
  const { map, options } = typographyRiverFixture(network);
  const svg = buildRegionMapSvgString(map, options);
  expect(svg).toContain('data-feature-kind="river"');
  expect(svg).toContain('data-map-name="Aster River"');
  expect(svg.match(/data-feature-id="route:river:review"/g)).toHaveLength(2);
  expect(svg).not.toMatch(/NaN|Infinity/);
  expect(buildRegionMapSvgString(structuredClone(map), structuredClone(options))).toBe(svg);
  const unnamed = buildRegionMapSvgString(map, { ...options, rivers: [] });
  // Typography never changes the drawn channel geometry.
  expect(svg.match(/<g data-map-rivers[\s\S]*?<\/g><\/g>/)?.[0]).toBe(
    unnamed.match(/<g data-map-rivers[\s\S]*?<\/g><\/g>/)?.[0],
  );
});

it('curves a saved mountain-range name along its ordered spine', () => {
  const { map, options } = typographyRangeFixture();
  expect(options.mountainRanges!.length).toBeGreaterThan(0);
  const svg = buildRegionMapSvgString(map, options);
  expect(svg).toContain('data-feature-kind="range"');
  expect(svg).toContain('data-map-name="Greyback Mountains"');
  expect(svg).toMatch(/<tspan[^>]+rotate=/);
  const reordered = { ...map, nodes: [...map.nodes].reverse(), edges: [...map.edges].reverse() };
  const other = buildRegionMapSvgString(reordered, options);
  expect(other.slice(other.indexOf('<g id="map-text"'))).toBe(
    svg.slice(svg.indexOf('<g id="map-text"')),
  );
});

it('preserves mountain artwork underneath its name', () => {
  const { map, options } = typographyRangeFixture();
  const named = buildRegionMapSvgString(map, options);
  const unnamed = buildRegionMapSvgString(map, {
    ...options,
    mountainRanges: options.mountainRanges!.map((range) => ({ ...range, name: '' })),
  });
  const marks = (svg: string) =>
    [...svg.matchAll(/<use[^>]+data-range-id="[^"]+"[^>]*>/g)].map((match) => match[0]);
  expect(marks(named).length).toBeGreaterThan(5);
  expect(marks(named)).toEqual(marks(unnamed));
});

it('preserves the complete forest canopy underneath its name', () => {
  const { map, options } = typographyForestFixture();
  const named = buildRegionMapSvgString(map, options);
  const unnamed = buildRegionMapSvgString(map, { ...options, features: [] });
  const marks = (svg: string) =>
    [...svg.matchAll(/<path data-forest-canopy="true"[^>]*>/g)].map((match) => match[0]);
  expect(marks(named).length).toBeGreaterThan(10);
  expect(marks(named)).toEqual(marks(unnamed));
});

it('keeps word spaces across small-cap size transitions in both painted copies', () => {
  const inscription = mapInscription(
    'town',
    'High Haven',
    mapTextStyle(1, { letterCase: 'smallCaps', trackingEms: 0.04 }),
    { kind: 'straight', origin: { x: 20, y: 15 }, anchor: 'middle' },
  );
  const output = serializeMapInscription(inscription, font, '#332211', '#eeddbb');
  for (const text of [output.halo, output.ink]) {
    expect(text).toContain('&#160;');
    expect(text).toContain('xml:space="preserve"');
    expect(text).toContain('word-spacing="0.1"');
    expect(text).toContain('data-map-name="High Haven"');
  }
});

it('reserves projecting scroll rolls and authors waved, cut long edges', () => {
  const scroll = mapScrollLayout('The Long Marches', 60, 1.3, 1);
  expect(scroll.bounds.minY).toBe(1);
  expect(scroll.bounds.minX).toBeGreaterThan(0);
  expect(scroll.bounds.maxX).toBeLessThan(60);
  expect(scroll.bodyPath.match(/M /g)).toHaveLength(3);
  expect(scroll.bodyPath.match(/C /g)!.length).toBeGreaterThan(10);
  expect(scroll.foldPaths).toHaveLength(2);
  expect(inscriptionFits(scroll.title.bounds, sheet, [])).toBe(true);
  expect(scroll.title.bounds.minY).toBeGreaterThan(scroll.bounds.minY);
  expect(scroll.title.bounds.maxY).toBeLessThan(scroll.bounds.maxY);
});
