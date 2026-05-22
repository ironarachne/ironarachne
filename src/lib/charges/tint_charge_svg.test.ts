import { describe, expect, it } from 'vitest';
import { tintChargeSvg } from './tint_charge_svg.js';

const minimalChargeSvg = `
<svg xmlns="http://www.w3.org/2000/svg">
  <path fill="white" d="M0 0"/>
  <path fill="black" d="M1 1"/>
</svg>
`;

describe('tintChargeSvg', () => {
  it('uses a neutral grey outline when the fill is sable so line art stays visible', () => {
    const out = tintChargeSvg('#000000', 'sable', minimalChargeSvg);
    expect(out).toContain('fill="#000000"');
    expect(out).toContain('fill="#808080"');
    expect(out).not.toMatch(/fill="black"/);
  });

  it('uses a black outline for non-sable fills', () => {
    const out = tintChargeSvg('#D40D02', 'gules', minimalChargeSvg);
    expect(out).toContain('fill="#D40D02"');
    expect(out).toContain('fill="#000000"');
  });

  it('suffixes style class names for SVG defs', () => {
    const svg = '<style>.st0 { fill: white; }</style><path class="st0"/>';
    const out = tintChargeSvg('#0731BA', 'azure', svg);
    expect(out).toContain('st0-azure');
    expect(out).not.toContain('.st0 {');
  });
});
