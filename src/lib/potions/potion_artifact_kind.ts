import potion from '$lib/assets/icons/set2/potion-full.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
import type { Container } from '$lib/equipment';
import { validateMechanicsSet, withLegacyPotionMechanics } from '$lib/rulesets';

import type { PotionSnapshot, StoredPotionLiquid } from './potion_snapshot';
import type { PotionEffect, PotionModification, PotionSensoryProfile } from './potion_types';

/**
 * Stable artifact kind id. Unqualified: a potion is neither a game system's nor a setting's, per
 * the kind table in docs/tool-readiness.md.
 *
 * **Its own kind rather than a share of `item`**, which is decision 2 of docs/readiness-objects.md
 * and a correction to what this issue assumed. A `Potion` is a container, a liquid, an effect, a
 * sensory profile and a list of modifications; an `Item` is none of those below the first two.
 * Folding them together would produce one editor that is wrong for half of what it opens — the
 * item editor has no field for a duration or a flavour, and the potion editor has none for a
 * combat profile.
 */
export const POTION_ARTIFACT_KIND = 'potion' as const;

/** Version 2 adds ruleset-qualified mechanics while retaining transitional compatibility fields. */
export const POTION_PAYLOAD_VERSION = 2 as const;

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * The sensory profile, normalised.
 *
 * All four fields are prose a referee may clear, so an empty one is accepted; what is not accepted
 * is a missing one, because the sheet prints all four and `undefined` would print as the word.
 */
function readSensory(value: unknown): PotionSensoryProfile {
  const record = asRecord(value) ?? {};
  return {
    appearance: readText(record.appearance),
    viscosity: readText(record.viscosity),
    flavor: readText(record.flavor),
    scent: readText(record.scent),
  };
}

/**
 * The effect, normalised.
 *
 * `duration` and `parameters` are unions this build may not recognise — a payload written against a
 * catalog with a seventh parameter kind, say. Both are kept as they are rather than policed: the
 * presentation reads them defensively, and refusing a potion over a parameter nothing prints would
 * lose the whole artifact to save a line.
 */
function readEffect(value: unknown): PotionEffect | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.name !== 'string') {
    return undefined;
  }
  return {
    ...(record as unknown as PotionEffect),
    id: readText(record.id),
    name: record.name,
    description: readText(record.description),
    magnitude: readNumber(record.magnitude, 0),
  };
}

/** One modification. A tagged object with no recognisable tag is dropped rather than printed. */
function readModification(value: unknown): PotionModification | undefined {
  const record = asRecord(value);
  return record === null || typeof record.kind !== 'string'
    ? undefined
    : (record as unknown as PotionModification);
}

/**
 * Reads a stored potion, normalising rather than refusing wherever it honestly can.
 *
 * What is checked is what every reader depends on: a display name, a container and a liquid that
 * are objects, and an effect with a name. Everything else degrades — an unreadable modification is
 * dropped, a missing sensory field reads as empty prose, and a missing number reads as zero.
 *
 * An emptied display name is accepted, because a referee who has cleared it on the way to writing
 * their own has made an editing decision — 3.3 asks for a well-defined empty result, not a refusal.
 */
export function validatePotionSnapshot(payload: unknown): PayloadResult<PotionSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Potion payload is not an object');
  }
  if (typeof record.displayName !== 'string') {
    return rejectedPayload('invalid-payload', 'Potion payload has no usable displayName');
  }

  const container = asRecord(record.container);
  if (container === null || typeof container.name !== 'string') {
    return rejectedPayload('invalid-payload', 'Potion payload has no usable container');
  }

  const liquid = asRecord(record.liquid);
  if (liquid === null) {
    return rejectedPayload('invalid-payload', 'Potion payload has no usable liquid');
  }
  const containerMechanics = validateMechanicsSet(container.mechanics, 'item');
  if (!containerMechanics.ok) {
    return rejectedPayload(
      'invalid-payload',
      `Potion container has invalid mechanics: ${containerMechanics.message}`,
    );
  }
  const liquidMechanics = validateMechanicsSet(liquid.mechanics, 'item');
  if (!liquidMechanics.ok) {
    return rejectedPayload(
      'invalid-payload',
      `Potion liquid has invalid mechanics: ${liquidMechanics.message}`,
    );
  }

  const effect = readEffect(record.effect);
  if (effect === undefined) {
    return rejectedPayload('invalid-payload', 'Potion payload has no usable effect');
  }
  const mechanics = validateMechanicsSet(record.mechanics, 'potion');
  if (!mechanics.ok) {
    return rejectedPayload(
      'invalid-payload',
      `Potion payload has invalid mechanics: ${mechanics.message}`,
    );
  }

  return acceptedPayload({
    container: {
      ...(container as unknown as Container),
      name: container.name,
      description: readText(container.description),
      value: readNumber(container.value, 0),
      properties: isStringArray(container.properties) ? container.properties : [],
      contents: isStringArray(container.contents) ? container.contents : [],
      mechanics: containerMechanics.value,
    },
    liquid: {
      ...(liquid as unknown as StoredPotionLiquid),
      id: readText(liquid.id),
      description: readText(liquid.description),
      value: readNumber(liquid.value, 0),
      weight: readNumber(liquid.weight, 0),
      properties: isStringArray(liquid.properties) ? liquid.properties : [],
      mechanics: liquidMechanics.value,
    },
    displayName: record.displayName,
    ...(typeof record.canonicalName === 'string' && record.canonicalName !== ''
      ? { canonicalName: record.canonicalName }
      : {}),
    sensory: readSensory(record.sensory),
    effect,
    modifications: Array.isArray(record.modifications)
      ? record.modifications
          .map(readModification)
          .filter((modification): modification is PotionModification => modification !== undefined)
      : [],
    mechanics: mechanics.value,
  });
}

/** Copies potion mechanics and composes the item migration through its container and liquid. */
export function migratePotionSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<PotionSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `Potions have no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  return record === null
    ? rejectedPayload('invalid-payload', 'Potion payload is not an object')
    : validatePotionSnapshot(withLegacyPotionMechanics(record, 'migrated'));
}

/** What to call a saved potion: its display name, which is what the bottle's label would say. */
export function potionName(snapshot: PotionSnapshot): string {
  const name = snapshot.displayName.trim();
  if (name !== '') {
    return name;
  }
  const canonical = (snapshot.canonicalName ?? '').trim();
  return canonical === '' ? 'Potion' : canonical;
}

/**
 * A potion as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading a potion resolves nothing against the catalog, because a stored one already holds
 * everything it is.
 */
export const potionArtifactKind = defineArtifactKind<
  import('./potion_types').Potion,
  PotionSnapshot
>({
  kind: POTION_ARTIFACT_KIND,
  displayName: 'Potion',
  icon: potion,
  payloadVersion: POTION_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toPotionSnapshot, potionFromSnapshotWithRng } = await import('./potion_snapshot.js');
    return {
      toSnapshot: toPotionSnapshot,
      fromSnapshot: potionFromSnapshotWithRng,
    };
  },
  nameOf: potionName,
  validate: validatePotionSnapshot,
  migrate: migratePotionSnapshot,
});
