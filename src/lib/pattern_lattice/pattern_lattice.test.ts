import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generatePatternLattice } from './generate_pattern_lattice.js';
import { renderPatternLatticeSvg } from './render_pattern_lattice_svg.js';

describe('pattern_lattice', () => {
  it('generatePatternLattice: dimensions and cell count', () => {
    const rng = new RNG('lattice-dim-7');
    const p = generatePatternLattice(rng, { minDim: 5, maxDim: 5, colorCount: 2, verticalMirror: false });
    expect(p.rows).toBe(5);
    expect(p.cols).toBe(5);
    expect(p.cells.length).toBe(25);
  });

  it('renderPatternLatticeSvg is non-empty and contains rect', () => {
    const rng = new RNG('lattice-svg-1');
    const p = generatePatternLattice(rng, { minDim: 4, maxDim: 4, colorCount: 2, verticalMirror: true });
    const svg = renderPatternLatticeSvg(p, 200, 200);
    expect(svg.length).toBeGreaterThan(50);
    expect(svg).toContain('<rect');
    expect(svg).toContain('viewBox="0 0 100 100"');
  });
});
