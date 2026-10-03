import { afterEach, describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Names from '$lib/names';
import { cultureFromSnapshot, rollCultureSnapshot, type Culture } from '$lib/culture';
import type { MapNode, RegionMap } from '$lib/map';
import { emptyRegionFacts } from './region_facts';
import { generateLandscapeNames, landscapeSummaryHeading } from './region_landscape_names';
import { rollRegionSnapshot, rollRegion } from './region_roll';
import { regionToUiDocument } from './region_ui_presentation';
import { regionToMarkdown, regionToText } from './region_presentation';

function node(id: number, x: number, y: number, elevation = 0.1, biomeId = 'forest'): MapNode {
  return {
    id,
    center: { x, y },
    elevation,
    biomeId,
    neighbors: [],
    edges: [],
    corners: [],
    polygon: { vertices: [], edges: [] },
    temperature: 10,
    moisture: 0.5,
    isOcean: false,
    isWater: false,
    isCoast: false,
  };
}
function fixture(nodes: MapNode[], dominantCulture: Culture | null = null) {
  const map: RegionMap = { width: 30, height: 30, nodes, edges: [], corners: [] };
  const facts = emptyRegionFacts('current');
  const region = { map, facts, dominantCulture };
  facts.areas.push({
    id: 'area:land',
    name: 'Regional land',
    description: 'Overview.',
    origin: 'generated',
    mapNodeIds: nodes.map((node) => node.id),
  });
  facts.areas.push({
    id: 'area:habitat-zone:1',
    name: 'zone',
    description: 'Saved prose.',
    origin: 'generated',
    mapNodeIds: nodes.filter((node) => node.id < 100).map((node) => node.id),
  });
  return region;
}
function namingInput(nodes: MapNode[]) {
  const generate = vi.spyOn(Names, 'generateLandscapeName');
  generateLandscapeNames(fixture(nodes), new RNG('test'));
  const input = generate.mock.calls.at(-1)![0];
  generate.mockRestore();
  return input;
}
afterEach(() => vi.restoreAllMocks());

describe('regional landscape naming', () => {
  it.each([
    [1, 1, ['north', 'west', 'northwest']],
    [29, 1, ['north', 'east', 'northeast']],
    [29, 29, ['south', 'east', 'southeast']],
    [1, 29, ['south', 'west', 'southwest']],
    [15, 15, ['central']],
    [15, 1, ['north']],
    [1, 15, ['west']],
  ])('offers only supported directions at %s, %s', (x, y, directions) => {
    expect(namingInput([node(1, x as number, y as number)]).directions).toEqual(directions);
  });

  it('requires two-thirds support instead of assigning a centroid direction to scattered zones', () => {
    expect(namingInput([node(1, 1, 1), node(2, 29, 29)]).directions).toEqual([]);
    expect(namingInput([node(1, 1, 1), node(2, 2, 2), node(3, 29, 29)]).directions).toEqual([
      'north',
      'west',
      'northwest',
    ]);
    expect(namingInput([node(1, 10, 10), node(2, 20, 20)]).directions).toEqual(['central']);
  });

  it.each([
    ['temperate deciduous forest', ['Woods', 'Woodlands', 'Forest']],
    ['montane grassland', ['Grasslands', 'Plains']],
    ['cold desert', ['Desert']],
    ['freshwater wetland', ['Wetlands', 'Marshes']],
    ['alpine tundra', ['Tundra']],
    ['ice cap', ['Icefields']],
    ['mangrove forest', ['Mangroves', 'Mangrove Woods']],
    ['unknown biome', ['Country']],
  ])('uses explicit compatible nouns for %s', (biome, nouns) => {
    expect(namingInput([node(1, 15, 15, 0.1, biome)]).nouns).toEqual(nouns);
  });

  it('adds relief nouns only with majority map support and never infers mountains from a biome label', () => {
    const low = [node(100, 15, 15), node(101, 15, 15), node(102, 15, 15)];
    expect(namingInput([node(1, 15, 15, 0.3, 'grassland'), ...low]).nouns).toEqual([
      'Grasslands',
      'Hills',
      'Heights',
      'Downs',
    ]);
    expect(namingInput([node(1, 15, 15, 0.5), ...low]).nouns).toEqual([
      'Woods',
      'Forest',
      'Woodlands',
      'Mountains',
      'Heights',
    ]);
    expect(namingInput([node(1, 15, 15, 0.9), ...low]).nouns).toContain('Mountains');
    expect(namingInput([node(1, 15, 15, 0.1, 'montane forest')]).nouns).not.toContain('Mountains');
    expect(
      namingInput([node(1, 15, 15, 0.5), node(2, 15, 15), node(3, 15, 15), ...low]).nouns,
    ).not.toContain('Mountains');
    expect(namingInput([node(1, 15, 15, 0.3, 'forest'), ...low]).nouns).not.toContain('Downs');
  });

  it('changes only generated zone names and preserves authored, blank and summary entries', () => {
    const region = fixture([node(1, 1, 1)]);
    region.facts.areas.push({
      ...region.facts.areas[1],
      id: 'area:habitat-zone:2',
      name: 'Authored Woods',
      origin: 'authored',
    });
    region.facts.areas.push({
      ...region.facts.areas[1],
      id: 'area:habitat-zone:3',
      mapNodeIds: [],
    });
    region.facts.habitats.push({
      id: 'habitat:biome:forest',
      name: 'forest',
      description: 'Summary.',
      origin: 'generated',
      areaIds: ['area:land'],
    });
    const before = structuredClone(region);
    generateLandscapeNames(region, new RNG('saved'));
    expect(region.facts.areas[1].name).not.toBe('zone');
    region.facts.areas[1].name = before.facts.areas[1].name;
    expect(region).toEqual(before);
    expect(() =>
      generateLandscapeNames({ ...region, facts: undefined }, new RNG('empty')),
    ).not.toThrow();
  });

  it('repeats across reordered facts and graph arrays with unique names', () => {
    const region = fixture([node(1, 1, 1), node(2, 2, 2)]);
    region.facts.areas[1].mapNodeIds = [1];
    region.facts.areas.push({
      ...region.facts.areas[1],
      id: 'area:habitat-zone:2',
      mapNodeIds: [2],
    });
    const reordered = structuredClone(region);
    reordered.map.nodes.reverse();
    reordered.facts.areas.reverse();
    generateLandscapeNames(region, new RNG('order'));
    generateLandscapeNames(reordered, new RNG('order'));
    expect(reordered.facts.areas.toSorted((a, b) => a.id.localeCompare(b.id))).toEqual(
      region.facts.areas.toSorted((a, b) => a.id.localeCompare(b.id)),
    );
    expect(new Set(region.facts.areas.map((area) => area.name.toLowerCase())).size).toBe(
      region.facts.areas.length,
    );
  });

  it('uses dominant culture patterns without consuming its live naming generators', () => {
    const savedCulture = rollCultureSnapshot('culture', {
      nameGeneratorSet: 'elf',
      religionSource: 'reference',
    });
    const makeCulture = () => cultureFromSnapshot(savedCulture, new RNG('culture-state'));
    const culture = makeCulture();
    const baseline = makeCulture();
    const generate = vi.spyOn(Names, 'generateLandscapeName');
    const region = fixture([node(1, 1, 1)], culture);
    generateLandscapeNames(region, new RNG('culture-names'));
    expect(generate.mock.calls[0][0].culturePatterns).toEqual(savedCulture.nameGenerators);
    const repeated = fixture([node(1, 1, 1)], culture);
    generateLandscapeNames(repeated, new RNG('culture-names'));
    expect(repeated.facts).toEqual(region.facts);
    expect(culture.nameGenerators.female.generate(10)).toEqual(
      baseline.nameGenerators.female.generate(10),
    );
    expect(culture.nameGenerators.family.generate(10)).toEqual(
      baseline.nameGenerators.family.generate(10),
    );
    // Repeat the complete public path even after the shared culture's generators have advanced.
    const first = rollRegion('cultural-region', {}, culture).region;
    const second = rollRegion('cultural-region', {}, culture).region;
    expect(first.facts).toEqual(second.facts);
    expect(first.settlements.map((settlement) => settlement.name)).toEqual(
      second.settlements.map((settlement) => settlement.name),
    );
  });

  it('uses direct saved zone headings and readable summaries in the page and exports', () => {
    const snapshot = rollRegionSnapshot('landscape-presentation');
    const zone = snapshot.facts.areas.find((area) => area.id.startsWith('area:habitat-zone:'))!;
    zone.name = 'Dobby’s Hills';
    zone.origin = 'authored';
    const before = structuredClone(snapshot);
    const landscape = regionToUiDocument(snapshot).sections.find(
      (section) => section.heading === 'Landscape',
    )!;
    expect(landscape.entries.find((entry) => entry.factId === zone.id)?.heading).toBe(
      'Dobby’s Hills',
    );
    expect(landscape.entries.find((entry) => entry.factId === 'area:land')?.heading).toBe('');
    expect(
      landscape.entries
        .filter((entry) => entry.factId?.startsWith('habitat:'))
        .every((entry) => entry.heading.endsWith('across the region')),
    ).toBe(true);
    for (const prose of [regionToMarkdown(snapshot), regionToText(snapshot)]) {
      expect(prose).toContain('Dobby’s Hills');
      expect(prose).not.toContain('The Landscape of');
      expect(prose).toContain(landscapeSummaryHeading(snapshot.facts.habitats[0].name));
    }
    expect(snapshot).toEqual(before);
    snapshot.facts.habitats[0].name = 'My Saved Habitat';
    snapshot.facts.habitats[0].origin = 'authored';
    expect(
      regionToUiDocument(snapshot)
        .sections.find((section) => section.heading === 'Landscape')!
        .entries.some((entry) => entry.heading === 'My Saved Habitat'),
    ).toBe(true);
    expect(regionToText(snapshot)).toContain('My Saved Habitat:');
  });

  it('formats known, unfamiliar and unnamed habitat summaries without losing the category', () => {
    expect(landscapeSummaryHeading('forest')).toBe('Woodlands across the region');
    expect(landscapeSummaryHeading('montane grassland')).toBe(
      'Montane grasslands across the region',
    );
    expect(landscapeSummaryHeading('strange biome')).toBe('Strange biome across the region');
    expect(landscapeSummaryHeading(' ')).toBe('Habitats across the region');
  });
});
