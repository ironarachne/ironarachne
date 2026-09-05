import { acceptedRuleset, rejectedRuleset } from '../ruleset_results';
import type { TreasureItemRules } from '../ruleset_types';
import { ADND_2E_RULESET_REF } from './descriptor';
import { validateAdnd2eItemMechanics } from './mechanics';
import {
  ADND_2E_DAMAGE_TYPES,
  ADND_2E_VALUABLE_CATEGORIES,
  type Adnd2eItemMechanics,
  type Adnd2eTreasureItemContext,
} from './mechanics_types';
import { ADND_2E_OPEN_RULES_SOURCE } from './source_manifest';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isValidValueRange(context: Record<string, unknown>): boolean {
  return (
    Number.isInteger(context.minimumValueCopper) &&
    Number.isInteger(context.maximumValueCopper) &&
    (context.minimumValueCopper as number) >= 0 &&
    (context.maximumValueCopper as number) >= (context.minimumValueCopper as number)
  );
}

export function validateAdnd2eTreasureItemContext(
  value: unknown,
): value is Adnd2eTreasureItemContext {
  const context = asRecord(value);
  if (context === undefined || !isValidValueRange(context)) {
    return false;
  }
  if (context.kind === 'valuable') {
    return (
      typeof context.category === 'string' &&
      (ADND_2E_VALUABLE_CATEGORIES as readonly string[]).includes(context.category) &&
      (context.magical === undefined || typeof context.magical === 'boolean')
    );
  }
  if (context.kind === 'weapon') {
    return (
      typeof context.damageType === 'string' &&
      (ADND_2E_DAMAGE_TYPES as readonly string[]).includes(context.damageType) &&
      typeof context.damageSmallMedium === 'string' &&
      typeof context.damageLarge === 'string' &&
      typeof context.speedFactor === 'number'
    );
  }
  return context.kind === 'armor' && typeof context.armorClass === 'number';
}

export const ADND_2E_TREASURE_ITEM_RULES: TreasureItemRules = {
  derive: (_item, _existing, context, rng) => {
    if (!validateAdnd2eTreasureItemContext(context)) {
      return rejectedRuleset(
        'invalid-mechanics',
        'AD&D 2E treasure derivation needs a valid table-result context',
      );
    }

    const valueCopper = rng.int(context.minimumValueCopper, context.maximumValueCopper);
    let payload: Adnd2eItemMechanics;
    if (context.kind === 'valuable') {
      payload = {
        kind: 'valuable',
        category: context.category,
        valueCopper,
        magical: context.magical ?? false,
      };
    } else if (context.kind === 'weapon') {
      payload = {
        kind: 'weapon',
        valueCopper,
        damageType: context.damageType,
        damageSmallMedium: context.damageSmallMedium,
        damageLarge: context.damageLarge,
        speedFactor: context.speedFactor,
      };
    } else {
      payload = {
        kind: 'armor',
        valueCopper,
        armorClass: context.armorClass,
      };
    }

    const checked = validateAdnd2eItemMechanics(payload);
    if (!checked.ok) {
      return checked;
    }
    return acceptedRuleset({
      ruleset: ADND_2E_RULESET_REF,
      subject: 'item',
      schemaVersion: 1,
      origin: 'generated',
      sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
      payload: checked.value,
    });
  },
};
