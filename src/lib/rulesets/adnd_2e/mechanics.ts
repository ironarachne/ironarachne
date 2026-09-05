import { acceptedRuleset, rejectedRuleset } from '../ruleset_results';
import type {
  MechanicsCodec,
  MechanicsOrigin,
  MechanicsPresentation,
  MechanicsSubject,
  QualifiedMechanics,
  RulesetResult,
} from '../ruleset_types';
import { ADND_2E_RULESET_REF } from './descriptor';
import {
  ADND_2E_DAMAGE_TYPES,
  ADND_2E_VALUABLE_CATEGORIES,
  type Adnd2eActorMechanics,
  type Adnd2eItemMechanics,
} from './mechanics_types';
import { ADND_2E_OPEN_RULES_SOURCE } from './source_manifest';

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

function isDiceExpression(value: unknown): value is string {
  return typeof value === 'string' && /^(?:\d+|\d+d\d+(?:[+-]\d+)?)$/.test(value);
}

export function validateAdnd2eActorMechanics(
  payload: unknown,
): RulesetResult<Adnd2eActorMechanics> {
  const actor = asRecord(payload);
  const saves = asRecord(actor?.savingThrows);
  if (
    actor === undefined ||
    saves === undefined ||
    !isFiniteNumber(actor.armorClass) ||
    !isFiniteNumber(actor.thaco) ||
    !isNonNegativeNumber(actor.hitPoints) ||
    !isFiniteNumber(saves.paralyzationPoisonDeath) ||
    !isFiniteNumber(saves.rodStaffWand) ||
    !isFiniteNumber(saves.petrificationPolymorph) ||
    !isFiniteNumber(saves.breathWeapon) ||
    !isFiniteNumber(saves.spell)
  ) {
    return rejectedRuleset('invalid-mechanics', 'AD&D 2E actor mechanics is malformed');
  }
  return acceptedRuleset(payload as Adnd2eActorMechanics);
}

export function validateAdnd2eItemMechanics(payload: unknown): RulesetResult<Adnd2eItemMechanics> {
  const item = asRecord(payload);
  if (item === undefined || !isNonNegativeNumber(item.valueCopper)) {
    return rejectedRuleset('invalid-mechanics', 'AD&D 2E item mechanics is malformed');
  }

  if (
    item.kind === 'valuable' &&
    typeof item.category === 'string' &&
    (ADND_2E_VALUABLE_CATEGORIES as readonly string[]).includes(item.category) &&
    typeof item.magical === 'boolean'
  ) {
    return acceptedRuleset(payload as Adnd2eItemMechanics);
  }
  if (
    item.kind === 'weapon' &&
    typeof item.damageType === 'string' &&
    (ADND_2E_DAMAGE_TYPES as readonly string[]).includes(item.damageType) &&
    isDiceExpression(item.damageSmallMedium) &&
    isDiceExpression(item.damageLarge) &&
    isNonNegativeNumber(item.speedFactor)
  ) {
    return acceptedRuleset(payload as Adnd2eItemMechanics);
  }
  if (item.kind === 'armor' && isFiniteNumber(item.armorClass)) {
    return acceptedRuleset(payload as Adnd2eItemMechanics);
  }

  return rejectedRuleset('invalid-mechanics', 'AD&D 2E item mechanics is malformed');
}

export function presentAdnd2eItemMechanics(payload: unknown): MechanicsPresentation {
  const checked = validateAdnd2eItemMechanics(payload);
  if (!checked.ok) {
    return { lines: [] };
  }
  const item = checked.value;
  if (item.kind === 'weapon') {
    return {
      lines: [
        `Value: ${ADND_2E_NUMBER_FORMAT.format(item.valueCopper)} cp`,
        `Damage: ${item.damageSmallMedium} (S/M), ${item.damageLarge} (L)`,
        `Speed factor: ${item.speedFactor}`,
      ],
    };
  }
  if (item.kind === 'armor') {
    return {
      lines: [
        `Value: ${ADND_2E_NUMBER_FORMAT.format(item.valueCopper)} cp`,
        `Armor class: ${item.armorClass}`,
      ],
    };
  }
  return {
    lines: [
      `Value: ${ADND_2E_NUMBER_FORMAT.format(item.valueCopper)} cp`,
      item.magical ? 'Magical' : 'Nonmagical',
    ],
  };
}

const ADND_2E_NUMBER_FORMAT = new Intl.NumberFormat();

function present(subject: MechanicsSubject, payload: unknown): MechanicsPresentation {
  if (subject === 'actor') {
    const checked = validateAdnd2eActorMechanics(payload);
    return checked.ok
      ? {
          lines: [
            `AC ${checked.value.armorClass}`,
            `THAC0 ${checked.value.thaco}`,
            `${checked.value.hitPoints} hit points`,
          ],
        }
      : { lines: [] };
  }
  return subject === 'item' ? presentAdnd2eItemMechanics(payload) : { lines: [] };
}

export const ADND_2E_MECHANICS_CODEC: MechanicsCodec = {
  schemaVersion: (subject) => (subject === 'actor' || subject === 'item' ? 1 : undefined),
  validate: (subject, payload, schemaVersion) => {
    if (schemaVersion !== 1) {
      return rejectedRuleset('unsupported-version', 'AD&D 2E mechanics only supports version 1');
    }
    if (subject === 'actor') {
      return validateAdnd2eActorMechanics(payload);
    }
    if (subject === 'item') {
      return validateAdnd2eItemMechanics(payload);
    }
    return rejectedRuleset('unsupported-capability', `AD&D 2E does not support ${subject}`);
  },
  migrate: (subject, _payload, fromVersion) =>
    rejectedRuleset(
      'unsupported-version',
      `AD&D 2E cannot migrate ${subject} mechanics version ${fromVersion}`,
    ),
  present,
};

export function qualifyAdnd2eMechanics(
  subject: 'actor',
  payload: Adnd2eActorMechanics,
  origin?: MechanicsOrigin,
): RulesetResult<QualifiedMechanics>;
export function qualifyAdnd2eMechanics(
  subject: 'item',
  payload: Adnd2eItemMechanics,
  origin?: MechanicsOrigin,
): RulesetResult<QualifiedMechanics>;
export function qualifyAdnd2eMechanics(
  subject: 'actor' | 'item',
  payload: Adnd2eActorMechanics | Adnd2eItemMechanics,
  origin: MechanicsOrigin = 'generated',
): RulesetResult<QualifiedMechanics> {
  const checked = ADND_2E_MECHANICS_CODEC.validate(subject, payload, 1);
  if (!checked.ok) {
    return checked;
  }
  return acceptedRuleset({
    ruleset: ADND_2E_RULESET_REF,
    subject,
    schemaVersion: 1,
    origin,
    sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
    payload: checked.value,
  });
}
