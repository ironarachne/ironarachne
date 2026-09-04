import { describe, expect, it } from 'vitest';

import { IRONARACHNE_RULESET_REF } from './ironarachne/descriptor.js';
import {
  withLegacyActorMechanics,
  withLegacyHoardMechanics,
  withLegacyItemMechanics,
  withLegacyPotionMechanics,
} from './legacy_migrations.js';

function variantOf(record: { mechanics: { variants: unknown[] } }) {
  return record.mechanics.variants[record.mechanics.variants.length - 1];
}

describe('legacy mechanics copies', () => {
  it('copies every item mechanics field without changing the common record', () => {
    const old = {
      id: 'blade',
      name: 'Edited blade',
      value: 321,
      combatProfile: { attack: 42 },
      actions: [{ name: 'Cut' }],
      enchantment: { name: 'Bright' },
    };
    const migrated = withLegacyItemMechanics(old, 'migrated');

    expect(migrated).toMatchObject(old);
    expect(variantOf(migrated)).toEqual({
      ruleset: IRONARACHNE_RULESET_REF,
      subject: 'item',
      schemaVersion: 1,
      origin: 'migrated',
      sourceIds: ['ironarachne.normalized-mechanics.v1'],
      payload: {
        value: 321,
        combatProfile: old.combatProfile,
        actions: old.actions,
        enchantment: old.enchantment,
      },
    });
  });

  it('copies potion, actor, archetype, and hoard values without recomputation', () => {
    const potion = withLegacyPotionMechanics(
      {
        effect: { name: 'Edited effect' },
        modifications: [{ kind: 'double' }],
        liquid: { value: 7 },
      },
      'migrated',
    );
    expect(variantOf(potion)).toMatchObject({
      subject: 'potion',
      payload: { effect: { name: 'Edited effect' }, modifications: [{ kind: 'double' }], value: 7 },
    });

    const actor = withLegacyActorMechanics(
      {
        name: 'Edited person',
        combatProfile: { attack: 19 },
        actions: [{ name: 'Wait' }],
        archetype: {
          basePowerModifier: 11,
          actions: [{ name: 'Cast' }],
          casterProfile: { maxMagnitude: 55 },
        },
      },
      'migrated',
    );
    expect(variantOf(actor)).toMatchObject({
      subject: 'actor',
      payload: {
        combatProfile: { attack: 19 },
        actions: [{ name: 'Wait' }],
        archetype: {
          basePowerModifier: 11,
          actions: [{ name: 'Cast' }],
          casterProfile: { maxMagnitude: 55 },
        },
      },
    });

    expect(variantOf(withLegacyHoardMechanics({ targetValue: 1234 }, 'migrated'))).toMatchObject({
      subject: 'hoard',
      payload: { targetValue: 1234 },
    });
  });

  it('preserves existing variants and never duplicates Iron Arachne mechanics', () => {
    const existing = {
      mechanics: {
        variants: [
          {
            ruleset: IRONARACHNE_RULESET_REF,
            subject: 'item' as const,
            schemaVersion: 1,
            origin: 'user' as const,
            sourceIds: [],
            payload: { value: 999 },
          },
        ],
      },
      value: 1,
    };
    expect(withLegacyItemMechanics(existing, 'generated').mechanics).toEqual(existing.mechanics);
  });
});
