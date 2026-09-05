import { acceptedRuleset, rejectedRuleset } from '../ruleset_results';
import type {
  MechanicsCodec,
  MechanicsOrigin,
  MechanicsPresentation,
  MechanicsSubject,
  QualifiedMechanics,
  RulesetResult,
} from '../ruleset_types';
import { DND_5E_RULESET_REF } from './descriptor';
import {
  DND_5E_DAMAGE_TYPES,
  DND_5E_RARITIES,
  DND_5E_VALUABLE_CATEGORIES,
  type Dnd5eActorMechanics,
  type Dnd5eItemMechanics,
} from './mechanics_types';
import { DND_5E_SRD_SOURCE } from './source_manifest';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

function isOptionalNonNegativeNumber(value: unknown): boolean {
  return value === undefined || isNonNegativeNumber(value);
}

function isDiceExpression(value: unknown): value is string {
  return typeof value === 'string' && /^(?:\d+|\d+d\d+(?:[+-]\d+)?)$/.test(value);
}

function hasValidMagicMetadata(item: Record<string, unknown>): boolean {
  return (
    typeof item.magical === 'boolean' &&
    (item.rarity === undefined ||
      (typeof item.rarity === 'string' &&
        (DND_5E_RARITIES as readonly string[]).includes(item.rarity))) &&
    (item.requiresAttunement === undefined || typeof item.requiresAttunement === 'boolean')
  );
}

export function validateDnd5eActorMechanics(payload: unknown): RulesetResult<Dnd5eActorMechanics> {
  const actor = asRecord(payload);
  const saves = asRecord(actor?.savingThrows);
  if (
    actor === undefined ||
    saves === undefined ||
    !isNonNegativeNumber(actor.armorClass) ||
    !isNonNegativeNumber(actor.hitPoints) ||
    !isFiniteNumber(actor.proficiencyBonus) ||
    !isFiniteNumber(saves.strength) ||
    !isFiniteNumber(saves.dexterity) ||
    !isFiniteNumber(saves.constitution) ||
    !isFiniteNumber(saves.intelligence) ||
    !isFiniteNumber(saves.wisdom) ||
    !isFiniteNumber(saves.charisma)
  ) {
    return rejectedRuleset('invalid-mechanics', 'D&D 5e actor mechanics is malformed');
  }
  return acceptedRuleset(payload as Dnd5eActorMechanics);
}

export function validateDnd5eItemMechanics(payload: unknown): RulesetResult<Dnd5eItemMechanics> {
  const item = asRecord(payload);
  if (
    item === undefined ||
    !isNonNegativeNumber(item.valueCopper) ||
    !hasValidMagicMetadata(item)
  ) {
    return rejectedRuleset('invalid-mechanics', 'D&D 5e item mechanics is malformed');
  }

  if (
    item.kind === 'valuable' &&
    typeof item.category === 'string' &&
    (DND_5E_VALUABLE_CATEGORIES as readonly string[]).includes(item.category)
  ) {
    return acceptedRuleset(payload as Dnd5eItemMechanics);
  }
  if (
    item.kind === 'weapon' &&
    isDiceExpression(item.damage) &&
    typeof item.damageType === 'string' &&
    (DND_5E_DAMAGE_TYPES as readonly string[]).includes(item.damageType) &&
    Array.isArray(item.properties) &&
    item.properties.every((property) => typeof property === 'string' && property.trim() !== '')
  ) {
    return acceptedRuleset(payload as Dnd5eItemMechanics);
  }
  if (
    item.kind === 'armor' &&
    isNonNegativeNumber(item.armorClass) &&
    isOptionalNonNegativeNumber(item.maximumDexterityBonus) &&
    isOptionalNonNegativeNumber(item.strengthRequirement) &&
    typeof item.stealthDisadvantage === 'boolean'
  ) {
    return acceptedRuleset(payload as Dnd5eItemMechanics);
  }

  return rejectedRuleset('invalid-mechanics', 'D&D 5e item mechanics is malformed');
}

const DND_5E_NUMBER_FORMAT = new Intl.NumberFormat();

export function presentDnd5eItemMechanics(payload: unknown): MechanicsPresentation {
  const checked = validateDnd5eItemMechanics(payload);
  if (!checked.ok) {
    return { lines: [] };
  }
  const item = checked.value;
  const magic = item.magical
    ? `Magical${item.rarity === undefined ? '' : ` (${item.rarity})`}`
    : 'Nonmagical';
  if (item.kind === 'weapon') {
    return {
      lines: [
        `Value: ${DND_5E_NUMBER_FORMAT.format(item.valueCopper)} cp`,
        `Damage: ${item.damage} ${item.damageType}`,
        `Properties: ${item.properties.join(', ') || 'none'}`,
        magic,
      ],
    };
  }
  if (item.kind === 'armor') {
    return {
      lines: [
        `Value: ${DND_5E_NUMBER_FORMAT.format(item.valueCopper)} cp`,
        `Armor class: ${item.armorClass}`,
        magic,
      ],
    };
  }
  return {
    lines: [`Value: ${DND_5E_NUMBER_FORMAT.format(item.valueCopper)} cp`, magic],
  };
}

function present(subject: MechanicsSubject, payload: unknown): MechanicsPresentation {
  if (subject === 'actor') {
    const checked = validateDnd5eActorMechanics(payload);
    return checked.ok
      ? {
          lines: [
            `AC ${checked.value.armorClass}`,
            `${checked.value.hitPoints} hit points`,
            `Proficiency bonus: ${checked.value.proficiencyBonus >= 0 ? '+' : ''}${checked.value.proficiencyBonus}`,
          ],
        }
      : { lines: [] };
  }
  return subject === 'item' ? presentDnd5eItemMechanics(payload) : { lines: [] };
}

export const DND_5E_MECHANICS_CODEC: MechanicsCodec = {
  schemaVersion: (subject) => (subject === 'actor' || subject === 'item' ? 1 : undefined),
  validate: (subject, payload, schemaVersion) => {
    if (schemaVersion !== 1) {
      return rejectedRuleset('unsupported-version', 'D&D 5e mechanics only supports version 1');
    }
    if (subject === 'actor') {
      return validateDnd5eActorMechanics(payload);
    }
    if (subject === 'item') {
      return validateDnd5eItemMechanics(payload);
    }
    return rejectedRuleset('unsupported-capability', `D&D 5e does not support ${subject}`);
  },
  migrate: (subject, _payload, fromVersion) =>
    rejectedRuleset(
      'unsupported-version',
      `D&D 5e cannot migrate ${subject} mechanics version ${fromVersion}`,
    ),
  present,
};

export function qualifyDnd5eMechanics(
  subject: 'actor',
  payload: Dnd5eActorMechanics,
  origin?: MechanicsOrigin,
): RulesetResult<QualifiedMechanics>;
export function qualifyDnd5eMechanics(
  subject: 'item',
  payload: Dnd5eItemMechanics,
  origin?: MechanicsOrigin,
): RulesetResult<QualifiedMechanics>;
export function qualifyDnd5eMechanics(
  subject: 'actor' | 'item',
  payload: Dnd5eActorMechanics | Dnd5eItemMechanics,
  origin: MechanicsOrigin = 'generated',
): RulesetResult<QualifiedMechanics> {
  const checked = DND_5E_MECHANICS_CODEC.validate(subject, payload, 1);
  if (!checked.ok) {
    return checked;
  }
  return acceptedRuleset({
    ruleset: DND_5E_RULESET_REF,
    subject,
    schemaVersion: 1,
    origin,
    sourceIds: [DND_5E_SRD_SOURCE.id],
    payload: checked.value,
  });
}
