import { describe, it, expect } from 'vitest';
import * as tinctures from '../tinctures';
import * as RNG from '@ironarachne/rng';

const rng = new RNG.RNG('test-seed');

// Basic type test
describe('Tincture type', () => {
  it('all tinctures should have required properties', () => {
    for (const t of tinctures.all()) {
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('type');
      expect(t).toHaveProperty('hexColor');
    }
  });
});

describe('tinctures.all', () => {
  it('returns an array of tinctures', () => {
    const all = tinctures.all();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });
});

describe('tinctures.byName', () => {
  it('returns the correct tincture by name', () => {
    const azure = tinctures.byName('azure');
    expect(azure.name).toBe('azure');
  });
});

describe('tinctures.byType', () => {
  it('returns only tinctures of the given type', () => {
    const metals = tinctures.byType('metal', tinctures.all());
    expect(metals.every((t) => t.type === 'metal')).toBe(true);
  });
});

describe('tinctures.colors', () => {
  it('returns only tinctures of type color', () => {
    const colors = tinctures.colors();
    expect(colors.every((t) => t.type === 'color')).toBe(true);
  });
});

describe('tinctures.furs', () => {
  it('returns only tinctures of type fur', () => {
    const furs = tinctures.furs();
    expect(furs.every((t) => t.type === 'fur')).toBe(true);
  });

  it('pean uses a sable field with Or ermine spots', () => {
    const pean = tinctures.byName('pean');
    expect(pean.category).toBe('dark');
    expect(pean.pattern).toContain('id="pean"');
    expect(pean.pattern).toContain('fill="#000000"/>');
    expect(pean.pattern).toContain('fill="#F0D41F"');
    expect(pean.pattern).not.toMatch(/fill="#000000" stroke="#000000"/);
  });

  it('vair uses argent and azure fur pattern', () => {
    const vair = tinctures.byName('vair');
    expect(vair.type).toBe('fur');
    expect(vair.category).toBe('neutral');
    expect(vair.pattern).toContain('id="vair"');
    expect(vair.pattern).toContain('fill="#ffffff"');
    expect(vair.pattern).toContain('fill="#0731BA"');
  });
});

describe('tinctures.metals', () => {
  it('returns only tinctures of type metal', () => {
    const metals = tinctures.metals();
    expect(metals.every((t) => t.type === 'metal')).toBe(true);
  });
});

describe('tinctures.stains', () => {
  it('returns only tinctures of type stain', () => {
    const stains = tinctures.stains();
    expect(stains.every((t) => t.type === 'stain')).toBe(true);
  });
});

describe('tinctures.contrasts', () => {
  it('returns true for contrasting tinctures', () => {
    const [metal] = tinctures.metals();
    const [color] = tinctures.colors();
    expect(tinctures.contrasts(metal, color)).toBe(true);
  });
  it('returns false for non-contrasting tinctures', () => {
    const [metal] = tinctures.metals();
    expect(tinctures.contrasts(metal, metal)).toBe(false);
  });
});

describe('tinctures.exclude', () => {
  it('removes a tincture from a set', () => {
    const all = tinctures.all();
    const removed = tinctures.exclude(all[0], all);
    expect(removed).not.toContainEqual(all[0]);
  });
});

describe('tinctures.getContrasting', () => {
  it('returns tinctures that contrast with the input', () => {
    const [metal] = tinctures.metals();
    const allTinctures = tinctures.all();
    const contrasting = tinctures.getContrasting(metal, allTinctures);
    expect(Array.isArray(contrasting)).toBe(true);
    expect(contrasting.length).toBeGreaterThan(0);
    // All returned tinctures should contrast with the input
    expect(contrasting.every((t) => tinctures.contrasts(metal, t))).toBe(true);
  });
});

describe('tinctures.isIncludedIn', () => {
  it('returns true if tincture is in set', () => {
    const all = tinctures.all();
    expect(tinctures.isIncludedIn(all[0], all)).toBe(true);
  });
  it('returns false if tincture is not in set', () => {
    const all = tinctures.all();
    const fake = { name: 'fake', type: 'fake', hex: '#000' };
    expect(tinctures.isIncludedIn(fake as unknown as tinctures.Tincture, all)).toBe(false);
  });
});

describe('tinctures.getSetExcluding', () => {
  it('returns a set without the given tincture(s)', () => {
    const all = tinctures.all();
    const toRemove = [all[0]];
    const result = tinctures.getSetExcluding(toRemove, all);
    expect(result).not.toContainEqual(all[0]);
  });
});

describe('tinctures.ofTypes', () => {
  it('returns tinctures of the given types', () => {
    const result = tinctures.ofTypes(['metal', 'color']);
    expect(result.every((t) => t.type === 'metal' || t.type === 'color')).toBe(true);
  });
});

describe('tinctures.random', () => {
  it('returns a tincture', () => {
    const t = tinctures.random(rng);
    expect(t).toHaveProperty('name');
  });
});

describe('tinctures.randomChargeTincture', () => {
  it('returns a tincture', () => {
    const t = tinctures.randomChargeTincture(rng);
    expect(t).toHaveProperty('name');
  });
});

describe('tinctures.randomContrasting', () => {
  it('returns a tincture that contrasts with the input', () => {
    const [metal] = tinctures.metals();
    const t = tinctures.randomContrasting(metal, rng);
    expect(tinctures.contrasts(metal, t)).toBe(true);
  });
});

describe('tinctures.randomExcluding', () => {
  it('returns a tincture not equal to the input', () => {
    const [metal] = tinctures.metals();
    const t = tinctures.randomExcluding(metal, rng);
    expect(t).not.toEqual(metal);
  });
});

describe('tinctures.randomFrom', () => {
  it('returns a tincture from the given set', () => {
    const metals = tinctures.metals();
    const t = tinctures.randomFrom(metals, rng);
    expect(metals).toContainEqual(t);
  });
});

describe('tinctures.randomWeighted', () => {
  it('returns a tincture', () => {
    const t = tinctures.randomWeighted(rng);
    expect(t).toHaveProperty('name');
  });
});

describe('tinctures.randomWeightedExcluding', () => {
  it('returns a tincture not equal to the input', () => {
    const [metal] = tinctures.metals();
    const t = tinctures.randomWeightedExcluding(metal, rng);
    expect(t).not.toEqual(metal);
  });
});
