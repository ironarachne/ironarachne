import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  deriveTreasureItemMechanics,
  getRuleset,
  migrateQualifiedMechanics,
  rulesetNotices,
} from '../index.js';
import {
  ADND_2E_CURRENCY_ROWS,
  ADND_2E_CURRENCY_RULES,
  ADND_2E_EQUIPMENT_RULES,
  ADND_2E_MECHANICS_CODEC,
  ADND_2E_OPEN_RULES_SOURCE,
  ADND_2E_RULESET_REF,
  qualifyAdnd2eMechanics,
} from './index.js';

const actor = {
  armorClass: 4,
  thaco: 18,
  hitPoints: 12,
  savingThrows: {
    paralyzationPoisonDeath: 14,
    rodStaffWand: 16,
    petrificationPolymorph: 15,
    breathWeapon: 17,
    spell: 17,
  },
};

const weapon = {
  kind: 'weapon' as const,
  valueCopper: 1_500,
  damageType: 'slashing' as const,
  damageSmallMedium: '1d8',
  damageLarge: '1d12',
  speedFactor: 5,
};

describe('AD&D 2E source and registry', () => {
  it('pins the exact open rules release and its OGL notice', () => {
    expect(ADND_2E_RULESET_REF).toEqual({ id: 'adnd-2e', release: 'fgag-2.0.1' });
    expect(ADND_2E_OPEN_RULES_SOURCE).toMatchObject({
      id: 'for-gold-and-glory.2.0.1',
      version: '2.0.1 (6 June 2016)',
      redistributable: true,
      grant: { id: 'ogl-1.0a', scope: 'open-content' },
    });
    expect(ADND_2E_OPEN_RULES_SOURCE.grant.notice).toContain(
      'For Gold & Glory™, Copyright 2014; Justen Brown.',
    );
  });

  it('loads only the capabilities the package implements', async () => {
    const result = await getRuleset(ADND_2E_RULESET_REF);
    expect(result).toMatchObject({
      ok: true,
      value: {
        descriptor: {
          gameSystem: 'adnd-2e',
          capabilities: ['actor', 'item', 'currency', 'equipment', 'treasure-items'],
        },
      },
    });
    if (result.ok) {
      expect(result.value.mechanics).toBe(ADND_2E_MECHANICS_CODEC);
      expect(result.value.currency).toBe(ADND_2E_CURRENCY_RULES);
      expect(result.value.equipment).toBe(ADND_2E_EQUIPMENT_RULES);
      expect(result.value.treasureItems).toBeDefined();
    }
  });

  it('assembles the required attribution from the registered release', () => {
    expect(rulesetNotices([ADND_2E_RULESET_REF])).toEqual({
      ok: true,
      value: [ADND_2E_OPEN_RULES_SOURCE],
    });
  });

  it('gives every production currency row an approved source', () => {
    expect(ADND_2E_CURRENCY_ROWS).toHaveLength(5);
    for (const row of ADND_2E_CURRENCY_ROWS) {
      expect(row.sourceIds).toEqual([ADND_2E_OPEN_RULES_SOURCE.id]);
    }
  });
});

describe('AD&D 2E mechanics', () => {
  it('validates and presents actor and item payloads', () => {
    expect(ADND_2E_MECHANICS_CODEC.validate('actor', actor, 1)).toEqual({
      ok: true,
      value: actor,
    });
    expect(ADND_2E_EQUIPMENT_RULES.validateItem(weapon)).toEqual({ ok: true, value: weapon });
    expect(ADND_2E_EQUIPMENT_RULES.presentItem(weapon)).toEqual({
      lines: ['Value: 1,500 cp', 'Damage: 1d8 (S/M), 1d12 (L)', 'Speed factor: 5'],
    });
  });

  it('qualifies current payloads with exact source history', () => {
    expect(qualifyAdnd2eMechanics('actor', actor)).toEqual({
      ok: true,
      value: {
        ruleset: ADND_2E_RULESET_REF,
        subject: 'actor',
        schemaVersion: 1,
        origin: 'generated',
        sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
        payload: actor,
      },
    });
  });

  it.each([
    ['actor', { ...actor, thaco: Number.NaN }],
    ['actor', { ...actor, savingThrows: {} }],
    ['item', { ...weapon, damageSmallMedium: 'lots' }],
    ['item', { kind: 'valuable', category: 'gem', valueCopper: -1, magical: false }],
  ] as const)('rejects malformed %s payloads', (subject, payload) => {
    expect(ADND_2E_MECHANICS_CODEC.validate(subject, payload, 1)).toMatchObject({
      ok: false,
      reason: 'invalid-mechanics',
    });
  });

  it('reports unsupported capabilities and schema migrations', async () => {
    expect(ADND_2E_MECHANICS_CODEC.validate('potion', {}, 1)).toMatchObject({
      ok: false,
      reason: 'unsupported-capability',
    });
    const qualified = qualifyAdnd2eMechanics('item', weapon);
    expect(qualified.ok).toBe(true);
    if (qualified.ok) {
      expect(await migrateQualifiedMechanics(qualified.value)).toEqual(qualified);
      expect(
        await migrateQualifiedMechanics({ ...qualified.value, schemaVersion: 2 }),
      ).toMatchObject({ ok: false, reason: 'unsupported-version' });
    }
  });
});

describe('AD&D 2E treasure item derivation', () => {
  const item = { id: 'ruby', name: 'Ruby', description: 'A polished red stone.', weight: 0.01 };

  it('produces a fixed-seed, source-cited item variant', async () => {
    expect(
      await deriveTreasureItemMechanics(
        ADND_2E_RULESET_REF,
        item,
        { variants: [] },
        {
          kind: 'valuable',
          category: 'gem',
          minimumValueCopper: 100,
          maximumValueCopper: 600,
        },
        new RNG('adnd-gem'),
      ),
    ).toEqual({
      ok: true,
      value: {
        ruleset: ADND_2E_RULESET_REF,
        subject: 'item',
        schemaVersion: 1,
        origin: 'generated',
        sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
        payload: {
          kind: 'valuable',
          category: 'gem',
          valueCopper: 289,
          magical: false,
        },
      },
    });
  });

  it('rejects a missing or malformed table-result context', async () => {
    expect(
      await deriveTreasureItemMechanics(
        ADND_2E_RULESET_REF,
        item,
        { variants: [] },
        { kind: 'valuable', category: 'gem', minimumValueCopper: 600, maximumValueCopper: 100 },
        new RNG('bad-range'),
      ),
    ).toMatchObject({ ok: false, reason: 'invalid-mechanics' });
  });

  it('never overwrites an existing AD&D 2E variant', async () => {
    const existing = qualifyAdnd2eMechanics('item', weapon);
    expect(existing.ok).toBe(true);
    if (!existing.ok) {
      return;
    }

    expect(
      await deriveTreasureItemMechanics(
        ADND_2E_RULESET_REF,
        item,
        { variants: [existing.value] },
        {
          kind: 'valuable',
          category: 'gem',
          minimumValueCopper: 100,
          maximumValueCopper: 600,
        },
        new RNG('duplicate'),
      ),
    ).toMatchObject({ ok: false, reason: 'variant-conflict' });
  });
});
