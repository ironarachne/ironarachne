import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  contrastRatio,
  DISC_MIN_CONTRAST_RATIO,
  pickContrastingPair,
  relativeLuminance,
} from './display_palettes.js';

describe('display_palettes', () => {
  it('relativeLuminance: white is higher than black', () => {
    expect(relativeLuminance('#ffffff')).toBeGreaterThan(relativeLuminance('#000000'));
  });

  it('contrastRatio: identical colors is 1', () => {
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('contrastRatio: white vs black is 21', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 3);
  });

  it('pickContrastingPair meets minimum contrast', () => {
    const rng = new RNG('disc-contrast-seed-42');
    for (let i = 0; i < 12; i++) {
      const p = pickContrastingPair(rng);
      expect(contrastRatio(p.ground, p.charge)).toBeGreaterThanOrEqual(DISC_MIN_CONTRAST_RATIO);
    }
  });
});
