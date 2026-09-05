import type { RNG } from '@ironarachne/rng';

import {
  findRulesDataSource,
  findRulesetDescriptor,
  findRulesetLoader,
  sameRulesetRef,
} from './ruleset_catalog';
import { acceptedRuleset, rejectedRuleset } from './ruleset_results';
import {
  MECHANICS_ORIGINS,
  MECHANICS_SUBJECTS,
  RULESET_IDS,
  type MechanicsOrigin,
  type MechanicsSet,
  type MechanicsSubject,
  type QualifiedMechanics,
  type RulesDataSource,
  type RulesNeutralItem,
  type RulesetDefinition,
  type RulesetId,
  type RulesetRef,
  type RulesetResult,
} from './ruleset_types';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isRulesetId(value: unknown): value is RulesetId {
  return typeof value === 'string' && (RULESET_IDS as readonly string[]).includes(value);
}

function isMechanicsSubject(value: unknown): value is MechanicsSubject {
  return typeof value === 'string' && (MECHANICS_SUBJECTS as readonly string[]).includes(value);
}

function isMechanicsOrigin(value: unknown): value is MechanicsOrigin {
  return typeof value === 'string' && (MECHANICS_ORIGINS as readonly string[]).includes(value);
}

/** A durable ref this build has registered, copied across the runtime boundary. */
export function validateRulesetRef(value: unknown): RulesetResult<RulesetRef> {
  const record = asRecord(value);
  if (record === undefined || !isRulesetId(record.id)) {
    return rejectedRuleset('unknown-ruleset', 'mechanics names no supported ruleset id');
  }
  if (typeof record.release !== 'string' || record.release.trim() === '') {
    return rejectedRuleset('unknown-release', 'mechanics names no ruleset release');
  }

  const ref = { id: record.id, release: record.release };
  if (findRulesetDescriptor(ref) === undefined) {
    return rejectedRuleset(
      'unknown-release',
      `no ruleset release registered as "${ref.id}@${ref.release}"`,
    );
  }
  return acceptedRuleset(ref);
}

export async function getRuleset(ref: RulesetRef): Promise<RulesetResult<RulesetDefinition>> {
  const checked = validateRulesetRef(ref);
  if (!checked.ok) {
    return checked;
  }

  const load = findRulesetLoader(checked.value);
  if (load === undefined) {
    return rejectedRuleset(
      'unknown-release',
      `no ruleset release registered as "${ref.id}@${ref.release}"`,
    );
  }

  let definition: RulesetDefinition;
  try {
    definition = await load();
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : '';
    return rejectedRuleset(
      'ruleset-load-failed',
      `could not load ruleset "${ref.id}@${ref.release}"${detail}`,
    );
  }
  if (!sameRulesetRef(definition.descriptor.ref, checked.value)) {
    return rejectedRuleset(
      'invalid-mechanics',
      `ruleset loader for "${ref.id}@${ref.release}" returned a different release`,
    );
  }
  return acceptedRuleset(definition);
}

export function validateQualifiedMechanics(value: unknown): RulesetResult<QualifiedMechanics> {
  const record = asRecord(value);
  if (record === undefined) {
    return rejectedRuleset('invalid-mechanics', 'qualified mechanics is not an object');
  }

  const ruleset = validateRulesetRef(record.ruleset);
  if (!ruleset.ok) {
    return ruleset;
  }
  if (!isMechanicsSubject(record.subject)) {
    return rejectedRuleset('invalid-mechanics', 'qualified mechanics has no known subject');
  }
  if (!Number.isInteger(record.schemaVersion) || (record.schemaVersion as number) < 1) {
    return rejectedRuleset(
      'unsupported-version',
      'mechanics schema version must be a positive integer',
    );
  }
  if (!isMechanicsOrigin(record.origin)) {
    return rejectedRuleset('invalid-mechanics', 'qualified mechanics has no known origin');
  }
  if (!isStringArray(record.sourceIds)) {
    return rejectedRuleset('invalid-mechanics', 'qualified mechanics source ids are not strings');
  }
  const unknownSource = record.sourceIds.find((id) => findRulesDataSource(id) === undefined);
  if (unknownSource !== undefined) {
    return rejectedRuleset(
      'unknown-source',
      `no rules data source registered as "${unknownSource}"`,
    );
  }
  if (!Object.hasOwn(record, 'payload')) {
    return rejectedRuleset('invalid-mechanics', 'qualified mechanics has no payload');
  }

  return acceptedRuleset({
    ruleset: ruleset.value,
    subject: record.subject,
    schemaVersion: record.schemaVersion as number,
    origin: record.origin,
    sourceIds: [...record.sourceIds],
    payload: record.payload,
  });
}

