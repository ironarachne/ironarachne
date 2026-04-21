import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { buildBuildingAdditions } from './building_additions_generation';

describe('buildBuildingAdditions', () => {
  it('selects defensive additions only from defensive-eligible kinds', () => {
    const rng = new RNG('def-add');
    const adds = buildBuildingAdditions(
      {
        purposes: ['defensive'],
        populationBand: 'medium',
        structuralSystem: 'load_bearing_masonry',
        massing: 'compact_blocks',
        site: { substrate: 'rocky', relief: 'mountainous' },
        hasWood: true,
        hasMasonry: true,
      },
      rng,
    );
    expect(adds.length).toBeGreaterThan(0);
    const kinds = adds.map((a) => a.kind);
    expect(kinds.some((k) => k === 'machicolations' || k === 'bartizan' || k === 'wall_walk')).toBe(true);
    expect(kinds.includes('flying_buttress')).toBe(false);
  });

  it('excludes masonry-only additions when the palette has no masonry', () => {
    const adds = buildBuildingAdditions(
      {
        purposes: ['religious'],
        populationBand: 'low',
        structuralSystem: 'post_and_beam',
        massing: 'linear_spread',
        site: { substrate: 'mixed', relief: 'rolling' },
        hasWood: true,
        hasMasonry: false,
      },
      new RNG('no-mason'),
    );
    expect(adds.every((a) => a.kind !== 'flying_buttress' && a.kind !== 'cornice_drip_band')).toBe(true);
  });

  it('eventually selects flying buttresses for religious masonry across seeds', () => {
    const cfg = {
      purposes: ['religious'] as const,
      populationBand: 'high' as const,
      structuralSystem: 'load_bearing_masonry' as const,
      massing: 'linear_spread' as const,
      site: { substrate: 'mixed' as const, relief: 'rolling' as const },
      hasWood: false,
      hasMasonry: true,
    };
    let sawFlying = false;
    for (let i = 0; i < 120; i++) {
      const adds = buildBuildingAdditions(cfg, new RNG(`fb-seed-${i}`));
      if (adds.some((a) => a.kind === 'flying_buttress')) {
        sawFlying = true;
        break;
      }
    }
    expect(sawFlying).toBe(true);
  });

  it('is deterministic for the same config and RNG seed', () => {
    const cfg = {
      purposes: ['commercial', 'civic'] as const,
      populationBand: 'high' as const,
      structuralSystem: 'hybrid_timber_and_masonry' as const,
      massing: 'courtyard_clusters' as const,
      site: { substrate: 'clay_rich' as const, relief: 'flat' as const },
      hasWood: true,
      hasMasonry: true,
    };
    const a = buildBuildingAdditions(cfg, new RNG('same-add'));
    const b = buildBuildingAdditions(cfg, new RNG('same-add'));
    expect(a).toEqual(b);
  });
});
