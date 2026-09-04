import { acceptedRuleset, rejectedRuleset } from '../ruleset_results';
import type {
  MechanicsCodec,
  MechanicsOrigin,
  MechanicsPresentation,
  MechanicsSet,
  MechanicsSubject,
  QualifiedMechanics,
  RulesetResult,
} from '../ruleset_types';
import type { CombatAction, CombatProfile } from './combat_types';
import { IRONARACHNE_RULESET_REF } from './descriptor';
import type { CasterProfile } from './magic_types';
import { IRONARACHNE_ORIGINAL_SOURCE } from './source_manifest';

export type IronArachneActorMechanics = {
  combatProfile: CombatProfile;
  actions: CombatAction[];
  casterProfile?: CasterProfile;
};

export type IronArachneItemMechanics = {
  value: number;
  combatProfile?: CombatProfile;
  actions?: CombatAction[];
  enchantment?: { name: string; description: string };
};

export type IronArachnePotionMechanics = {
  effect: { name: string };
  modifications: unknown[];
  value?: number;
};

export type IronArachneSpellMechanics = {
  id: string;
  name: string;
  magnitude: number;
  difficulty: number;
};

export type IronArachneHoardMechanics = {
  targetValue: number;
};

export type IronArachneMechanicsPayload =
  | IronArachneActorMechanics
  | IronArachneItemMechanics
  | IronArachnePotionMechanics
  | IronArachneSpellMechanics
  | IronArachneHoardMechanics;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isCombatProfile(value: unknown): value is CombatProfile {
  const record = asRecord(value);
  return (
    record !== undefined &&
    ['attack', 'defense', 'power', 'resilience', 'speed', 'health'].every((field) =>
      isFiniteNumber(record[field]),
    )
  );
}

function isCombatAction(value: unknown): value is CombatAction {
  const record = asRecord(value);
  return (
    record !== undefined &&
    typeof record.name === 'string' &&
    typeof record.description === 'string' &&
    ['attack', 'defense', 'utility'].includes(record.type as string)
  );
}

function isActions(value: unknown): value is CombatAction[] {
  return Array.isArray(value) && value.every(isCombatAction);
}

function isCasterProfile(value: unknown): value is CasterProfile {
  const record = asRecord(value);
  return (
    record !== undefined &&
    isFiniteNumber(record.maxMagnitude) &&
    isFiniteNumber(record.maxDifficulty)
  );
}

function isNamedDescription(value: unknown): value is { name: string; description: string } {
  const record = asRecord(value);
  return (
    record !== undefined &&
    typeof record.name === 'string' &&
    typeof record.description === 'string'
  );
}

function validateActor(payload: unknown): RulesetResult<unknown> {
  const record = asRecord(payload);
  return record !== undefined &&
    isCombatProfile(record.combatProfile) &&
    isActions(record.actions) &&
    (record.casterProfile === undefined || isCasterProfile(record.casterProfile))
    ? acceptedRuleset(payload)
    : rejectedRuleset('invalid-mechanics', 'Iron Arachne actor mechanics is invalid');
}

function validateItem(payload: unknown): RulesetResult<unknown> {
  const record = asRecord(payload);
  const valid =
    record !== undefined &&
    isFiniteNumber(record.value) &&
    (record.combatProfile === undefined || isCombatProfile(record.combatProfile)) &&
    (record.actions === undefined || isActions(record.actions)) &&
    (record.enchantment === undefined || isNamedDescription(record.enchantment));
  return valid
    ? acceptedRuleset(payload)
    : rejectedRuleset('invalid-mechanics', 'Iron Arachne item mechanics is invalid');
}

function validatePotion(payload: unknown): RulesetResult<unknown> {
  const record = asRecord(payload);
  const valid =
    record !== undefined &&
    typeof asRecord(record.effect)?.name === 'string' &&
    Array.isArray(record.modifications) &&
    (record.value === undefined || isFiniteNumber(record.value));
  return valid
    ? acceptedRuleset(payload)
    : rejectedRuleset('invalid-mechanics', 'Iron Arachne potion mechanics is invalid');
}

function validateSpell(payload: unknown): RulesetResult<unknown> {
  const record = asRecord(payload);
  const valid =
    record !== undefined &&
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    isFiniteNumber(record.magnitude) &&
    isFiniteNumber(record.difficulty);
  return valid
    ? acceptedRuleset(payload)
    : rejectedRuleset('invalid-mechanics', 'Iron Arachne spell mechanics is invalid');
}

function validateHoard(payload: unknown): RulesetResult<unknown> {
  const record = asRecord(payload);
  return record !== undefined && isFiniteNumber(record.targetValue)
    ? acceptedRuleset(payload)
    : rejectedRuleset('invalid-mechanics', 'Iron Arachne hoard mechanics is invalid');
}

function validate(
  subject: MechanicsSubject,
  payload: unknown,
  schemaVersion: number,
): RulesetResult<unknown> {
  if (schemaVersion !== 1) {
    return rejectedRuleset(
      'unsupported-version',
      `Iron Arachne ${subject} mechanics has no schema version ${schemaVersion}`,
    );
  }
  switch (subject) {
    case 'actor':
      return validateActor(payload);
    case 'item':
      return validateItem(payload);
    case 'potion':
      return validatePotion(payload);
    case 'spell':
      return validateSpell(payload);
    case 'hoard':
      return validateHoard(payload);
  }
}

function present(subject: MechanicsSubject, payload: unknown): MechanicsPresentation {
  const record = asRecord(payload) ?? {};
  switch (subject) {
    case 'actor':
      return { lines: [`${Array.isArray(record.actions) ? record.actions.length : 0} actions`] };
    case 'item':
      return { lines: [`Value: ${isFiniteNumber(record.value) ? record.value : 0}`] };
    case 'potion':
      return { lines: [String(asRecord(record.effect)?.name ?? 'Potion effect')] };
    case 'spell':
      return { title: String(record.name ?? 'Spell'), lines: [] };
    case 'hoard':
      return {
        lines: [`Target value: ${isFiniteNumber(record.targetValue) ? record.targetValue : 0}`],
      };
  }
}

export const IRONARACHNE_MECHANICS_CODEC: MechanicsCodec = {
  schemaVersion: () => 1,
  validate,
  migrate: (subject, _payload, fromVersion) =>
    rejectedRuleset(
      'unsupported-version',
      `Iron Arachne ${subject} mechanics has no migration from schema version ${fromVersion}`,
    ),
  present,
};

/** Qualifies a payload after the compatibility codec has accepted it. */
export function qualifyIronArachneMechanics(
  subject: MechanicsSubject,
  payload: IronArachneMechanicsPayload,
  origin: MechanicsOrigin = 'generated',
): RulesetResult<QualifiedMechanics> {
  const checked = IRONARACHNE_MECHANICS_CODEC.validate(subject, payload, 1);
  if (!checked.ok) {
    return checked;
  }
  return acceptedRuleset({
    ruleset: IRONARACHNE_RULESET_REF,
    subject,
    schemaVersion: 1,
    origin,
    sourceIds: [IRONARACHNE_ORIGINAL_SOURCE.id],
    payload: checked.value,
  });
}

export function emptyMechanicsSet(): MechanicsSet {
  return { variants: [] };
}
