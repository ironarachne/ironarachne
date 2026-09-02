import cloud from '$lib/assets/icons/set3/cloud.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type Environment from './environment.js';
import type { EnvironmentSnapshot } from './environment_snapshot.js';

/**
 * Stable artifact kind id. Unqualified, and genre-neutral with it: an environment is a place, and
 * a place belongs to no ruleset and no setting. Per the kind table in docs/tool-readiness.md.
 */
export const ENVIRONMENT_ARTIFACT_KIND = 'environment' as const;

/** Version 1. The first shape an environment has been stored in. */
export const ENVIRONMENT_PAYLOAD_VERSION = 1 as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasNumberFields(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => isFiniteNumber(record[key]));
}

/** A direction across the surface: a list of finite numbers, however many components. */
function isNumberVector(value: unknown): value is number[] {
  return Array.isArray(value) && value.length > 0 && value.every(isFiniteNumber);
}

function validateBiome(value: unknown): PayloadResult<unknown> {
  const biome = asRecord(value);
  if (biome === null) {
    return rejectedPayload('invalid-payload', 'environment biome is not an object');
  }
  if (!hasStringFields(biome, ['name'])) {
    return rejectedPayload('invalid-payload', 'environment biome has no name');
  }
  if (!hasNumberFields(biome, ['temperature', 'altitude', 'humidity'])) {
    return rejectedPayload(
      'invalid-payload',
      'environment biome needs a temperature, an altitude and a humidity',
    );
  }
  if (typeof biome.isAquatic !== 'boolean') {
    return rejectedPayload('invalid-payload', 'environment biome does not say whether it is water');
  }
  if (!isStringArray(biome.descriptions) || !isStringArray(biome.features)) {
    return rejectedPayload(
      'invalid-payload',
      'environment biome descriptions and features are not lists of strings',
    );
  }
  return acceptedPayload(biome);
}

function validateSeason(value: unknown, index: number): PayloadResult<unknown> {
  const season = asRecord(value);
  if (season === null) {
    return rejectedPayload('invalid-payload', `environment season ${index} is not an object`);
  }
  if (!hasStringFields(season, ['name'])) {
    return rejectedPayload('invalid-payload', `environment season ${index} has no name`);
  }
  if (
    !hasNumberFields(season, ['startDay', 'endDay', 'temperatureAdjustment', 'humidityAdjustment'])
  ) {
    return rejectedPayload(
      'invalid-payload',
      `environment season ${index} has a non-numeric day or adjustment`,
    );
  }
  return acceptedPayload(season);
}

function validateClimate(value: unknown): PayloadResult<unknown> {
  const climate = asRecord(value);
  if (climate === null) {
    return rejectedPayload('invalid-payload', 'environment climate is not an object');
  }
  if (!hasStringFields(climate, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'environment climate needs a name and a description');
  }
  if (
    !hasNumberFields(climate, [
      'cloudCover',
      'temperature',
      'temperatureMin',
      'temperatureMax',
      'precipitationAmount',
      'precipitationFrequency',
      'humidity',
    ])
  ) {
    return rejectedPayload('invalid-payload', 'environment climate has a non-numeric measurement');
  }
  if (!isNumberVector(climate.wind)) {
    return rejectedPayload('invalid-payload', 'environment climate wind is not a vector');
  }
  if (!Array.isArray(climate.seasons)) {
    return rejectedPayload('invalid-payload', 'environment climate seasons is not a list');
  }
  return climate.seasons.map(validateSeason).find((check) => !check.ok) ?? acceptedPayload(climate);
}

function validateTerrain(value: unknown): PayloadResult<unknown> {
  const terrain = asRecord(value);
  if (terrain === null) {
    return rejectedPayload('invalid-payload', 'environment terrain is not an object');
  }
  if (!hasNumberFields(terrain, ['elevationMin', 'elevationMax', 'reliefEnergy'])) {
    return rejectedPayload(
      'invalid-payload',
      'environment terrain needs an elevation range and a relief energy',
    );
  }
  if (!isNumberVector(terrain.normalVector)) {
    return rejectedPayload('invalid-payload', 'environment terrain slope is not a vector');
  }
  if (!isStringArray(terrain.landforms)) {
    return rejectedPayload('invalid-payload', 'environment terrain landforms is not a list');
  }
  const makeup = asRecord(terrain.geologicalMakeup);
  if (makeup === null) {
    return rejectedPayload('invalid-payload', 'environment terrain has no geological makeup');
  }
  if (!isStringArray(makeup.soilTypes) || !isStringArray(makeup.rockTypes)) {
    return rejectedPayload(
      'invalid-payload',
      'environment geological makeup soils and rocks are not lists of strings',
    );
  }
  return acceptedPayload(terrain);
}

