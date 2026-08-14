import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { annulet } from '$lib/charges';
import { contrastRatio, DISC_MIN_CONTRAST_RATIO } from '$lib/display_colors';
import { generateDiscEmblem } from './generate_disc_emblem.js';
import { renderDiscEmblemSvg } from './render_disc_emblem_svg.js';

describe('disc_emblem', () => {
  it('generateDiscEmblem picks contrasting colors', () => {
    const rng = new RNG('disc-gen-1');
    const d = generateDiscEmblem(rng, { chargeOptions: [annulet] });
    expect(d.chargeName).toBe('annulet');
    expect(contrastRatio(d.groundHex, d.chargeHex)).toBeGreaterThanOrEqual(DISC_MIN_CONTRAST_RATIO);
  });

  it('renderDiscEmblemSvg includes circle and clip', () => {
    const rng = new RNG('disc-render-1');
    const d = generateDiscEmblem(rng, { chargeOptions: [annulet] });
    const svg = renderDiscEmblemSvg(d, 200, 200);
    expect(svg).toContain('clipPath');
    expect(svg).toContain('<circle');
    expect(svg).toContain('viewBox="0 0 600 600"');
  });

  it('throws when no charge options', () => {
    const rng = new RNG('disc-empty');
    expect(() => generateDiscEmblem(rng, { chargeOptions: [] })).toThrow(
      /requires at least one charge option/,
    );
  });
});
