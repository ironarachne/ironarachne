import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getAllChargeGlyphs } from '$lib/charges/charge-data.js';
import { MEDIEVAL_DYE_SWATCHES } from './medieval_dye_colors.js';
import { generateMerchantMark } from './generate_merchant_mark.js';
import { renderMerchantMarkSvg } from './render_merchant_mark_svg.js';

describe('generateMerchantMark', () => {
  it('picks a charge and a dye from the configured options', () => {
    const opts = getAllChargeGlyphs().slice(0, 5);
    const rng = new RNG('merchant-mark-seed-1');
    const mark = generateMerchantMark(rng, { chargeOptions: opts });
    expect(opts.some((g) => g.name === mark.chargeName)).toBe(true);
    expect(MEDIEVAL_DYE_SWATCHES.some((s) => s.hex === mark.fillHex)).toBe(true);
  });

  it('throws when there are no charge options', () => {
    const rng = new RNG('merchant-mark-seed-2');
    expect(() => generateMerchantMark(rng, { chargeOptions: [] })).toThrow();
  });
});

describe('renderMerchantMarkSvg', () => {
  it('returns non-empty SVG containing the charge and background', () => {
    const mark = { chargeName: 'barrel', fillHex: '#8B2942' };
    const svg = renderMerchantMarkSvg(mark, 200, 200);
    expect(svg.length).toBeGreaterThan(50);
    expect(svg).toContain('F5F0E6');
    expect(svg).toContain('viewBox="0 0 600 600"');
  });
});
