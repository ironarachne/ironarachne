import { describe, expect, it } from 'vitest';

import { RNG } from '@ironarachne/rng';

import { generateHeraldry, mergeHeraldryGeneratorConfig } from '$lib/heraldry';

import {
  createEmptyVisualIdentity,
  withHeraldryEmblem,
  withMerchantMarkEmblem,
} from './visual_identity.js';
import { visualIdentityFromStored } from './visual_identity_rehydrate.js';
import { toStoredVisualIdentity } from './visual_identity_snapshot.js';

const arms = generateHeraldry(mergeHeraldryGeneratorConfig({ rng: new RNG('identity-arms') }));
const heraldic = { ...withHeraldryEmblem(createEmptyVisualIdentity(), arms), motto: 'Onward' };
const marked = withMerchantMarkEmblem(createEmptyVisualIdentity(), {
  chargeName: 'anchor',
  fillHex: '#123456',
});

describe('the stored visual identity', () => {
  it('round-trips a heraldic identity, arms by their parts', () => {
    const stored = toStoredVisualIdentity(heraldic);

    expect(stored.emblem.kind === 'heraldry' && stored.emblem.arms?.blazon).toBe(arms.blazon);
    expect(() => structuredClone(stored)).not.toThrow();
    expect(visualIdentityFromStored(stored)).toEqual(heraldic);
  });

  it('passes a plain-data emblem through untouched', () => {
    const stored = toStoredVisualIdentity(marked);

    expect(stored).toEqual(marked);
    expect(visualIdentityFromStored(stored)).toEqual(marked);
    expect(toStoredVisualIdentity(marked, true)).toEqual(marked);
  });

  /** Referenced arms are a statement, kept as `null`, and read back as no emblem of one's own. */
  it('writes null for referenced arms and reads it back as no emblem', () => {
    const stored = toStoredVisualIdentity(heraldic, true);

    expect(stored.emblem).toEqual({ kind: 'heraldry', arms: null });
    expect(stored.motto).toBe('Onward');
    expect(visualIdentityFromStored(stored)).toEqual({ emblem: { kind: 'none' }, motto: 'Onward' });
  });
});
