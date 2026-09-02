import star from '$lib/assets/icons/set2/light-full.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { StarSystem } from './star_systems.js';
import type { StarSystemSnapshot } from './star_system_snapshot.js';

/**
 * Stable artifact kind id. Unqualified: a star system is neither a game system's nor a setting's,
 * per the kind table in docs/tool-readiness.md.
 */
export const STAR_SYSTEM_ARTIFACT_KIND = 'star-system' as const;

/** Version 1. The first shape a star system has been stored in. */
export const STAR_SYSTEM_PAYLOAD_VERSION = 1 as const;

/** The eleven numbers every astronomical body carries. */
const BODY_NUMBER_FIELDS = [
  'albedo',
  'axis_of_rotation',
  'gravity',
  'luminosity',
  'mass',
  'orbital_distance',
  'orbital_period',
  'radius',
  'rotation_period',
  'surface_pressure',
  'surface_temperature',
] as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * One astronomical body — a star or a planet.
 *
 * Every number is checked for being finite rather than merely being a number, for the reason the
 * planet kind gives: `NaN` is what a hand-edited payload produces from an emptied field, it passes
 * `typeof value === 'number'`, and it propagates silently through every figure derived from it.
 */
function validateBody(value: unknown, what: string): PayloadResult<unknown> {
  const body = asRecord(value);
  if (body === null) {
    return rejectedPayload('invalid-payload', `${what} is not an object`);
  }
  if (!hasStringFields(body, ['name', 'description', 'classification'])) {
    return rejectedPayload(
      'invalid-payload',
      `${what} needs a name, a description and a classification`,
    );
  }
  if (typeof body.has_atmosphere !== 'boolean' || typeof body.has_ring_system !== 'boolean') {
    return rejectedPayload(
      'invalid-payload',
      `${what} does not say whether it has an atmosphere and a ring system`,
    );
  }
  const missing = BODY_NUMBER_FIELDS.find((field) => !isFiniteNumber(body[field]));
  return missing === undefined
    ? acceptedPayload(body)
    : rejectedPayload('invalid-payload', `${what} has no usable ${missing}`);
}

function validateBodyList(value: unknown, what: string, each: string): PayloadResult<unknown> {
  if (!Array.isArray(value)) {
    return rejectedPayload('invalid-payload', `star system ${what} is not a list`);
  }
  return (
    value.map((body, index) => validateBody(body, `${each} ${index}`)).find((check) => !check.ok) ??
    acceptedPayload(value)
  );
}

/**
 * Checks the system's words and its two lists of bodies.
 *
 * A system with no planets is accepted: the user may have removed them, or every planet in it may
 * be a saved one the system references rather than owns. A system with no *stars* is accepted too,
 * which is stranger — but it is an editing decision rather than a broken payload, and 3.3 asks for
 * a well-defined empty result rather than a refusal. The presentation drops both sections when
 * they are empty.
 */
export function validateStarSystemSnapshot(payload: unknown): PayloadResult<StarSystemSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'star system payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'star system payload needs a name and a description');
  }

  const stars = validateBodyList(record.stars, 'stars', 'star system star');
  if (!stars.ok) {
    return stars as PayloadResult<StarSystemSnapshot>;
  }
  const planets = validateBodyList(record.planets, 'planets', 'star system planet');
  if (!planets.ok) {
    return planets as PayloadResult<StarSystemSnapshot>;
  }

  return acceptedPayload(record as unknown as StarSystemSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateStarSystemSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<StarSystemSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Star systems have no migration from payload version ${from}; version ${STAR_SYSTEM_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved system: its name, or the kind when the name has been emptied. */
function starSystemName(snapshot: StarSystemSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Star System' : `The ${name} System`;
}

/**
 * A star system as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading a system reaches nothing this module has not already loaded. Keeping the shape uniform is
 * worth more than saving one indirection, because the day this payload grows a part that *is*
 * heavy, the seam is already where it needs to be.
 */
export const starSystemArtifactKind = defineArtifactKind<StarSystem, StarSystemSnapshot>({
  kind: STAR_SYSTEM_ARTIFACT_KIND,
  displayName: 'Star System',
  icon: star,
  payloadVersion: STAR_SYSTEM_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toStarSystemSnapshot, starSystemFromSnapshotWithRng } =
      await import('./star_system_snapshot.js');
    return {
      toSnapshot: toStarSystemSnapshot,
      fromSnapshot: starSystemFromSnapshotWithRng,
    };
  },
  nameOf: starSystemName,
  validate: validateStarSystemSnapshot,
  migrate: migrateStarSystemSnapshot,
});