function validateWaterSystem(value: unknown): PayloadResult<unknown> {
  const water = asRecord(value);
  if (water === null) {
    return rejectedPayload('invalid-payload', 'environment water system is not an object');
  }
  if (!hasStringFields(water, ['waterType'])) {
    return rejectedPayload('invalid-payload', 'environment water system has no water type');
  }
  if (!hasNumberFields(water, ['surfaceLevel', 'temperature'])) {
    return rejectedPayload(
      'invalid-payload',
      'environment water system needs a surface level and a temperature',
    );
  }
  if (!isNumberVector(water.current)) {
    return rejectedPayload('invalid-payload', 'environment water current is not a vector');
  }
  return acceptedPayload(water);
}

/**
 * One ecosystem.
 *
 * Every field may be empty, and today every one of them is: `Ecosystems.generate` is a documented
 * stub returning a nameless ecosystem with no flora and no fauna. Rejecting an empty ecosystem
 * would reject every environment this build has ever made.
 */
function validateEcosystem(value: unknown, index: number): PayloadResult<unknown> {
  const ecosystem = asRecord(value);
  if (ecosystem === null) {
    return rejectedPayload('invalid-payload', `environment ecosystem ${index} is not an object`);
  }
  if (!hasStringFields(ecosystem, ['name', 'description'])) {
    return rejectedPayload(
      'invalid-payload',
      `environment ecosystem ${index} needs a name and a description`,
    );
  }
  if (!isStringArray(ecosystem.flora) || !isStringArray(ecosystem.fauna)) {
    return rejectedPayload(
      'invalid-payload',
      `environment ecosystem ${index} flora and fauna are not lists of strings`,
    );
  }
  return acceptedPayload(ecosystem);
}

/**
 * Checks the five parts an environment is made of, and its own description.
 *
 * An environment with no ecosystems is accepted, and reads back with the empty one the generator
 * itself produces. A description that has been emptied is accepted too: a user who has deleted the
 * paragraph has made an editing decision, and a payload that fails its own validator is a broken
 * artifact rather than an edited one — 3.3 asks for a well-defined empty result, not a refusal.
 */
export function validateEnvironmentSnapshot(payload: unknown): PayloadResult<EnvironmentSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'environment payload is not an object');
  }
  if (typeof record.description !== 'string') {
    return rejectedPayload('invalid-payload', 'environment payload needs a description');
  }
  if (!Array.isArray(record.ecosystems)) {
    return rejectedPayload('invalid-payload', 'environment ecosystems is not a list');
  }

  const checks = [
    validateBiome(record.biome),
    validateClimate(record.climate),
    validateTerrain(record.terrain),
    validateWaterSystem(record.waterSystem),
    ...record.ecosystems.map(validateEcosystem),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<EnvironmentSnapshot>;
  }

  return acceptedPayload(record as unknown as EnvironmentSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateEnvironmentSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<EnvironmentSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Environments have no migration from payload version ${from}; version ${ENVIRONMENT_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a saved environment: its biome and climate, which is how a person refers to one.
 *
 * An environment has no name of its own — it is a description of a place rather than a named
 * thing — so "temperate deciduous forest, humid subtropical" is the honest default, and the user
 * renames the artifact on save. Either half being empty falls back to the other, and both being
 * empty falls back to the kind.
 */
function environmentName(snapshot: EnvironmentSnapshot): string {
  const parts = [snapshot.biome.name, snapshot.climate.name]
    .map((part) => part.trim())
    .filter((part) => part !== '');
  return parts.length === 0 ? 'Environment' : parts.join(', ');
}

/**
 * An environment as an artifact.
 *
 * The codec is a dynamic import for consistency with every other kind rather than for weight:
 * reading an environment reaches nothing this module has not already loaded. Keeping the shape
 * uniform is worth more than saving one indirection, because the day this payload grows a part
 * that *is* heavy, the seam is already where it needs to be.
 */
export const environmentArtifactKind = defineArtifactKind<Environment, EnvironmentSnapshot>({
  kind: ENVIRONMENT_ARTIFACT_KIND,
  displayName: 'Environment',
  icon: cloud,
  payloadVersion: ENVIRONMENT_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { toEnvironmentSnapshot, environmentFromSnapshotWithRng } =
      await import('./environment_snapshot.js');
    return {
      toSnapshot: toEnvironmentSnapshot,
      fromSnapshot: environmentFromSnapshotWithRng,
    };
  },
  nameOf: environmentName,
  validate: validateEnvironmentSnapshot,
  migrate: migrateEnvironmentSnapshot,
});
