import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { buildWindowingStyle } from './windowing_generation';

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

  it('is deterministic for the same config and RNG seed', () => {
    const cfg = {
      openingStyle: 'generous' as const,
      purposes: ['religious', 'civic'] as const,
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
