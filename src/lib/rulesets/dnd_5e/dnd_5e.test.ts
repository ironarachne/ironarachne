import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  deriveTreasureItemMechanics,
  getRuleset,
  migrateQualifiedMechanics,
  rulesetNotices,
} from '../index.js';
import {
  DND_5E_CURRENCY_ROWS,
  DND_5E_CURRENCY_RULES,
  DND_5E_EQUIPMENT_RULES,
  DND_5E_MECHANICS_CODEC,
  DND_5E_RULESET_REF,
  DND_5E_SRD_ATTRIBUTION,
  DND_5E_SRD_SOURCE,
  qualifyDnd5eMechanics,
} from './index.js';

const actor = {
  armorClass: 16,
  hitPoints: 24,
  proficiencyBonus: 2,
  savingThrows: {
    strength: 5,
    dexterity: 2,
    constitution: 4,
    intelligence: 0,
    wisdom: 1,
    charisma: -1,
  },
};

const weapon = {
  kind: 'weapon' as const,
  valueCopper: 1_500,
  magical: false,
  damage: '1d8',
  damageType: 'slashing' as const,
  properties: ['versatile'],
};

describe('D&D 5e source and registry', () => {
  it('pins SRD 5.1 and its exact Creative Commons attribution', () => {
    expect(DND_5E_RULESET_REF).toEqual({ id: 'dnd-5e', release: 'srd-5.1-cc' });
    expect(DND_5E_SRD_SOURCE).toMatchObject({
      id: 'dnd-srd.5.1-cc-by-4.0',
      version: '5.1 (Creative Commons release, 27 January 2023)',
      redistributable: true,
      grant: { id: 'cc-by-4.0', scope: 'open-content' },
    });
    expect(DND_5E_SRD_SOURCE.grant.notice).toBe(DND_5E_SRD_ATTRIBUTION);
    expect(DND_5E_SRD_ATTRIBUTION).toContain('System Reference Document 5.1');
    expect(DND_5E_SRD_ATTRIBUTION).toContain('creativecommons.org/licenses/by/4.0/legalcode');
  });

  it('loads only the capabilities the package implements', async () => {
    const result = await getRuleset(DND_5E_RULESET_REF);
    expect(result).toMatchObject({
      ok: true,
      value: {
        descriptor: {
          gameSystem: 'dnd-5e',
          capabilities: ['actor', 'item', 'currency', 'equipment', 'treasure-items'],
        },
      },
    });
    if (result.ok) {
      expect(result.value.mechanics).toBe(DND_5E_MECHANICS_CODEC);
      expect(result.value.currency).toBe(DND_5E_CURRENCY_RULES);
      expect(result.value.equipment).toBe(DND_5E_EQUIPMENT_RULES);
      expect(result.value.treasureItems).toBeDefined();
    }
  });

  it('assembles the required attribution from the registered release', () => {
    expect(rulesetNotices([DND_5E_RULESET_REF])).toEqual({
      ok: true,
      value: [DND_5E_SRD_SOURCE],
    });
  });

  it('gives every production currency row the SRD 5.1 source', () => {
    expect(DND_5E_CURRENCY_ROWS.map(({ value }) => value)).toEqual([1, 10, 50, 100, 1_000]);
    for (const row of DND_5E_CURRENCY_ROWS) {
      expect(row.sourceIds).toEqual([DND_5E_SRD_SOURCE.id]);
      expect(row.weight).toBe(0.02);
    }
    expect(DND_5E_CURRENCY_RULES.format(12_345, 'gold')).toBe('12,345 gp');
    expect(DND_5E_CURRENCY_RULES.format(2, 'unknown')).toBe('2 unknown');
  });
});

