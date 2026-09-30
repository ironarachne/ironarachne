import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { MapNode, RegionMap } from '$lib/map';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import { generateHabitatFacts } from './region_habitats';

function node(id: number, biomeId: string | undefined, neighbors: number[] = []): MapNode {
  return {
    id,
    biomeId,
    neighbors,
    center: { x: id, y: id },
    polygon: { vertices: [], edges: [] },
    edges: [],
    corners: [],
    elevation: 0.1,
    temperature: 12,
    moisture: 0.5,
    isOcean: false,
    isWater: false,
    isCoast: false,
  };
}

function fixture(nodes: MapNode[]) {
  const map: RegionMap = { width: 30, height: 30, nodes, edges: [], corners: [] };
  const facts = emptyRegionFacts('current');
  facts.areas.push({
    id: 'area:land',
    name: 'Regional land',
    description: 'Land',
    origin: 'generated',
    mapNodeIds: nodes.map((node) => node.id).sort((a, b) => a - b),
  });
  return { map, facts };
}

function derive(region: ReturnType<typeof fixture>) {
  generateHabitatFacts(region, new RNG('habitats'));
  expect(regionFactsError(region.facts, region.map, [])).toBeNull();
  return region.facts;
}

describe('spatial regional habitats', () => {
  it('ranks the realized dominant biome and preserves disconnected secondary footprints', () => {
    const region = fixture([
      node(1, 'forest', [2]),
      node(2, 'forest', [1]),
      node(3, 'forest'),
      node(20, 'desert'),
    ]);
    const original = structuredClone(region.map);
    const facts = derive(region);
    expect(facts.habitats.map((habitat) => habitat.name)).toEqual(['forest', 'desert']);
    expect(facts.habitats[0].description).toContain(
      'Dominant mapped habitat: forest, covering 3 of 4',
    );
    expect(facts.habitats[1].description).toContain('Secondary mapped habitat');
    expect(facts.habitats[0].anchor!.nodeIds).toEqual([1, 2, 3]);
    expect(facts.areas.slice(1).map((area) => area.mapNodeIds)).toEqual([[1, 2], [20], [3]]);
    expect(facts.habitats[0].areaIds).toEqual([
      'area:land',
      'area:habitat-zone:1',
      'area:habitat-zone:3',
    ]);
    expect(facts.areas[1].name).toBe('northern western forest zone');
    expect(facts.areas[2].name).toBe('central desert zone');
    expect(region.map).toEqual(original);
  });

  it('keeps identities and prose stable across node and neighbor array order and RNG draws', () => {
    const nodes = [
      node(10, 'forest', [30, 20]),
      node(20, 'forest', [10]),
      node(30, 'forest', [10]),
      node(40, 'desert'),
    ];
    const before = derive(fixture(nodes));
    const region = fixture(structuredClone(nodes).reverse());
    region.map.nodes.forEach((node) => node.neighbors.reverse());
    const rng = new RNG('different');
    rng.randomString(100);
    generateHabitatFacts(region, rng);
    expect(region.facts).toEqual(before);
  });

  it('limits major zones while retaining all minor habitats and deterministic ties', () => {
    const facts = derive(
      fixture(
        ['zebra', 'forest', 'desert', 'marsh', 'tundra'].map((biome, i) => node(i + 1, biome)),
      ),
    );
    expect(facts.areas).toHaveLength(5);
    expect(facts.habitats).toHaveLength(5);
    expect(facts.habitats[0].name).toBe('desert');
    expect(facts.habitats[4].areaIds).toEqual(['area:land']);
    expect(facts.habitats[4].description).toContain('no major zone is selected');
  });

  it('records physical evidence including a river on the second side of an edge', () => {
    const land = node(25, 'forest');
    land.elevation = 0.9;
    land.temperature = -5;
    land.moisture = 0.8;
    land.isCoast = true;
    const region = fixture([land]);
    region.map.edges.push({
      id: 70,
      d0: 999,
      d1: 25,
      v0: 0,
      v1: 1,
      river: 2,
      midpoint: { x: 25, y: 25 },
    });
    const facts = derive(region);
    const zone = facts.areas[1];
    expect(zone.name).toBe('southern eastern forest zone');
    expect(zone.description).toContain('high median altitude');
    expect(zone.description).toContain('-5.0 to -5.0 °C');
    expect(zone.description).toContain('0.8 to 0.8');
    expect(zone.description).toContain('coastal cells and river edges');
    expect(facts.habitats[0].anchor!.edgeIds).toEqual([70]);
    expect(zone.reason!.sources).toContainEqual({
      kind: 'map-edge',
      edgeId: 70,
      property: 'river',
      observedValue: '2',
    });
    for (const property of ['elevation', 'temperature', 'moisture', 'isCoast']) {
      expect(
        zone.reason!.sources.some(
          (source) =>
            source.kind === 'map-node' && source.nodeId === 25 && source.property === property,
        ),
      ).toBe(true);
    }
  });

  it('excludes water and unclassified cells without inventing habitats or water claims', () => {
    const nodes = [
      node(1, 'forest', [2]),
      node(2, 'forest', [1, 3]),
      node(3, 'forest', [2]),
      node(4, 'ocean'),
      node(5, undefined),
    ];
    nodes[1].isWater = true;
    nodes[3].isOcean = true;
    const facts = derive(fixture(nodes));
    expect(facts.habitats).toHaveLength(1);
    expect(facts.habitats[0].anchor!.nodeIds).toEqual([1, 3]);
    expect(facts.areas.slice(1).map((area) => area.mapNodeIds)).toEqual([[1], [3]]);
    expect(facts.habitats[0].description).toContain('2 of 3 dry-land cells');
    expect(facts.habitats[0].description).not.toContain('river edges');
    expect(derive(fixture([node(1, undefined)])).habitats).toEqual([]);
    expect(derive(fixture([])).areas).toHaveLength(1);
  });

  it('requires physical geography first', () => {
    const region = fixture([]);
    region.facts.areas = [];
    expect(() => generateHabitatFacts(region, new RNG('missing'))).toThrow('regional land');
  });
});
