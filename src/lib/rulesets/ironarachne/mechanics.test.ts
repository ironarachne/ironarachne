import { describe, expect, it } from 'vitest';

import * as LegacyCombat from '$lib/combat_system';
import * as LegacyCurrency from '$lib/currency';
import * as LegacyMagic from '$lib/magic';

import { getRuleset } from '../rulesets';
import {
  IRONARACHNE_CURRENCY_RULES,
  IRONARACHNE_MECHANICS_CODEC,
  IRONARACHNE_RULESET_REF,
  STANDARD_FANTASY,
  convertToDnDArmorClass,
  emptyMechanicsSet,
  getDefaultCombatActions,
  getDefaultCombatProfile,
  getSpellSummary,
  qualifyIronArachneMechanics,
} from './index.js';

const combatProfile = getDefaultCombatProfile();
const actions = getDefaultCombatActions();

describe('compatibility ownership', () => {
  it('keeps the old public combat exports as the same implementations', () => {
    expect(LegacyCombat.getDefaultCombatProfile).toBe(getDefaultCombatProfile);
    expect(LegacyCombat.convertToDnDArmorClass).toBe(convertToDnDArmorClass);
  });

  it('keeps the old public magic exports as the same implementations', () => {
    expect(LegacyMagic.getSpellSummary).toBe(getSpellSummary);
  });

  it('keeps the old public currency exports as the same data and implementations', () => {
    expect(LegacyCurrency.STANDARD_FANTASY).toBe(STANDARD_FANTASY);
    expect(LegacyCurrency.valueToString(1234)).toBe('1 pp 2 gp 3 sp 4 cp');
  });

  it('loads only capabilities backed by compatibility services', async () => {
    const result = await getRuleset(IRONARACHNE_RULESET_REF);
    expect(result).toMatchObject({
      ok: true,
      value: {
        descriptor: {
          capabilities: ['actor', 'item', 'potion', 'spell', 'hoard', 'currency'],
        },
      },
    });
    if (result.ok) {
      expect(result.value.mechanics).toBe(IRONARACHNE_MECHANICS_CODEC);
      expect(result.value.currency).toBe(IRONARACHNE_CURRENCY_RULES);
      expect(result.value.equipment).toBeUndefined();
      expect(result.value.treasureItems).toBeUndefined();
    }
  });
});

describe('compatibility mechanics codec', () => {
  const valid = {
    actor: { combatProfile, actions },
    item: {
      value: 100,
      combatProfile,
      actions,
      enchantment: { name: 'Bright', description: 'It shines.' },
    },
    potion: { effect: { name: 'Healing' }, modifications: [], value: 50 },
    spell: { id: 'spark', name: 'Spark', magnitude: 10, difficulty: 20 },
    hoard: { targetValue: 1_000 },
  } as const;

  it.each(Object.entries(valid))('accepts %s mechanics', (subject, payload) => {
    expect(IRONARACHNE_MECHANICS_CODEC.validate(subject as keyof typeof valid, payload, 1)).toEqual(
      {
        ok: true,
        value: payload,
      },
    );
  });

  it.each([
    ['actor', { combatProfile: {}, actions }],
    ['actor', { combatProfile, actions: [{}] }],
    ['actor', { combatProfile, actions, casterProfile: {} }],
    ['item', { value: 'many' }],
    ['item', { value: 1, combatProfile: {} }],
    ['item', { value: 1, actions: [{}] }],
    ['item', { value: 1, enchantment: {} }],
    ['potion', { effect: 'Healing', modifications: [] }],
    ['potion', { effect: {}, modifications: [] }],
    ['potion', { effect: {}, modifications: 'none' }],
    ['potion', { effect: {}, modifications: [], value: 'many' }],
    ['spell', { id: 'spark', name: 'Spark', magnitude: 'high', difficulty: 20 }],
    ['hoard', { targetValue: 'many' }],
  ] as const)('rejects malformed %s mechanics', (subject, payload) => {
    expect(IRONARACHNE_MECHANICS_CODEC.validate(subject, payload, 1)).toMatchObject({
      ok: false,
      reason: 'invalid-mechanics',
    });
  });

  it('rejects unknown versions and migrations', () => {
    expect(IRONARACHNE_MECHANICS_CODEC.validate('item', valid.item, 2)).toMatchObject({
      ok: false,
      reason: 'unsupported-version',
    });
    expect(IRONARACHNE_MECHANICS_CODEC.migrate('item', valid.item, 0)).toMatchObject({
      ok: false,
      reason: 'unsupported-version',
    });
  });

  it('presents each subject without assuming another ruleset', () => {
    expect(IRONARACHNE_MECHANICS_CODEC.present('actor', valid.actor)).toEqual({
      lines: [`${actions.length} actions`],
    });
    expect(IRONARACHNE_MECHANICS_CODEC.present('item', valid.item)).toEqual({
      lines: ['Value: 100'],
    });
    expect(IRONARACHNE_MECHANICS_CODEC.present('potion', valid.potion)).toEqual({
      lines: ['Healing'],
    });
    expect(IRONARACHNE_MECHANICS_CODEC.present('spell', valid.spell)).toEqual({
      title: 'Spark',
      lines: [],
    });
    expect(IRONARACHNE_MECHANICS_CODEC.present('hoard', valid.hoard)).toEqual({
      lines: ['Target value: 1000'],
    });
  });

  it('qualifies valid mechanics and preserves an explicit origin', () => {
    expect(qualifyIronArachneMechanics('item', valid.item, 'migrated')).toEqual({
      ok: true,
      value: {
        ruleset: IRONARACHNE_RULESET_REF,
        subject: 'item',
        schemaVersion: 1,
        origin: 'migrated',
        sourceIds: ['ironarachne.normalized-mechanics.v1'],
        payload: valid.item,
      },
    });
  });

  it('does not qualify a payload the codec rejects', () => {
    expect(qualifyIronArachneMechanics('item', { value: Number.NaN })).toMatchObject({
      ok: false,
      reason: 'invalid-mechanics',
    });
  });

  it('creates a fresh empty mechanics set', () => {
    const first = emptyMechanicsSet();
    const second = emptyMechanicsSet();
    expect(first).toEqual({ variants: [] });
    expect(first).not.toBe(second);
    expect(first.variants).not.toBe(second.variants);
  });
});

describe('compatibility currency rules', () => {
  it('adapts the existing standard fantasy denominations', () => {
    expect(IRONARACHNE_CURRENCY_RULES.definition.baseDenominationId).toBe('copper');
    expect(IRONARACHNE_CURRENCY_RULES.definition.denominations).toEqual(
      STANDARD_FANTASY.denominations.map((denomination) =>
        expect.objectContaining({
          id: denomination.name,
          name: denomination.name,
          value: denomination.value,
        }),
      ),
    );
  });

  it('formats known symbols and falls back to an unknown denomination id', () => {
    expect(IRONARACHNE_CURRENCY_RULES.format(12, 'gold')).toMatch(/12 gp$/);
    expect(IRONARACHNE_CURRENCY_RULES.format(2, 'shell')).toMatch(/2 shell$/);
  });
});
