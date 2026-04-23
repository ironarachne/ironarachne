import { describe, expect, it } from 'vitest';
import { geometricEmblemChargeGlyphs } from './geometric_emblem_charges.js';

describe('geometricEmblemChargeGlyphs', () => {
  it('includes tagged symbol charges and has unique names', () => {
    const g = geometricEmblemChargeGlyphs();
    expect(g.length).toBeGreaterThanOrEqual(4);
    const names = g.map((c) => c.name);
    expect(names).toContain('annulet');
    expect(names).toContain('moon');
    expect(names).toContain('lozenge');
    expect(names).toContain('greek cross');
    expect(new Set(names).size).toBe(names.length);
  });
});
