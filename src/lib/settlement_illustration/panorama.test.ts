import { describe, it, expect } from 'vitest';
import { create } from 'xmlbuilder2';
import { RNG } from '@ironarachne/rng';
import {
  generateArchitectureState,
  architectureResourcesFromCatalog,
  legacyArchitectureState,
  type RoofForm,
  type WindowShape,
  type WindowFill,
} from '$lib/architecture';
import { getBuildingMaterialResources } from '$lib/resources';
import { BiomeClassifications } from '$lib/environment';
import { buildSettlementPanorama, renderSettlementPanorama, sceneSegments } from './panorama';
import { resolvePanoramaProfile } from './profile';
import { drawBuilding } from './buildings';
import { drawPlant, expandPlant, plantGrammar } from './plants';
import { canonical, n } from './geometry';
import type { PanoramaInput, PlantKind } from './settlement_illustration_types';

function fixture(): PanoramaInput {
  const biome = {
    name: 'temperate deciduous forest',
    temperature: 15,
    humidity: 0.6,
    altitude: 0.3,
    isAquatic: false,
    features: [],
    descriptions: [],
  };
  return {
    name: 'Alderbridge',
    category: {
      name: 'town',
      minSize: 100,
      maxSize: 1000,
      sizeClass: 'medium',
      possibleDescriptions: [],
    },
    population: 550,
    biome,
    terrain: {
      elevationMin: 0,
      elevationMax: 0.4,
      reliefEnergy: 0.2,
      normalVector: [0, 0, 1],
      landforms: [],
      geologicalMakeup: { soilTypes: [], rockTypes: [] },
    },
    architecture: generateArchitectureState(
      {
        seed: 'panorama',
        biome,
        site: { substrate: null, relief: null, coastal: null, floodProne: null },
        resources: architectureResourcesFromCatalog(getBuildingMaterialResources()),
        contexts: [
          {
            id: 'residential',
            construction: 'built',
            exposure: 'exposed',
            purpose: 'residential',
            density: 'medium',
            exteriorWindowsAllowed: true,
          },
        ],
        culturalPreferences: [],
      },
      12,
    ),
  };
}
const source = fixture();
describe('settlement panorama', () => {
  it('reproduces serialized inputs and varies all procedural layers with identity', () => {
    const a = buildSettlementPanorama(source);
    const b = buildSettlementPanorama(JSON.parse(JSON.stringify(source)));
    expect(a).toEqual(b);
    expect(a.buildings.length).toBeGreaterThan(0);
    const c = buildSettlementPanorama({ ...source, name: 'Elsewhere' });
    for (let i = 0; i < 5; i++) expect(a.layers[i]).not.toEqual(c.layers[i]);
    expect(renderSettlementPanorama(a)).toBe(renderSettlementPanorama(b));
    expect(create(renderSettlementPanorama(a)).root().node.nodeName).toBe('svg');
    expect(renderSettlementPanorama(a)).toContain('viewBox="0 0 1000 300"');
    expect(sceneSegments(a)).toBeLessThanOrEqual(20000);
  });
  it('ignores descriptive prose and metadata while preserving input', () => {
    const before = JSON.stringify(source);
    const changed = structuredClone(source);
    changed.biome.descriptions = ['Different words'];
    changed.architecture.summary = 'New prose';
    expect(buildSettlementPanorama(source)).toEqual(buildSettlementPanorama(changed));
    expect(JSON.stringify(source)).toBe(before);
    expect(canonical({ b: 2, a: 1 })).toBe(canonical({ a: 1, b: 2 }));
    expect(() => n(Infinity)).toThrow();
  });
  it('uses category bounds, with bounded counts and monotonic scale', () => {
    let previous = 0;
    for (const category of ['hamlet', 'village', 'town', 'borough', 'city', 'metropolis']) {
      const input = { ...source, category: { ...source.category, name: category } };
      const low = resolvePanoramaProfile({ ...input, population: -1 });
      const high = resolvePanoramaProfile({ ...input, population: 1e9 });
      expect(low.buildingCount).toBeGreaterThan(previous);
      expect(high.buildingCount).toBeLessThanOrEqual(96);
      previous = high.buildingCount;
      expect(buildSettlementPanorama(input).buildings).toHaveLength(
        resolvePanoramaProfile(input).buildingCount,
      );
    }
    expect(
      resolvePanoramaProfile({ ...source, category: { ...source.category, name: 'unknown' } })
        .buildingCount,
    ).toBeLessThanOrEqual(7);
  });
  it('covers every biome, falls back safely, and bounds dense forests', () => {
    for (const biome of BiomeClassifications.getAll()) {
      const input = {
        ...source,
        biome: { ...source.biome, name: biome.name },
        category: { ...source.category, name: 'metropolis' },
      };
      const scene = buildSettlementPanorama(input);
      expect(sceneSegments(scene)).toBeLessThanOrEqual(20000);
      expect(renderSettlementPanorama(scene)).not.toMatch(/NaN|Infinity/);
      expect(resolvePanoramaProfile(input).landscape).not.toBe('neutral');
    }
    expect(
      resolvePanoramaProfile({ ...source, biome: { ...source.biome, name: 'unknown' } }).landscape,
    ).toBe('neutral');
    expect(
      resolvePanoramaProfile({
        ...source,
        biome: { ...source.biome, name: 'unknown', isAquatic: true },
      }).landscape,
    ).toBe('coastal');
  });
  it('never invents missing or unavailable architecture', () => {
    for (const architecture of [
      legacyArchitectureState(),
      {
        kind: 'unavailable' as const,
        style: null,
        examples: [] as [],
        summary: null,
        diagnostics: [],
      },
    ])
      expect(buildSettlementPanorama({ ...source, architecture }).buildings).toEqual([]);
    expect(source.architecture.style).not.toBeNull();
    const style = source.architecture.style!;
    const example = source.architecture.examples[0];
    expect(drawBuilding(style, { ...example, profileId: 'missing' }, 0, 0, 1)).toBeNull();
    expect(drawBuilding(style, { ...example, storeys: null }, 0, 0, 1)).toBeNull();
    expect(drawBuilding(style, { ...example, variantId: 'missing' }, 0, 0, 1)).toBeNull();
    expect(
      buildSettlementPanorama({
        ...source,
        architecture: { ...source.architecture, kind: 'partial' } as PanoramaInput['architecture'],
      }).buildings.length,
    ).toBeGreaterThan(0);
  });
  it('projects every roof, window and covering from saved traits without rerolling examples', () => {
    const style = structuredClone(source.architecture.style!);
    const example = source.architecture.examples[0];
    const profile = style.profiles.find((p) => p.id === example.profileId)!;
    const variant = profile.variants.find((v) => v.id === example.variantId)!;
    const outlines = new Set<string>();
    for (const form of [
      'flat',
      'shed',
      'gable',
      'hip',
      'gambrel',
      'mansard',
      'cross_gable',
      'dome',
      'barrel',
    ] as RoofForm[]) {
      variant.roof!.form = form;
      const result = drawBuilding(style, example, 100, 220, 1)!;
      expect(result.exampleId).toBe(example.id);
      outlines.add(JSON.stringify(result.paths));
    }
    expect(outlines.size).toBe(9);
    for (const shape of [
      'rectangular',
      'segmental_arch',
      'full_round',
      'lancet',
      'small_square',
    ] as WindowShape[]) {
      for (const fill of [
        'open',
        'shuttered',
        'lattice',
        'glazed',
        'membrane',
        'grille',
      ] as WindowFill[]) {
        variant.windows = { ...variant.windows!, shape, fill, count: 'rich' };
        expect(drawBuilding(style, example, 100, 220, 1)!.paths.length).toBeGreaterThan(5);
      }
    }
    for (const pitch of ['low', 'moderate', 'steep'] as const)
      for (const eaves of ['none', 'short', 'deep'] as const) {
        variant.roof = { ...variant.roof!, pitch, eaves };
        for (const family of ['wood', 'stone', 'ceramic'] as const) {
          const wall = variant.surfaces.find((s) => s.role === 'outer_wall')!;
          wall.finish = 'rough_cut';
          style.materials.find((m) => m.id === wall.materialId)!.family = family;
          expect(drawBuilding(style, example, 100, 220, 1)).not.toBeNull();
        }
      }
    variant.windows = null;
    profile.portals = ['pointed_arch'];
    expect(drawBuilding(style, example, 0, 0, 1)).not.toBeNull();
    profile.portals = ['round_arch'];
    expect(drawBuilding(style, example, 0, 0, 1)).not.toBeNull();
    for (const kind of [
      'raised_plinth',
      'terraced_foundation',
      'balcony',
      'loggia',
      'arcade',
    ] as const) {
      variant.features = [{ id: 'feature', kind, materialId: null, evidenceIds: [] }];
      expect(
        drawBuilding(style, { ...example, placedFeatureIds: ['feature'] }, 0, 0, 1)!.paths.length,
      ).toBeGreaterThan(drawBuilding(style, example, 0, 0, 1)!.paths.length);
    }
  });
  it('draws side-on elevations without exposing depth as side walls or receding roof planes', () => {
    const style = structuredClone(source.architecture.style!);
    const example = { ...source.architecture.examples[0], placedFeatureIds: [] };
    const profile = style.profiles.find((p) => p.id === example.profileId)!;
    const variant = profile.variants.find((v) => v.id === example.variantId)!;
    profile.portals = [];
    variant.windows = null;
    for (const surface of variant.surfaces) surface.finish = 'smooth';
    for (const form of [
      'flat',
      'shed',
      'gable',
      'hip',
      'gambrel',
      'mansard',
      'cross_gable',
      'dome',
      'barrel',
    ] as RoofForm[]) {
      variant.roof = { ...variant.roof!, form, eaves: 'deep' };
      const shallow = drawBuilding(style, { ...example, widthDepthRatio: 4 }, 0, 0, 1)!;
      const deep = drawBuilding(style, { ...example, widthDepthRatio: 0.25 }, 0, 0, 1)!;
      expect(deep).toEqual(shallow);
      // One wall face and one roof silhouette; material strokes do not add faces.
      expect(shallow.paths.filter((p) => p.fill !== 'none')).toHaveLength(2);
      for (const path of shallow.paths)
        for (const match of path.d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) {
          expect(Number(match[1])).toBeGreaterThanOrEqual(-3);
          expect(Number(match[1])).toBeLessThanOrEqual(27);
        }
    }
  });
  it('expands bounded stochastic grammars and balances turtle branches', () => {
    for (const kind of [
      'broadleaf',
      'conifer',
      'tropical',
      'grass',
      'reed',
      'cactus',
      'palm',
      'scrub',
      'none',
    ] as PlantKind[]) {
      const grammar = plantGrammar(kind);
      const symbols = expandPlant(grammar, new RNG('test'));
      expect(symbols.length).toBeLessThanOrEqual(2048);
      expect(symbols.split('[').length).toBe(symbols.split(']').length);
      expect(drawPlant({ kind, x: 50, y: 200, scale: 2 }, new RNG('plant'))).toEqual(
        drawPlant({ kind, x: 50, y: 200, scale: 2 }, new RNG('plant')),
      );
    }
    expect(expandPlant({ ...plantGrammar('broadleaf'), symbolLimit: 1 }, new RNG('cap'))).toBe('X');
  });
  it('rejects malformed generated paths at the image boundary', () => {
    const scene = buildSettlementPanorama(source);
    scene.layers[0].paths[0].d = 'NaN';
    expect(() => renderSettlementPanorama(scene)).toThrow();
  });
});
