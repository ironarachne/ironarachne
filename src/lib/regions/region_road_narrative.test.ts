import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { MapNode, MapEdge } from '$lib/map';
import { roadNarrative } from './region_road_narrative';

const node = (overrides: Partial<MapNode> = {}): MapNode =>
  ({
    id: 7,
    temperature: 15,
    moisture: 0.5,
    isCoast: false,
    biomeId: 'barren',
    ...overrides,
  }) as MapNode;
const edge = (river: number): MapEdge => ({ id: 12, river, road: 1 }) as MapEdge;
const generate = (nodes: MapNode[], edges: MapEdge[] = [], seed = 'road') =>
  roadNarrative('route:1', nodes, edges, { recentSelections: [] }, new RNG(seed));

describe('road narrative', () => {
  it.each([
    [node({ isCoast: true }), /coast/, 'isCoast'],
    [node({ biomeId: 'temperate forest' }), /forest|woodland/, 'biomeId'],
    [node({ biomeId: 'prairie' }), /grassland|open country/, 'biomeId'],
    [node({ temperature: 0 }), /cold|freezing/i, 'temperature'],
    [node({ temperature: 30, moisture: 0.2 }), /hot|dry/, 'moisture'],
  ] as const)('grounds the paragraph and hook in path evidence', (local, expected, property) => {
    const result = generate([local]);
    const [detail, hook] = result.text.split(' Hook:');
    expect(detail).toMatch(expected);
    expect(hook).toMatch(expected);
    expect(result.sources).toContainEqual({
      kind: 'map-node',
      nodeId: 7,
      property,
      observedValue: String(local[property]),
    });
    expect(result.text.split('.').filter((sentence) => sentence.trim())).toHaveLength(3);
  });

  it('uses river evidence only when the traced road crosses a river', () => {
    const result = generate([node()], [edge(2)]);
    expect(result.text).toMatch(/river/);
    expect(result.text.split(' Hook:')[1]).toMatch(/crossing|river/);
    expect(result.sources).toEqual([
      { kind: 'map-edge', edgeId: 12, property: 'river', observedValue: '2' },
    ]);
    expect(generate([node()], [edge(0)]).text).not.toMatch(/river|crossing/);
  });

  it('gives ordinary routes a useful journey hook without inventing local features', () => {
    const result = generate([node({ temperature: 29, moisture: 0.1 })]);
    expect(result.text).toMatch(/Hook:/);
    expect(result.text).not.toMatch(/forest|coast|river|freezing|hot|dry|bridge|inn|bandit/);
    expect(result.sources).toEqual([]);
    expect(result.text.split('.').filter((sentence) => sentence.trim())).toHaveLength(3);
  });

  it('reproduces paragraphs while varying wording and eligible focus across seeds', () => {
    const nodes = [node({ biomeId: 'forest', isCoast: true })];
    expect(generate(nodes)).toEqual(generate(nodes));
    const results = Array.from({ length: 20 }, (_, index) => generate(nodes, [], `road:${index}`));
    expect(new Set(results.map((result) => result.text)).size).toBeGreaterThan(5);
    expect(results.some((result) => result.text.includes('forest'))).toBe(true);
    expect(results.some((result) => result.text.includes('coast'))).toBe(true);
    for (const result of results) {
      const hook = result.text.split(' Hook:')[1];
      const source = result.sources[0];
      expect(source.kind).toBe('map-node');
      if (source.kind === 'map-node')
        expect(hook).toMatch(source.property === 'isCoast' ? /coast/ : /woodland|forest/);
    }
  });

  it('avoids repeating paragraphs within a stable batch without mutating its inputs', () => {
    const nodes = [node({ biomeId: 'woodland' })];
    const before = structuredClone(nodes);
    const rng = new RNG('batch');
    const context = { recentSelections: [] };
    const first = roadNarrative('route:1', nodes, [], context, rng);
    const second = roadNarrative('route:2', nodes, [], first.nextContext, rng);
    expect(second.text).not.toBe(first.text);
    expect(nodes).toEqual(before);
    expect(context.recentSelections).toEqual([]);
  });
});
