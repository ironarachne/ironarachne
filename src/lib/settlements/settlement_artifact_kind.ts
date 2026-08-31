import house from '$lib/assets/icons/set1/house.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { SettlementSnapshot } from './settlement_snapshot';
import type { Settlement } from './settlement_types';

/**
 * Stable artifact kind id. A settlement is system-neutral — the same populated place serves any
 * ruleset — so there is one kind covering every use of it, per decision 4 of docs/workshop.md.
 */
export const SETTLEMENT_ARTIFACT_KIND = 'settlement' as const;

/**
 * Version 2: a notable's character stores `speciesName` where version 1 embedded a whole `Species`.
 *
 * The site's first real payload step, and it exists because `StoredCharacter` moved to
 * `$lib/characters` for #46 — one shape in the library that owns the concept, rather than two types
 * with one name drifting apart. The shape change is not free: a settlement written by an older
 * build carries the embedded record, and reading it as a version 2 payload would leave every
 * notable without a species. {@link migrateSettlementSnapshot} is what stops that.
 *
 * It also drops a whole `Species` record per notable, which was the bulk of what a stored notable
 * was.
 */
export const SETTLEMENT_PAYLOAD_VERSION = 2 as const;

const SETTLEMENT_STRING_FIELDS = ['name', 'description', 'economicRole'];

const SETTLEMENT_NUMBER_FIELDS = [
  'population',
  'prosperity',
  'lawAndOrder',
  'commerce',
  'foodSecurity',
  'publicHealth',
];

const CATEGORY_NUMBER_FIELDS = ['minSize', 'maxSize'];

function hasNumberFields(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => Number.isFinite(record[key]));
}

function validateSettlementCategory(value: unknown): PayloadResult<unknown> {
  const category = asRecord(value);
  if (category === null) {
    return rejectedPayload('invalid-payload', 'settlement category is not an object');
  }
  if (!hasStringFields(category, ['name', 'sizeClass'])) {
    return rejectedPayload(
      'invalid-payload',
      'settlement category needs string name and sizeClass',
    );
  }
  if (!hasNumberFields(category, CATEGORY_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `settlement category needs numeric ${CATEGORY_NUMBER_FIELDS.join(', ')}`,
    );
  }
  return acceptedPayload(category);
}

/**
 * The environment is checked for the one field a settlement prints and nothing else.
 *
 * A full schema for it would be a second copy of `$lib/environment`'s types living in a library
 * that does not own them, and the copy is the half that goes stale. What a validator owes is what
 * reading the payload depends on, which here is a description to show.
 */
function validateSettlementEnvironment(value: unknown): PayloadResult<unknown> {
  const environment = asRecord(value);
  if (environment === null || typeof environment.description !== 'string') {
    return rejectedPayload(
      'invalid-payload',
      'settlement environment is not an object with a description',
    );
  }
  return acceptedPayload(environment);
}

function isStoredProblem(value: unknown): boolean {
  const problem = asRecord(value);
  return (
    problem !== null &&
    (problem.kind === 'acute' || problem.kind === 'creeping') &&
    typeof problem.summary === 'string' &&
    (problem.detail === undefined || typeof problem.detail === 'string')
  );
}

/**
 * A problem list is optional and, when it is there, is a list of problems.
 *
 * Both are the point. Enrichment is opt-in, so a settlement rolled without problems and one rolled
 * with them are different shapes of the same kind, and the validator has to accept both — that is
 * what makes an unenriched settlement readable rather than quarantined.
 */
function validateProblemList(value: unknown, field: string): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  if (!Array.isArray(value) || !value.every(isStoredProblem)) {
    return rejectedPayload('invalid-payload', `settlement ${field} is not a list of problems`);
  }
  return acceptedPayload(value);
}

function isStoredNotable(value: unknown): boolean {
  const notable = asRecord(value);
  if (notable === null || !hasStringFields(notable, ['roleId', 'roleDisplay', 'importance'])) {
    return false;
  }
  if (!isStringArray(notable.salientPersonality) || !isStringArray(notable.salientPhysical)) {
    return false;
  }
  const character = asRecord(notable.character);
  return character !== null && hasStringFields(character, ['firstName', 'lastName']);
}

function validateNotables(value: unknown): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  if (!Array.isArray(value) || !value.every(isStoredNotable)) {
    return rejectedPayload(
      'invalid-payload',
      'settlement importantPeople is not a list of notables with a named character each',
    );
  }
  return acceptedPayload(value);
}

function isStoredOrganization(value: unknown): boolean {
  const organization = asRecord(value);
  if (organization === null || typeof organization.name !== 'string') {
    return false;
  }
  const profile = asRecord(organization.profile);
  return profile !== null && typeof profile.hook === 'string';
}

function validateOrganizations(value: unknown): PayloadResult<unknown> {
  if (value === undefined) {
    return acceptedPayload(value);
  }
  if (!Array.isArray(value) || !value.every(isStoredOrganization)) {
    return rejectedPayload(
      'invalid-payload',
      'settlement organizations is not a list of named organizations',
    );
  }
  return acceptedPayload(value);
}

function validateStringListField(value: unknown, field: string): PayloadResult<unknown> {
  if (value === undefined || isStringArray(value)) {
    return acceptedPayload(value);
  }
  return rejectedPayload('invalid-payload', `settlement ${field} is not an array of strings`);
}

