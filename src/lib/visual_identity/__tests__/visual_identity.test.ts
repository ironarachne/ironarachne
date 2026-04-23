import { describe, expect, it } from 'vitest';
import * as RNG from '@ironarachne/rng';
import { generateHeraldry } from '$lib/heraldry/generator.js';
import { mergeHeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import {
  createEmptyVisualIdentity,
  isHeraldryEmblem,
  isMerchantMarkEmblem,
  withHeraldryEmblem,
  withMerchantMarkEmblem,
} from '../visual_identity.js';

const rng = new RNG.RNG('visual-identity-test');

function sampleArms() {
  return generateHeraldry(mergeHeraldryGeneratorConfig({ chargeCount: 0, rng }));
}

describe('visual_identity', () => {
  it('createEmptyVisualIdentity has none emblem and no optional fields', () => {
    const id = createEmptyVisualIdentity();
    expect(id.emblem).toEqual({ kind: 'none' });
    expect(id.colors).toBeUndefined();
    expect(id.motto).toBeUndefined();
  });

  it('withHeraldryEmblem sets heraldry emblem and preserves other fields', () => {
    const arms = sampleArms();
    const base = {
      ...createEmptyVisualIdentity(),
      colors: { primary: '#112233', secondary: '#445566' },
      motto: 'Semper',
    };
    const next = withHeraldryEmblem(base, arms);
    expect(next.emblem).toEqual({ kind: 'heraldry', arms });
    expect(next.colors).toEqual(base.colors);
    expect(next.motto).toBe('Semper');
  });

  it('withHeraldryEmblem does not mutate the input identity', () => {
    const arms = sampleArms();
    const base = createEmptyVisualIdentity();
    withHeraldryEmblem(base, arms);
    expect(base.emblem).toEqual({ kind: 'none' });
  });

  it('isHeraldryEmblem narrows heraldry and rejects none', () => {
    const arms = sampleArms();
    expect(isHeraldryEmblem({ kind: 'heraldry', arms })).toBe(true);
    expect(isHeraldryEmblem({ kind: 'none' })).toBe(false);
  });

  it('withMerchantMarkEmblem sets merchant mark and isMerchantMarkEmblem narrows', () => {
    const mark = { chargeName: 'barrel', fillHex: '#8B2942' };
    const next = withMerchantMarkEmblem(createEmptyVisualIdentity(), mark);
    expect(next.emblem).toEqual({ kind: 'merchant_mark', mark });
    expect(isMerchantMarkEmblem(next.emblem)).toBe(true);
    expect(isMerchantMarkEmblem({ kind: 'none' })).toBe(false);
  });
});
