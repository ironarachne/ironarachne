import { afterEach, describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import * as Passes from './region_generation_passes';
import { generate } from './regions';
import { toRegionSnapshot } from './region_snapshot';
import { regionFactsError } from './region_facts';

function snapshot(seed: string) {
  const rng = new RNG(seed);
  return toRegionSnapshot(
    generate({
      rng,
      nameGeneratorSet: getFantasyNameGeneratorSet('human', rng),
      dominantCulture: null,
      mapWidth: 12,
      mapHeight: 10,
      minRealms: 1,
      maxRealms: 1,
    }),
  );
}

afterEach(() => vi.restoreAllMocks());

describe('dependent generation passes', () => {
  it('repeats the entire plain payload, including reasons and identities', () => {
    const result = snapshot('passes');
    expect(snapshot('passes')).toEqual(result);
    expect(structuredClone(result)).toEqual(result);
    expect(regionFactsError(result.facts, result.map, result.settlements)).toBeNull();
    expect(result.facts.areas.length).toBeGreaterThan(0);
    expect(result.facts.habitats.length).toBeGreaterThan(0);
    expect(result.facts.settlementRoles.length).toBe(result.settlements.length);
  });

  it('changes the payload with the seed', () => {
    expect(snapshot('first')).not.toEqual(snapshot('second'));
  });

  it.each([
    'generateHabitatFacts',
    'generateResourceFacts',
    'generateHabitationFacts',
    'generateNotableFacts',
    'presentRegion',
  ] as const)('isolates extra draws in %s from every other pass', (name) => {
    const original = Passes[name];
    const before = snapshot('isolated');
    vi.spyOn(Passes, name).mockImplementation((region, rng) => {
      for (let i = 0; i < 25; i++) rng.randomString(12);
      original(region, rng);
    });
    const after = snapshot('isolated');
    expect(after.map).toEqual(before.map);
    expect(after.environment).toEqual(before.environment);
    expect(after.facts.areas).toEqual(before.facts.areas);
    expect(after.facts.habitats).toEqual(before.facts.habitats);
    if (name !== 'generateResourceFacts') {
      expect(after.facts.resources).toEqual(before.facts.resources);
      expect(after.facts.notables).toEqual(before.facts.notables);
    }
    expect(after.settlements).toEqual(before.settlements);
    expect(after.realms).toEqual(before.realms);
    expect(after.name).toEqual(before.name);
  });

  it('isolates extra habitation draws before settlement and realm composition', () => {
    const before = snapshot('habitation-stream');
    const original = Passes.createRegionStageRng;
    vi.spyOn(Passes, 'createRegionStageRng').mockImplementation((seed, stage) => {
      const rng = original(seed, stage);
      if (stage === 'habitation') rng.randomString(30);
      return rng;
    });
    const after = snapshot('habitation-stream');
    expect(after.settlements).not.toEqual(before.settlements);
    expect(after.map.nodes).toEqual(before.map.nodes);
    expect(after.map.corners).toEqual(before.map.corners);
    // Roads belong to habitation; all physical edge data predates that pass.
    const physicalEdges = (value: typeof before) =>
      value.map.edges.map(({ road: _road, ...edge }) => edge);
    expect(physicalEdges(after)).toEqual(physicalEdges(before));
    expect(after.environment).toEqual(before.environment);
    expect(after.facts.areas).toEqual(before.facts.areas);
    expect(after.facts.habitats).toEqual(before.facts.habitats);
    expect(after.facts.resources).toEqual(before.facts.resources);
    expect(regionFactsError(after.facts, after.map, after.settlements)).toBeNull();
  });

  it('grounds freshwater and river landmarks in recorded map evidence', () => {
    let resources = 0;
    for (const seed of ['alpha', 'beta', 'gamma']) {
      const result = snapshot(seed);
      expect(regionFactsError(result.facts, result.map, result.settlements)).toBeNull();
      resources += result.facts.resources.length;
      for (const resource of result.facts.resources) {
        expect(
          resource.anchor!.edgeIds.every(
            (id) => result.map.edges.find((edge) => edge.id === id)!.river > 0,
          ),
        ).toBe(true);
        expect(result.facts.notables[0].reason!.sources).toContainEqual({
          kind: 'fact',
          factId: resource.id,
        });
      }
      for (const role of result.facts.settlementRoles) {
        expect(
          role.anchor.nodeIds.every((id) => {
            const node = result.map.nodes.find((node) => node.id === id)!;
            return !node.isOcean && !node.isWater;
          }),
        ).toBe(true);
      }
    }
    expect(resources).toBeGreaterThan(0);
  });

  it('does not invent a water resource or landmark on a map without rivers', () => {
    const result = generate({
      rng: new RNG('dry'),
      nameGeneratorSet: getFantasyNameGeneratorSet('human', new RNG('names')),
      dominantCulture: null,
      mapWidth: 12,
      mapHeight: 10,
      minRealms: 0,
      maxRealms: 0,
    });
    result.map.edges.forEach((edge) => {
      edge.river = 0;
    });
    result.facts!.resources = [];
    result.facts!.notables = [];
    Passes.generateResourceFacts(result, new RNG('resources'));
    Passes.generateNotableFacts(result, new RNG('notables'));
    expect(result.facts!.resources).toEqual([]);
    expect(result.facts!.notables).toEqual([]);
  });

  it('explains a profile mismatch using the realized graph without rewriting it', () => {
    const region = generate({
      rng: new RNG('mismatch'),
      nameGeneratorSet: getFantasyNameGeneratorSet('human', new RNG('names')),
      dominantCulture: null,
      mapWidth: 12,
      mapHeight: 10,
      minRealms: 0,
      maxRealms: 0,
    });
    const before = structuredClone(region.map);
    region.map.nodes.forEach((node) => {
      if (!node.isOcean && !node.isWater) node.elevation = 0.9;
    });
    const realized = structuredClone(region.map);
    region.facts!.areas = [];
    Passes.recordPhysicalFacts(region, { altitude: 'low', relief: 'mountainous' });
    expect(region.facts!.areas[0].description).toContain('was not achieved');
    expect(region.facts!.areas[0].description).toContain('flat and high-altitude');
    expect(
      region.facts!.areas[0].reason!.sources.every(
        (source) => source.kind === 'map-node' && source.observedValue === '0.9',
      ),
    ).toBe(true);
    expect(region.map).toEqual(realized);
    expect(realized).not.toEqual(before);
  });

  it('rejects geography without habitable land', () => {
    const region = generate({
      rng: new RNG('land'),
      nameGeneratorSet: getFantasyNameGeneratorSet('human', new RNG('names')),
      dominantCulture: null,
      mapWidth: 12,
      mapHeight: 10,
      minRealms: 0,
      maxRealms: 0,
    });
    region.map.nodes.forEach((node) => {
      node.isOcean = true;
    });
    expect(() => Passes.recordPhysicalFacts(region, { altitude: 'low', relief: 'flat' })).toThrow(
      'no land',
    );
    expect(() => Passes.generateHabitationFacts(region, new RNG('bad'))).toThrow('land placement');
  });
});
