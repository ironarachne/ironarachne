import { IRONARACHNE_RULESET_REF } from './ironarachne/descriptor.js';
import { IRONARACHNE_ORIGINAL_SOURCE } from './ironarachne/source_manifest.js';
import type {
  MechanicsOrigin,
  MechanicsSet,
  MechanicsSubject,
  QualifiedMechanics,
} from './ruleset_types.js';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;
}

function optionalFields(record: UnknownRecord, fields: readonly string[]): UnknownRecord {
  return Object.fromEntries(
    fields.filter((field) => record[field] !== undefined).map((field) => [field, record[field]]),
  );
}

function existingVariants(record: UnknownRecord): unknown[] {
  const mechanics = asRecord(record.mechanics);
  return Array.isArray(mechanics?.variants) ? mechanics.variants : [];
}

function withVariant<T extends object>(
  record: T,
  subject: MechanicsSubject,
  payload: unknown,
  origin: MechanicsOrigin,
): T & { mechanics: MechanicsSet } {
  const source = record as UnknownRecord;
  const variants = existingVariants(source);
  const alreadyQualified = variants.some((variant) => {
    const candidate = asRecord(variant);
    const ref = asRecord(candidate?.ruleset);
    return (
      ref?.id === IRONARACHNE_RULESET_REF.id && ref.release === IRONARACHNE_RULESET_REF.release
    );
  });
  const compatibility: QualifiedMechanics = {
    ruleset: IRONARACHNE_RULESET_REF,
    subject,
    schemaVersion: 1,
    origin,
    sourceIds: [IRONARACHNE_ORIGINAL_SOURCE.id],
    payload,
  };

  return {
    ...record,
    mechanics: {
      variants: (alreadyQualified
        ? [...variants]
        : [...variants, compatibility]) as QualifiedMechanics[],
    },
  };
}

/** Copies an old common item's mechanics into an Iron Arachne variant without recomputing them. */
export function withLegacyItemMechanics<T extends object>(
  record: T,
  origin: MechanicsOrigin,
): T & { mechanics: MechanicsSet } {
  const source = record as UnknownRecord;
  return withVariant(
    record,
    'item',
    {
      value: source.value,
      ...optionalFields(source, ['combatProfile', 'actions', 'enchantment']),
    },
    origin,
  );
}

/** Copies an old common potion's effect, modifications, and liquid value without recomputation. */
export function withLegacyPotionMechanics<T extends object>(
  record: T,
  origin: MechanicsOrigin,
): T & { mechanics: MechanicsSet } {
  const source = record as UnknownRecord;
  const container = asRecord(source.container);
  const liquid = asRecord(source.liquid);
  const qualified = {
    ...record,
    ...(container === undefined ? {} : { container: withLegacyItemMechanics(container, origin) }),
    ...(liquid === undefined ? {} : { liquid: withLegacyItemMechanics(liquid, origin) }),
  };
  return withVariant(
    qualified,
    'potion',
    {
      effect: source.effect,
      modifications: source.modifications,
      ...(liquid?.value === undefined ? {} : { value: liquid.value }),
    },
    origin,
  );
}

/** Copies an old common actor and its embedded archetype mechanics without recomputation. */
export function withLegacyActorMechanics<T extends object>(
  record: T,
  origin: MechanicsOrigin,
): T & { mechanics: MechanicsSet } {
  const source = record as UnknownRecord;
  const archetype = asRecord(source.archetype);
  const qualified = {
    ...record,
    ...(Array.isArray(source.carried)
      ? {
          carried: source.carried.map((item) => {
            const storedItem = asRecord(item);
            return storedItem === undefined ? item : withLegacyItemMechanics(storedItem, origin);
          }),
        }
      : {}),
  };
  return withVariant(
    qualified,
    'actor',
    {
      combatProfile: source.combatProfile,
      actions: source.actions,
      ...(archetype?.casterProfile === undefined ? {} : { casterProfile: archetype.casterProfile }),
      ...(archetype === undefined
        ? {}
        : {
            archetype: optionalFields(archetype, ['basePowerModifier', 'actions', 'casterProfile']),
          }),
    },
    origin,
  );
}

/** Copies an old common hoard's target value without recomputation. */
export function withLegacyHoardMechanics<T extends object>(
  record: T,
  origin: MechanicsOrigin,
): T & { mechanics: MechanicsSet } {
  return withVariant(
    record,
    'hoard',
    { targetValue: (record as UnknownRecord).targetValue },
    origin,
  );
}