/** Validates a mechanics collection without discarding unknown or malformed stored data. */
export function validateMechanicsSet(
  value: unknown,
  subject?: MechanicsSubject,
): RulesetResult<MechanicsSet> {
  const record = asRecord(value);
  if (record === undefined || !Array.isArray(record.variants)) {
    return rejectedRuleset('invalid-mechanics', 'mechanics set has no variant list');
  }

  const variants: QualifiedMechanics[] = [];
  for (const candidate of record.variants) {
    const checked = validateQualifiedMechanics(candidate);
    if (!checked.ok) {
      return checked;
    }
    if (subject !== undefined && checked.value.subject !== subject) {
      return rejectedRuleset(
        'invalid-mechanics',
        `${subject} mechanics contains a ${checked.value.subject} variant`,
      );
    }
    if (variants.some((current) => sameRulesetRef(current.ruleset, checked.value.ruleset))) {
      return rejectedRuleset(
        'variant-conflict',
        `mechanics contains more than one "${checked.value.ruleset.id}@${checked.value.ruleset.release}" variant`,
      );
    }
    variants.push(checked.value);
  }

  return acceptedRuleset({ variants });
}

export function addMechanicsVariant(
  set: Readonly<MechanicsSet>,
  variant: QualifiedMechanics,
): RulesetResult<MechanicsSet> {
  const checked = validateQualifiedMechanics(variant);
  if (!checked.ok) {
    return checked;
  }
  if (set.variants.some((current) => sameRulesetRef(current.ruleset, checked.value.ruleset))) {
    return rejectedRuleset(
      'variant-conflict',
      `mechanics already contains "${variant.ruleset.id}@${variant.ruleset.release}"`,
    );
  }
  return acceptedRuleset({ variants: [...set.variants, checked.value] });
}

export function mechanicsFor(
  set: Readonly<MechanicsSet>,
  ref: RulesetRef,
): QualifiedMechanics | undefined {
  return set.variants.find((variant) => sameRulesetRef(variant.ruleset, ref));
}

export async function migrateQualifiedMechanics(
  value: QualifiedMechanics,
): Promise<RulesetResult<QualifiedMechanics>> {
  const checked = validateQualifiedMechanics(value);
  if (!checked.ok) {
    return checked;
  }
  const resolved = await getRuleset(checked.value.ruleset);
  if (!resolved.ok) {
    return resolved;
  }
  const codec = resolved.value.mechanics;
  if (codec === undefined) {
    return rejectedRuleset(
      'unsupported-capability',
      `ruleset "${value.ruleset.id}@${value.ruleset.release}" has no mechanics codec`,
    );
  }

  const current = codec.schemaVersion(checked.value.subject);
  if (current === undefined) {
    return rejectedRuleset(
      'unsupported-capability',
      `ruleset does not support ${checked.value.subject} mechanics`,
    );
  }
  if (checked.value.schemaVersion > current) {
    return rejectedRuleset(
      'unsupported-version',
      `mechanics schema version ${checked.value.schemaVersion} is newer than ${current}`,
    );
  }

  const payload =
    checked.value.schemaVersion === current
      ? codec.validate(checked.value.subject, checked.value.payload, current)
      : codec.migrate(checked.value.subject, checked.value.payload, checked.value.schemaVersion);
  if (!payload.ok) {
    return payload;
  }

  return acceptedRuleset({ ...checked.value, schemaVersion: current, payload: payload.value });
}

export async function deriveTreasureItemMechanics<TContext>(
  target: RulesetRef,
  item: Readonly<RulesNeutralItem>,
  existing: Readonly<MechanicsSet>,
  context: TContext,
  rng: RNG,
): Promise<RulesetResult<QualifiedMechanics>> {
  if (mechanicsFor(existing, target) !== undefined) {
    return rejectedRuleset(
      'variant-conflict',
      `mechanics already contains "${target.id}@${target.release}"`,
    );
  }
  const resolved = await getRuleset(target);
  if (!resolved.ok) {
    return resolved;
  }
  if (resolved.value.treasureItems === undefined) {
    return rejectedRuleset(
      'unsupported-capability',
      `ruleset "${target.id}@${target.release}" cannot derive treasure item mechanics`,
    );
  }
  return resolved.value.treasureItems.derive(item, existing, context, rng);
}

export function rulesetNotices(refs: readonly RulesetRef[]): RulesetResult<RulesDataSource[]> {
  const sourceIds: string[] = [];
  for (const ref of refs) {
    const descriptor = findRulesetDescriptor(ref);
    if (descriptor === undefined) {
      return rejectedRuleset(
        'unknown-release',
        `no ruleset release registered as "${ref.id}@${ref.release}"`,
      );
    }
    for (const sourceId of descriptor.sourceIds) {
      if (!sourceIds.includes(sourceId)) {
        sourceIds.push(sourceId);
      }
    }
  }

  const sources: RulesDataSource[] = [];
  for (const sourceId of sourceIds) {
    const source = findRulesDataSource(sourceId);
    if (source === undefined) {
      return rejectedRuleset('unknown-source', `no rules data source registered as "${sourceId}"`);
    }
    sources.push({ ...source, grant: { ...source.grant } });
  }
  return acceptedRuleset(sources);
}