describe('D&D 5e mechanics', () => {
  it('validates and presents actor and item payloads', () => {
    expect(DND_5E_MECHANICS_CODEC.validate('actor', actor, 1)).toEqual({
      ok: true,
      value: actor,
    });
    expect(DND_5E_EQUIPMENT_RULES.validateItem(weapon)).toEqual({ ok: true, value: weapon });
    expect(DND_5E_EQUIPMENT_RULES.presentItem(weapon)).toEqual({
      lines: ['Value: 1,500 cp', 'Damage: 1d8 slashing', 'Properties: versatile', 'Nonmagical'],
    });
    expect(DND_5E_MECHANICS_CODEC.present('actor', actor)).toEqual({
      lines: ['AC 16', '24 hit points', 'Proficiency bonus: +2'],
    });
    expect(DND_5E_MECHANICS_CODEC.present('spell', {})).toEqual({ lines: [] });
    expect(DND_5E_EQUIPMENT_RULES.presentItem({ kind: 'unknown' })).toEqual({ lines: [] });
  });

  it('validates and presents valuable and armor variants', () => {
    const valuable = {
      kind: 'valuable',
      category: 'art-object',
      valueCopper: 25_000,
      magical: true,
      rarity: 'rare',
      requiresAttunement: true,
    };
    const armor = {
      kind: 'armor',
      valueCopper: 7_500,
      magical: false,
      armorClass: 16,
      maximumDexterityBonus: 2,
      strengthRequirement: 13,
      stealthDisadvantage: true,
    };

    expect(DND_5E_EQUIPMENT_RULES.presentItem(valuable)).toEqual({
      lines: ['Value: 25,000 cp', 'Magical (rare)'],
    });
    expect(DND_5E_EQUIPMENT_RULES.presentItem(armor)).toEqual({
      lines: ['Value: 7,500 cp', 'Armor class: 16', 'Nonmagical'],
    });
  });

  it('qualifies current payloads with exact source history', () => {
    expect(qualifyDnd5eMechanics('actor', actor)).toEqual({
      ok: true,
      value: {
        ruleset: DND_5E_RULESET_REF,
        subject: 'actor',
        schemaVersion: 1,
        origin: 'generated',
        sourceIds: [DND_5E_SRD_SOURCE.id],
        payload: actor,
      },
    });
  });

  it.each([
    ['actor', { ...actor, proficiencyBonus: Number.NaN }],
    ['actor', { ...actor, savingThrows: {} }],
    ['item', { ...weapon, damage: 'many' }],
    ['item', { ...weapon, damageType: 'emotional' }],
    ['item', { ...weapon, rarity: 'mythic' }],
  ] as const)('rejects malformed %s payloads', (subject, payload) => {
    expect(DND_5E_MECHANICS_CODEC.validate(subject, payload, 1)).toMatchObject({
      ok: false,
      reason: 'invalid-mechanics',
    });
  });

  it('reports unsupported capabilities and schema migrations', async () => {
    expect(DND_5E_MECHANICS_CODEC.validate('potion', {}, 1)).toMatchObject({
      ok: false,
      reason: 'unsupported-capability',
    });
    const qualified = qualifyDnd5eMechanics('item', weapon);
    expect(qualified.ok).toBe(true);
    if (qualified.ok) {
      expect(await migrateQualifiedMechanics(qualified.value)).toEqual(qualified);
      expect(
        await migrateQualifiedMechanics({ ...qualified.value, schemaVersion: 2 }),
      ).toMatchObject({ ok: false, reason: 'unsupported-version' });
    }
  });
});

describe('D&D 5e treasure item derivation', () => {
  const item = { id: 'ruby', name: 'Ruby', description: 'A polished red stone.', weight: 0.01 };
  it('produces a fixed-seed, source-cited item variant', async () => {
    expect(
      await deriveTreasureItemMechanics(
        DND_5E_RULESET_REF,
        item,
        { variants: [] },
        {
          kind: 'valuable',
          category: 'gem',
          minimumValueCopper: 100,
          maximumValueCopper: 600,
          magical: false,
        },
        new RNG('5e-gem'),
      ),
    ).toEqual({
      ok: true,
      value: {
        ruleset: DND_5E_RULESET_REF,
        subject: 'item',
        schemaVersion: 1,
        origin: 'generated',
        sourceIds: [DND_5E_SRD_SOURCE.id],
        payload: {
          kind: 'valuable',
          category: 'gem',
          valueCopper: 183,
          magical: false,
        },
      },
    });
  });

  it('rejects a malformed table-result context', async () => {
    expect(
      await deriveTreasureItemMechanics(
        DND_5E_RULESET_REF,
        item,
        { variants: [] },
        { kind: 'valuable', category: 'gem', minimumValueCopper: 600, maximumValueCopper: 100 },
        new RNG('bad-range'),
      ),
    ).toMatchObject({ ok: false, reason: 'invalid-mechanics' });
  });

  it('derives caller-selected weapon and armor results', async () => {
    const weaponResult = await deriveTreasureItemMechanics(
      DND_5E_RULESET_REF,
      item,
      { variants: [] },
      {
        kind: 'weapon',
        minimumValueCopper: 5_000,
        maximumValueCopper: 5_000,
        magical: true,
        rarity: 'uncommon',
        requiresAttunement: false,
        damage: '1d6',
        damageType: 'piercing',
        properties: ['finesse', 'light'],
      },
      new RNG('5e-weapon'),
    );
    expect(weaponResult).toMatchObject({
      ok: true,
      value: {
        payload: {
          kind: 'weapon',
          valueCopper: 5_000,
          magical: true,
          rarity: 'uncommon',
          requiresAttunement: false,
          damage: '1d6',
          damageType: 'piercing',
          properties: ['finesse', 'light'],
        },
      },
    });

    const armorResult = await deriveTreasureItemMechanics(
      DND_5E_RULESET_REF,
      item,
      { variants: [] },
      {
        kind: 'armor',
        minimumValueCopper: 10_000,
        maximumValueCopper: 10_000,
        armorClass: 14,
        maximumDexterityBonus: 2,
        strengthRequirement: 13,
        stealthDisadvantage: true,
      },
      new RNG('5e-armor'),
    );
    expect(armorResult).toMatchObject({
      ok: true,
      value: {
        payload: {
          kind: 'armor',
          valueCopper: 10_000,
          magical: false,
          armorClass: 14,
          maximumDexterityBonus: 2,
          strengthRequirement: 13,
          stealthDisadvantage: true,
        },
      },
    });
  });

  it('never overwrites an existing D&D 5e variant', async () => {
    const existing = qualifyDnd5eMechanics('item', weapon);
    expect(existing.ok).toBe(true);
    if (!existing.ok) {
      return;
    }

    expect(
      await deriveTreasureItemMechanics(
        DND_5E_RULESET_REF,
        item,
        { variants: [existing.value] },
        { kind: 'valuable', category: 'gem', minimumValueCopper: 100, maximumValueCopper: 600 },
        new RNG('duplicate'),
      ),
    ).toMatchObject({ ok: false, reason: 'variant-conflict' });
  });
});
