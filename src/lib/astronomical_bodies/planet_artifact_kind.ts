// A banded sphere, which is the closest thing the icon set has to a planet. Named for a basketball
// in the set it came from; at 24px it reads as a world with lines of latitude on it.
import sphere from '$lib/assets/icons/set3/ball-basketball.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { PlanetRoll } from './planet_roll.js';
import type { PlanetSnapshot } from './planet_snapshot.js';

/**
 * Stable artifact kind id. Unqualified: a planet is neither a game system's nor a setting's, per
 * the kind table in docs/tool-readiness.md.
 */
export const PLANET_ARTIFACT_KIND = 'planet' as const;

/** Version 1. The first shape a planet has been stored in. */
export const PLANET_PAYLOAD_VERSION = 1 as const;

/** The fifteen numbers every astronomical body carries. */
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
 * One astronomical body — the planet itself, or one of its moons.
 *
 * Every number is checked for being finite rather than merely being a number. `NaN` is what a
 * hand-edited payload produces from an emptied field, it passes `typeof value === 'number'`, and it
 * propagates silently through every derived figure the page prints.
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
  if (missing !== undefined) {
    return rejectedPayload('invalid-payload', `${what} has no usable ${missing}`);
  }
  return acceptedPayload(body);
}

function validateNamedRecord(value: unknown, what: string): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null) {
    return rejectedPayload('invalid-payload', `${what} is not an object`);
  }
  if (!hasStringFields(record, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', `${what} needs a name and a description`);
  }
  return acceptedPayload(record);
}

/**
 * The civilization on a planet, when there is one.
 *
 * Its government, economy and military are checked because the page prints all three; a
 * civilization whose government is missing would render a blank stat rather than fail, which is the
 * kind of quiet hole a validator exists to turn into a loud one.
 */
function validateCivilization(value: unknown): PayloadResult<unknown> {
  const civilization = asRecord(value);
  if (civilization === null) {
    return rejectedPayload('invalid-payload', 'planet civilization is not an object');
  }
  if (!hasStringFields(civilization, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'planet civilization needs a name and a description');
  }
  if (!isFiniteNumber(civilization.population) || !isFiniteNumber(civilization.technology_level)) {
    return rejectedPayload(
      'invalid-payload',
      'planet civilization needs a population and a technology level',
    );
  }

  const government = validateNamedRecord(civilization.government_type, 'planet government');
  if (!government.ok) {
    return government;
  }
  if (!isStringArray((asRecord(civilization.government_type) ?? {}).name_options)) {
    return rejectedPayload('invalid-payload', 'planet government name options is not a list');
  }

  const economy = validateNamedRecord(civilization.economy_type, 'planet economy');
  if (!economy.ok) {
    return economy;
  }

  const military = asRecord(civilization.military);
  if (military === null) {
    return rejectedPayload('invalid-payload', 'planet civilization has no military');
  }
  const missing = (['quality', 'size', 'equipment_level', 'training_level'] as const).find(
    (field) => !isFiniteNumber(military[field]),
  );
  return missing === undefined
    ? acceptedPayload(civilization)
    : rejectedPayload('invalid-payload', `planet military has no usable ${missing}`);
}

/**
 * Checks the planet's own parameters, its moons, and any civilization on it.
 *
 * A planet with no moons and nobody on it is the ordinary case, not an empty one, and a user who
 * has deleted the last moon has made an editing decision — 3.3 asks for a well-defined empty
 * result, not a refusal.
 */
export function validatePlanetSnapshot(payload: unknown): PayloadResult<PlanetSnapshot> {
  const body = validateBody(payload, 'planet');
  if (!body.ok) {
    return body as PayloadResult<PlanetSnapshot>;
  }

  const record = asRecord(payload) as Record<string, unknown>;
  if (!Array.isArray(record.moons)) {
    return rejectedPayload('invalid-payload', 'planet moons is not a list');
  }
  const badMoon = record.moons
    .map((moon, index) => validateBody(moon, `planet moon ${index}`))
    .find((check) => !check.ok);
  if (badMoon !== undefined) {
    return badMoon as PayloadResult<PlanetSnapshot>;
  }

  if (record.civilization !== undefined) {
    const civilization = validateCivilization(record.civilization);
    if (!civilization.ok) {
      return civilization as PayloadResult<PlanetSnapshot>;
    }
  }

  return acceptedPayload(record as unknown as PlanetSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migratePlanetSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<PlanetSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Planets have no migration from payload version ${from}; version ${PLANET_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved planet: its name, or the kind when the name has been emptied. */
function planetName(snapshot: PlanetSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Planet' : name;
}

/**
 * A planet as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading a planet reaches nothing this module has not already loaded. Keeping the shape uniform is
 * worth more than saving one indirection, because the day this payload grows a part that *is*
 * heavy, the seam is already where it needs to be.
 */
export const planetArtifactKind = defineArtifactKind<PlanetRoll, PlanetSnapshot>({
  kind: PLANET_ARTIFACT_KIND,
  displayName: 'Planet',
  icon: sphere,
  payloadVersion: PLANET_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toPlanetSnapshot, planetFromSnapshotWithRng } = await import('./planet_snapshot.js');
    return {
      toSnapshot: toPlanetSnapshot,
      fromSnapshot: planetFromSnapshotWithRng,
    };
  },
  nameOf: planetName,
  validate: validatePlanetSnapshot,
  migrate: migratePlanetSnapshot,
});
