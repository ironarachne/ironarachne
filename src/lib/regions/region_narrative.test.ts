import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { composeNarrative } from '$lib/narrative';
import type { MapNode, RegionMap } from '$lib/map';
import { landscapeNarrativeSubject } from './region_narrative';

function node(id: number, biomeId = 'bog', temperature = 12, moisture = 0.5): MapNode {
  return {
    id,
    biomeId,
    temperature,
    moisture,
    elevation: 0.1,
    neighbors: [],
    center: { x: id, y: id },
    polygon: { vertices: [], edges: [] },
    edges: [],
    corners: [],
    isOcean: false,
    isWater: false,
    isCoast: false,
  };
}
const map: RegionMap = { nodes: [], edges: [], corners: [], width: 30, height: 30 };
const build = (local: MapNode[], land: MapNode[]) =>
  landscapeNarrativeSubject('bog:1', 'bog', 'northern', local, map, land);

describe('landscape narrative eligibility', () => {
  it('omits ordinary humidity and different-type comparisons, rather than comparing a bog with a desert', () => {
    const local = node(1, 'bog', 12, 0.8);
    for (const peer of [node(2, 'bog', 14, 0.7), node(2, 'desert', 30, 0.1)]) {
      expect(
        build([local], [local, peer]).candidates.some((entry) => entry.topic === 'climate'),
      ).toBe(false);
    }
  });

  it('omits overlapping comparisons and unknown peers but offers truthful variants for significant contrast', () => {
    const local = [node(1, 'bog', 0, 0), node(2, 'bog', 25, 1)];
    expect(
      build(local, [...local, node(3)]).candidates.some((entry) => entry.topic === 'climate'),
    ).toBe(false);
    expect(build([node(1)], [node(1)]).candidates.some((entry) => entry.topic === 'climate')).toBe(
      false,
    );
    const wet = node(1, 'bog', 12, 0.9);
    const dry = node(2, 'bog', 12, 0.2);
    const subject = build([wet], [wet, dry]);
    const climate = subject.candidates.filter((entry) => entry.topic === 'climate');
    expect(climate).toHaveLength(1);
    for (const option of climate[0].templates[0].parts[0].options) {
      expect(option).toMatch(/wetter/);
      expect(option).not.toMatch(/\d|moisture =|cells/);
    }
    expect(climate[0].sourceIds).toEqual(['map-node:1', 'map-node:2']);
  });

  it('changes focus among similarly important details within a short budget while retaining identity', () => {
    const local = node(1, 'bog', 12, 0.9);
    local.isCoast = true;
    const subject = build([local], [local, node(2, 'bog', 12, 0.2)]);
    const results = Array.from({ length: 15 }, (_, seed) =>
      composeNarrative(
        subject,
        { maxSentences: 2, maxPerTopic: 1, repetitionWindow: 0 },
        { recentSelections: [] },
        new RNG(String(seed)),
      ),
    );
    expect(results.every((result) => result.selections[0].candidateId.includes('identity'))).toBe(
      true,
    );
    expect(new Set(results.map((result) => result.selections[1].candidateId)).size).toBe(2);
    expect(
      results.every(
        (result) => !result.selections.some((entry) => entry.candidateId.includes('terrain')),
      ),
    ).toBe(true);
  });
});
