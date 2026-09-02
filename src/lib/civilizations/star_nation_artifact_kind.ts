import star from '$lib/assets/icons/set1/star.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import {
  STAR_NATION_FALLBACK_NAME,
  STAR_NATION_MILITARY_QUALITY_RANGE,
  STAR_NATION_TECHNOLOGY_LEVEL_RANGE,
} from './star_nation';
import type { StarNationSnapshot } from './star_nation_snapshot';
import type { StarNation } from './star_nation_types';

/**
 * Stable artifact kind id.
 *
 * Its own kind rather than a discriminator on `organization`, which is the question issue #57
 * asks. A star nation holds territory — regions of control and a home system — and an
 * organization holds a roster and a hierarchy; the two share a name field and nothing else, so one
 * kind would be one validator and one migration path over two shapes. Unqualified, because it is
 * neither a game system nor a setting.
 */
export const STAR_NATION_ARTIFACT_KIND = 'star-nation' as const;

/** Version 1. The first shape a star nation has been stored in. */
export const STAR_NATION_PAYLOAD_VERSION = 1 as const;

/** Every numeric field of an `AstronomicalBody`, which is what the preview renderer reads. */
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
];

function hasNumberFields(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof record[key] === 'number' && Number.isFinite(record[key]));
}

function isIntegerWithin(value: unknown, [min, max]: [number, number]): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/** A count: a whole number, zero or more. */
function isCount(value: unknown): boolean {
  return isIntegerWithin(value, [0, Number.MAX_SAFE_INTEGER]);
}

function hasBooleanFields(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof record[key] === 'boolean');
}

function isStoredBody(entry: unknown): boolean {
  const body = asRecord(entry);
  return (
    body !== null &&
    hasStringFields(body, ['name', 'description', 'classification']) &&
    hasNumberFields(body, BODY_NUMBER_FIELDS) &&
    hasBooleanFields(body, ['has_atmosphere', 'has_ring_system'])
  );
}

function isStoredStarSystem(entry: unknown): boolean {
  const system = asRecord(entry);
  return (
    system !== null &&
    hasStringFields(system, ['name', 'description']) &&
    hasNumberFields(system, ['star_count', 'planet_count']) &&
    Array.isArray(system.stars) &&
    system.stars.every(isStoredBody) &&
    Array.isArray(system.planets) &&
    system.planets.every(isStoredBody)
  );
}

function isStoredRegionType(entry: unknown): boolean {
  const type = asRecord(entry);
  return (
    type !== null &&
    hasStringFields(type, ['name', 'description']) &&
    hasNumberFields(type, [
      'scale',
      'population_capacity',
      'technology_level_requirement',
      'commonality',
    ])
  );
}

function isStoredRegion(entry: unknown): boolean {
  const region = asRecord(entry);
  return (
    region !== null &&
    hasStringFields(region, ['name', 'description', 'controlling_civilization']) &&
    hasNumberFields(region, ['population']) &&
    isStoredRegionType(region.region_type)
  );
}

function isStoredGovernmentType(entry: unknown): boolean {
  const type = asRecord(entry);
  return (
    type !== null &&
    hasStringFields(type, ['name', 'adjective', 'description']) &&
    isStringArray(type.name_options) &&
    hasNumberFields(type, ['commonality'])
  );
}

function isStoredEconomyType(entry: unknown): boolean {
  const type = asRecord(entry);
  return (
    type !== null &&
    hasStringFields(type, ['name', 'adjective', 'description']) &&
    hasNumberFields(type, ['commonality'])
  );
}

/** The military's four figures. Quality indexes a ten-entry table, so it must be 1–10. */
function isStoredMilitary(entry: unknown): boolean {
  const military = asRecord(entry);
  return (
    military !== null &&
    hasNumberFields(military, ['quality', 'size', 'equipment_level', 'training_level']) &&
    isIntegerWithin(military.quality, STAR_NATION_MILITARY_QUALITY_RANGE)
  );
}

