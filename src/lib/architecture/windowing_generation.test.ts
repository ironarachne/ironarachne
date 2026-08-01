import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import type { BuildingPurpose } from './architectural_style_types';
import { buildWindowingStyle } from './windowing_generation';

type WindowingConfig = Parameters<typeof buildWindowingStyle>[0];

/** A plain, unremarkable building; each test overrides only what it is about. */
function baseConfig(overrides: Partial<WindowingConfig> = {}): WindowingConfig {
  return {
    openingStyle: 'moderate',
    purposes: ['residential'],
    populationBand: 'medium',
    massing: 'compact_blocks',
    structuralSystem: 'post_and_beam',
    site: { substrate: 'mixed', relief: 'rolling' },
    hasWood: false,
    hasMetal: false,
    hasMasonry: false,
    ...overrides,
  };
}

/** Runs the given config over a fixed span of seeds, so branch odds are exercised deterministically. */
function acrossSeeds(config: WindowingConfig, count = 100) {
  return Array.from({ length: count }, (_, i) => buildWindowingStyle(config, new RNG(`win-${i}`)));
}

describe('buildWindowingStyle', () => {
  it('matches narrow defensive openings with sparse count and small shapes', () => {
    const rng = new RNG('win-def');
    const w = buildWindowingStyle(
      {
        openingStyle: 'narrow_defensive',
        purposes: ['defensive'],
        populationBand: 'low',
        massing: 'compact_blocks',
        structuralSystem: 'load_bearing_masonry',
        site: { substrate: 'rocky', relief: 'mountainous' },
        hasWood: true,
        hasMetal: true,
        hasMasonry: true,
      },
      rng,
    );
    expect(w.countBand).toBe('sparse');
    expect(['small_square', 'rectangular']).toContain(w.shape);
    expect([
      'metal_grille_backed',
      'none_louver_vent_only',
      'woven_reed_mat',
      'open_to_shutter',
    ]).toContain(w.fillPrimary);
  });

  it('leaves moderate openings at a moderate count when nothing modifies them', () => {
    for (const w of acrossSeeds(baseConfig())) {
      expect(w.countBand).toBe('moderate');
    }
  });

  it('gives storage buildings vent-like fills and mostly sparse windows', () => {
    const results = acrossSeeds(baseConfig({ purposes: ['storage'] }));
    for (const w of results) {
      expect(['none_louver_vent_only', 'lattice_screen', 'open_to_shutter']).toContain(
        w.fillPrimary,
      );
    }
    const sparse = results.filter((w) => w.countBand === 'sparse').length;
    expect(sparse).toBeGreaterThan(50);
  });

  it('thins generous openings at high altitude and never widens them', () => {
    const results = acrossSeeds(
      baseConfig({
        openingStyle: 'generous',
        site: { substrate: 'rocky', relief: 'mountainous', high_altitude: true },
      }),
    );
    const bands = new Set(results.map((w) => w.countBand));
    expect(bands.has('moderate')).toBe(true);
    expect(bands.has('rich')).toBe(true);
    expect(bands.has('sparse')).toBe(false);
  });

  it('adds an inner layer over glass at high altitude', () => {
    const results = acrossSeeds(
      baseConfig({
        openingStyle: 'generous',
        structuralSystem: 'load_bearing_masonry',
        hasMasonry: true,
        site: { substrate: 'rocky', relief: 'mountainous', high_altitude: true },
      }),
    );
    const layered = results.filter((w) => w.fillSecondary != null);
    expect(layered.length).toBeGreaterThan(50);
    for (const w of layered) {
      expect(['open_to_shutter', 'paper_translucent']).toContain(w.fillSecondary);
    }
  });

  it('keeps cob and adobe openings small, with earthen fills', () => {
    for (const w of acrossSeeds(baseConfig({ structuralSystem: 'cob_or_adobe' }))) {
      expect(['small_square', 'rectangular']).toContain(w.shape);
      expect(['oiled_hide_or_fabric', 'lattice_screen', 'woven_reed_mat', 'glass_clear']).toContain(
        w.fillPrimary,
      );
    }
  });

  it('arranges terraced massing on step-friendly rhythms', () => {
    for (const w of acrossSeeds(baseConfig({ massing: 'terraced_steps' }))) {
      expect(['punched_staggered', 'clerestory_row', 'regular_grid']).toContain(w.arrangement);
    }
  });

  it('gives commercial blocks street-facing ribbons or grids', () => {
    for (const w of acrossSeeds(baseConfig({ purposes: ['commercial'] }))) {
      expect(['horizontal_ribbon', 'regular_grid']).toContain(w.arrangement);
    }
  });

  it('sometimes relieves a sparse defensive count in a dense settlement', () => {
    const bands = new Set(
      acrossSeeds(
        baseConfig({
          openingStyle: 'narrow_defensive',
          purposes: ['defensive'],
          populationBand: 'high',
        }),
      ).map((w) => w.countBand),
    );
    expect(bands).toEqual(new Set(['sparse', 'moderate']));
  });

  it('eventually glazes masonry with leaded glass', () => {
    const fills = new Set(
      acrossSeeds(baseConfig({ structuralSystem: 'load_bearing_masonry', hasMasonry: true })).map(
        (w) => w.fillPrimary,
      ),
    );
    expect(fills.has('glass_leaded')).toBe(true);
    expect(fills.has('glass_clear')).toBe(true);
  });

  it('eventually backs clear glass with a grille when metal is available', () => {
    const fills = new Set(acrossSeeds(baseConfig({ hasMetal: true })).map((w) => w.fillPrimary));
    expect(fills.has('metal_grille_backed')).toBe(true);
  });

  it('is deterministic for the same config and RNG seed', () => {
    const cfg = {
      openingStyle: 'generous' as const,
      purposes: ['religious', 'civic'] as BuildingPurpose[],
      populationBand: 'high' as const,
      massing: 'courtyard_clusters' as const,
      structuralSystem: 'hybrid_timber_and_masonry' as const,
      site: { substrate: 'mixed' as const, relief: 'rolling' as const },
      hasWood: true,
      hasMetal: false,
      hasMasonry: true,
    };
    const a = buildWindowingStyle(cfg, new RNG('same'));
    const b = buildWindowingStyle(cfg, new RNG('same'));
    expect(a).toEqual(b);
  });
});