/**
 * Checks what reading a settlement depends on: the fields it always has, and the shape of each
 * enrichment layer that happens to be present.
 *
 * The enrichment layers are the interesting half. `enrich_settlement.ts` is opt-in four times
 * over, so sixteen combinations of the same kind are all legitimate payloads, and a validator
 * that demanded trade or notables would reject the plainest settlement the generator makes. Every
 * optional field is therefore accepted when absent and checked when present — including one
 * written by a build whose enrichment defaults differed from this one's.
 */
export function validateSettlementSnapshot(payload: unknown): PayloadResult<SettlementSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'settlement payload is not an object');
  }
  if (!hasStringFields(record, SETTLEMENT_STRING_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `settlement payload needs string ${SETTLEMENT_STRING_FIELDS.join(', ')}`,
    );
  }
  if (!hasNumberFields(record, SETTLEMENT_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `settlement payload needs numeric ${SETTLEMENT_NUMBER_FIELDS.join(', ')}`,
    );
  }
  if (!isStringArray(record.settlementTags)) {
    return rejectedPayload(
      'invalid-payload',
      'settlement settlementTags is not an array of strings',
    );
  }

  const checks: PayloadResult<unknown>[] = [
    validateSettlementCategory(record.category),
    validateSettlementEnvironment(record.environment),
    validateStringListField(record.primaryImports, 'primaryImports'),
    validateStringListField(record.primaryExports, 'primaryExports'),
    validateProblemList(record.acuteProblems, 'acuteProblems'),
    validateProblemList(record.creepingProblems, 'creepingProblems'),
    validateOrganizations(record.organizations),
    validateNotables(record.importantPeople),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<SettlementSnapshot>;
  }

  return acceptedPayload(record as unknown as SettlementSnapshot);
}

/**
 * A version 1 character: whatever it held, plus the embedded species record.
 *
 * Typed as loosely as the data actually is. A migration is handed a payload written by a build this
 * one has never seen, so anything it assumes beyond "an object, possibly with a species that has a
 * name" is an assumption that can be wrong on someone's real data.
 */
function migratedCharacter(value: unknown): unknown {
  const character = asRecord(value);
  if (character === null) {
    return value;
  }
  const { species, ...rest } = character;
  const speciesRecord = asRecord(species);
  return {
    ...rest,
    // The name off the embedded record, or an empty one. A version 1 settlement with a malformed
    // species is still a settlement; `character_rehydrate.ts` turns an unresolvable name into an
    // inert placeholder, and losing the whole town over one notable would be the worse trade.
    speciesName: typeof speciesRecord?.name === 'string' ? speciesRecord.name : '',
  };
}

function migratedNotable(value: unknown): unknown {
  const notable = asRecord(value);
  if (notable === null) {
    return value;
  }
  return { ...notable, character: migratedCharacter(notable.character) };
}

function migratedOrganization(value: unknown): unknown {
  const organization = asRecord(value);
  if (organization === null) {
    return value;
  }
  return {
    ...organization,
    ...(organization.leader === undefined
      ? {}
      : { leader: migratedCharacter(organization.leader) }),
    ...(Array.isArray(organization.notableMembers)
      ? { notableMembers: organization.notableMembers.map(migratedCharacter) }
      : {}),
  };
}

/**
 * Bring a settlement written before {@link SETTLEMENT_PAYLOAD_VERSION} 2 forward.
 *
 * Every notable and every organization member is rewritten so its embedded species becomes a
 * `speciesName`; nothing else about the settlement is touched. Enrichment is opt-in four times
 * over, so a settlement may have neither notables nor organizations, and one that has neither
 * migrates by having nothing to do rather than by being rejected.
 *
 * The result goes back through `validateSettlementSnapshot` rather than being trusted: a migration
 * that produced something unreadable should say so here, where the reason reaches the user as a
 * quarantine message, instead of one field at a time somewhere downstream.
 */
export function migrateSettlementSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<SettlementSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `settlement has no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'settlement payload is not an object');
  }

  return validateSettlementSnapshot({
    ...record,
    ...(Array.isArray(record.importantPeople)
      ? { importantPeople: record.importantPeople.map(migratedNotable) }
      : {}),
    ...(Array.isArray(record.organizations)
      ? { organizations: record.organizations.map(migratedOrganization) }
      : {}),
  });
}

/**
 * A settlement as an artifact.
 *
 * The live value is the `Settlement` the library works with, and the snapshot is that settlement
 * with the three things in it that are not plain data written as names — see
 * `settlement_snapshot.ts`. The codec's two halves come from two modules because reading is much
 * the more expensive one.
 */
export const settlementArtifactKind = defineArtifactKind<Settlement, SettlementSnapshot>({
  kind: SETTLEMENT_ARTIFACT_KIND,
  displayName: 'Settlement',
  icon: house,
  payloadVersion: SETTLEMENT_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toSettlementSnapshot }, { settlementFromSnapshot }] = await Promise.all([
      import('./settlement_snapshot.js'),
      import('./settlement_rehydrate.js'),
    ]);
    return {
      toSnapshot: toSettlementSnapshot,
      // The RNG the contract hands every codec. A settlement rebuilds from names alone, so there
      // is nothing here for it to do.
      fromSnapshot: (snapshot: SettlementSnapshot) => settlementFromSnapshot(snapshot),
    };
  },
  nameOf: (snapshot) => snapshot.name,
  validate: validateSettlementSnapshot,
  migrate: migrateSettlementSnapshot,
});
