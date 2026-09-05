import { acceptedRuleset, rejectedRuleset } from '../ruleset_results';
import type { TreasureItemRules } from '../ruleset_types';
import { DND_5E_RULESET_REF } from './descriptor';
import { validateDnd5eItemMechanics } from './mechanics';
import {
  DND_5E_DAMAGE_TYPES,
  DND_5E_RARITIES,
  DND_5E_VALUABLE_CATEGORIES,
  type Dnd5eItemMechanics,
  type Dnd5eTreasureItemContext,
} from './mechanics_types';
import { DND_5E_SRD_SOURCE } from './source_manifest';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function hasValidCommonFields(context: Record<string, unknown>): boolean {
  return (
    Number.isInteger(context.minimumValueCopper) &&
    Number.isInteger(context.maximumValueCopper) &&
    (context.minimumValueCopper as number) >= 0 &&
    (context.maximumValueCopper as number) >= (context.minimumValueCopper as number) &&
    (context.magical === undefined || typeof context.magical === 'boolean') &&
    (context.requiresAttunement === undefined || typeof context.requiresAttunement === 'boolean') &&
    (context.rarity === undefined ||
      (typeof context.rarity === 'string' &&
        (DND_5E_RARITIES as readonly string[]).includes(context.rarity)))
  );
}

export function validateDnd5eTreasureItemContext(
  value: unknown,
): value is Dnd5eTreasureItemContext {
  const context = asRecord(value);
  if (context === undefined || !hasValidCommonFields(context)) {
    return false;
  }
  if (context.kind === 'valuable') {
    return (
      typeof context.category === 'string' &&
      (DND_5E_VALUABLE_CATEGORIES as readonly string[]).includes(context.category)
    );
  }
  if (context.kind === 'weapon') {
    return (
      typeof context.damage === 'string' &&
      typeof context.damageType === 'string' &&
      (DND_5E_DAMAGE_TYPES as readonly string[]).includes(context.damageType) &&
      Array.isArray(context.properties) &&
      context.properties.every((property) => typeof property === 'string')
    );
  }
  return (
    context.kind === 'armor' &&
    typeof context.armorClass === 'number' &&
    (context.maximumDexterityBonus === undefined ||
      typeof context.maximumDexterityBonus === 'number') &&
    (context.strengthRequirement === undefined ||
      typeof context.strengthRequirement === 'number') &&
    typeof context.stealthDisadvantage === 'boolean'
  );
}

export const DND_5E_TREASURE_ITEM_RULES: TreasureItemRules = {
  derive: (_item, _existing, context, rng) => {
    if (!validateDnd5eTreasureItemContext(context)) {
      return rejectedRuleset(
        'invalid-mechanics',
        'D&D 5e treasure derivation needs a valid table-result context',
      );
    }

    const valueCopper = rng.int(context.minimumValueCopper, context.maximumValueCopper);
    const common = {
      valueCopper,
      magical: context.magical ?? false,
      ...(context.rarity === undefined ? {} : { rarity: context.rarity }),
      ...(context.requiresAttunement === undefined
        ? {}
        : { requiresAttunement: context.requiresAttunement }),
    };
    let payload: Dnd5eItemMechanics;
    if (context.kind === 'valuable') {
      payload = { ...common, kind: 'valuable', category: context.category };
    } else if (context.kind === 'weapon') {
      payload = {
        ...common,
        kind: 'weapon',
        damage: context.damage,
        damageType: context.damageType,
        properties: [...context.properties],
      };
    } else {
      payload = {
        ...common,
        kind: 'armor',
        armorClass: context.armorClass,
        ...(context.maximumDexterityBonus === undefined
          ? {}
          : { maximumDexterityBonus: context.maximumDexterityBonus }),
        ...(context.strengthRequirement === undefined
          ? {}
          : { strengthRequirement: context.strengthRequirement }),
        stealthDisadvantage: context.stealthDisadvantage,
      };
    }

    const checked = validateDnd5eItemMechanics(payload);
    if (!checked.ok) {
      return checked;
    }
    return acceptedRuleset({
      ruleset: DND_5E_RULESET_REF,
      subject: 'item',
      schemaVersion: 1,
      origin: 'generated',
      sourceIds: [DND_5E_SRD_SOURCE.id],
      payload: checked.value,
    });
  },
};