/**
 * Checks what reading depends on: the civilization's fields, its two table rows, the regions, and
 * a home system whose bodies the renderer can draw, with a home planet inside it.
 *
 * An empty name and an empty description are accepted, and so is an empty region list: a user who
 * has cleared them has made an editing decision, and 3.3 asks for a well-defined empty result
 * rather than a refusal. The technology level is checked against the table's own range because
 * the page looks its name up, and a level with no row would throw where a blank should print; the
 * counts are checked as whole numbers because the prose prints them as such.
 */
export function validateStarNationSnapshot(payload: unknown): PayloadResult<StarNationSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'Star nation payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'Star nation payload needs a name and a description');
  }
  if (
    !hasNumberFields(record, ['population']) ||
    !['homeSystemPopulatedPlanets', 'systemsControlled', 'populatedPlanets'].every((field) =>
      isCount(record[field]),
    )
  ) {
    return rejectedPayload(
      'invalid-payload',
      'Star nation payload needs a population and whole-number planet and system counts',
    );
  }
  if (!isIntegerWithin(record.technologyLevel, STAR_NATION_TECHNOLOGY_LEVEL_RANGE)) {
    return rejectedPayload(
      'invalid-payload',
      `Star nation payload needs a technology level between ${STAR_NATION_TECHNOLOGY_LEVEL_RANGE[0]} and ${STAR_NATION_TECHNOLOGY_LEVEL_RANGE[1]}`,
    );
  }
  if (!isStoredGovernmentType(record.governmentType) || !isStoredEconomyType(record.economyType)) {
    return rejectedPayload(
      'invalid-payload',
      'Star nation payload needs a government type and an economy type',
    );
  }
  if (!isStoredMilitary(record.military)) {
    return rejectedPayload(
      'invalid-payload',
      'Star nation payload needs a military with a quality from 1 to 10, a size, an equipment level and a training level',
    );
  }
  if (!Array.isArray(record.regionsOfControl) || !record.regionsOfControl.every(isStoredRegion)) {
    return rejectedPayload(
      'invalid-payload',
      'Star nation payload needs a list of regions of control, each with a region type and a population',
    );
  }
  if (!isStoredStarSystem(record.homeSystem)) {
    return rejectedPayload(
      'invalid-payload',
      'Star nation payload needs a home system whose stars and planets each carry every parameter the preview draws from',
    );
  }
  const planets = (record.homeSystem as { planets: unknown[] }).planets;
  if (
    !Number.isInteger(record.homePlanetIndex) ||
    (record.homePlanetIndex as number) < 0 ||
    (record.homePlanetIndex as number) >= planets.length
  ) {
    return rejectedPayload(
      'invalid-payload',
      'Star nation payload needs a home planet that is one of the home system’s planets',
    );
  }

  return acceptedPayload(record as unknown as StarNationSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day
 * the shape changes. #11 proposes adding setting flavour to a civilization; when it lands, the
 * step from 1 to 2 belongs here and is additive.
 */
export function migrateStarNationSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<StarNationSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Star nations have no migration from payload version ${from}; version ${STAR_NATION_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved nation: its name, or the kind when the name has been emptied. */
function starNationName(snapshot: StarNationSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? STAR_NATION_FALLBACK_NAME : name;
}

/**
 * A star nation as an artifact.
 *
 * The codec is deferred like every other kind's, so that listing a project costs the metadata
 * and the validator alone.
 */
export const starNationArtifactKind = defineArtifactKind<StarNation, StarNationSnapshot>({
  kind: STAR_NATION_ARTIFACT_KIND,
  displayName: 'Star Nation',
  icon: star,
  payloadVersion: STAR_NATION_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toStarNationSnapshot, starNationFromSnapshotWithRng } =
      await import('./star_nation_snapshot.js');
    return {
      toSnapshot: toStarNationSnapshot,
      fromSnapshot: starNationFromSnapshotWithRng,
    };
  },
  nameOf: starNationName,
  validate: validateStarNationSnapshot,
  migrate: migrateStarNationSnapshot,
});
