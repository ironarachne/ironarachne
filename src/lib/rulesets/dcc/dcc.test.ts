import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { DCC_CHARACTER_RULESET_REF } from '$lib/dcc';
import {
  allRulesDataSources,
  deriveTreasureItemMechanics,
  getRuleset,
  rulesetNotices,
} from '../index.js';
import { DCC_LEGACY_RULESET_REF, DCC_SOURCE_REVIEW } from './index.js';

describe('DCC source review', () => {
  it('keeps production data disabled without an accepted Goodman Games agreement', () => {
    expect(DCC_SOURCE_REVIEW).toMatchObject({
      publisher: 'Goodman Games',
      reviewedAt: '2026-09-05',
      status: 'blocked-pending-written-permission',
      redistributable: false,
    });
    expect(DCC_SOURCE_REVIEW.findings).toContain(
      'The Quick Start Rules designate only SRD-derived portions of creature statistics as Open Game Content.',
    );
    expect(allRulesDataSources().map(({ id }) => id)).not.toContain(DCC_SOURCE_REVIEW.id);
  });

  it('does not invent source history for existing DCC characters', () => {
    expect(DCC_LEGACY_RULESET_REF).toEqual({ id: 'dcc', release: 'legacy' });
    expect(DCC_CHARACTER_RULESET_REF).toEqual(DCC_LEGACY_RULESET_REF);
    expect(DCC_LEGACY_RULESET_REF).not.toHaveProperty('sourceIds');
  });
});

describe('disabled DCC ruleset package', () => {
  it('registers only the capability-free legacy identity', async () => {
    expect(await getRuleset(DCC_LEGACY_RULESET_REF)).toMatchObject({
      ok: true,
      value: {
        descriptor: {
          capabilities: [],
          sourceIds: [],
        },
      },
    });
    expect(rulesetNotices([DCC_LEGACY_RULESET_REF])).toEqual({ ok: true, value: [] });
  });

  it('rejects treasure derivation before using the supplied fixed-seed RNG', async () => {
    const rng = new RNG('disabled-dcc-treasure');

    expect(
      await deriveTreasureItemMechanics(
        DCC_LEGACY_RULESET_REF,
        { id: 'gem', name: 'Gem', description: 'A test fixture.', weight: 0 },
        { variants: [] },
        { kind: 'valuable', minimumValue: 1, maximumValue: 6, denomination: 'gp' },
        rng,
      ),
    ).toMatchObject({ ok: false, reason: 'unsupported-capability' });
  });
});
