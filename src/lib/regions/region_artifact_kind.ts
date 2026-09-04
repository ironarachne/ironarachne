import map from '$lib/assets/icons/set1/map.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
// Deep, for the reason the registry's own header gives: these libraries' entry points reach
// generators and from there the species tables and the charge art. Each of these modules holds
// metadata and validation only, and the registry that imports them is loaded by any page that
// lists what a project contains.
import { validateCharacterSnapshot } from '$lib/characters/character_artifact_kind';
import { validateCultureSnapshot } from '$lib/culture/culture_artifact_kind';
import {
  migrateOrganizationSnapshot,
  validateOrganizationSnapshot,
} from '$lib/organizations/organization_artifact_kind';
import { withLegacyActorMechanics } from '$lib/rulesets';
import {
  migrateSettlementSnapshot,
  validateSettlementSnapshot,
} from '$lib/settlements/settlement_artifact_kind';

import type Region from './region.js';
import type { RegionSnapshot } from './region_snapshot.js';

/**
 * Stable artifact kind id. Unqualified: a region is neither a game system's nor a setting's, per
 * the kind table in docs/tool-readiness.md.
 */
export const REGION_ARTIFACT_KIND = 'region' as const;

/** Version 2 qualifies every direct and composed actor's compatibility mechanics. */
export const REGION_PAYLOAD_VERSION = 2 as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * The map, which is the one part of a region nothing else in the pass validates.
 *
 * Checked as a graph rather than field by field: what a renderer depends on is that the three lists
 * exist and that the canvas has a size. A node referring to a corner that is not there is a
 * dangling index rather than a broken payload, and the renderer already skips those.
 */
function validateMap(value: unknown): PayloadResult<unknown> {
  const graph = asRecord(value);
  if (graph === null) {
    return rejectedPayload('invalid-payload', 'region map is not an object');
  }
  if (!isFiniteNumber(graph.width) || !isFiniteNumber(graph.height)) {
    return rejectedPayload('invalid-payload', 'region map has no numeric size');
  }
  const missing = (['nodes', 'edges', 'corners'] as const).find(
    (field) => !Array.isArray(graph[field]),
  );
  return missing === undefined
    ? acceptedPayload(graph)
    : rejectedPayload('invalid-payload', `region map ${missing} is not a list`);
}

/**
 * One realm: its words, its arms, its ruler, and the type it is stored under by name.
 *
 * The ruler goes through `$lib/characters`' own validator rather than a copy of it, which is the
 * rule the encounter kind states: a copy of another kind's validator is the half that goes stale
 * the day a field is added.
 */
function validateRealm(value: unknown, index: number): PayloadResult<unknown> {
  const realm = asRecord(value);
  if (realm === null) {
    return rejectedPayload('invalid-payload', `region realm ${index} is not an object`);
  }
  if (!hasStringFields(realm, ['name', 'adjective', 'description', 'realmTypeName'])) {
    return rejectedPayload(
      'invalid-payload',
      `region realm ${index} needs a name, an adjective, a description and a type`,
    );
  }
  if (!isFiniteNumber(realm.parent)) {
    return rejectedPayload('invalid-payload', `region realm ${index} has no parent index`);
  }
  if (!Array.isArray(realm.tiles) || !Array.isArray(realm.claims)) {
    return rejectedPayload(
      'invalid-payload',
      `region realm ${index} tiles or claims is not a list`,
    );
  }
  if (asRecord(realm.heraldry) === null) {
    return rejectedPayload('invalid-payload', `region realm ${index} has no arms`);
  }
  return validateCharacterSnapshot(realm.authority);
}

function validateList(
  value: unknown,
  what: string,
  check: (entry: unknown, index: number) => PayloadResult<unknown>,
): PayloadResult<unknown> {
  if (!Array.isArray(value)) {
    return rejectedPayload('invalid-payload', `region ${what} is not a list`);
  }
  return value.map(check).find((result) => !result.ok) ?? acceptedPayload(value);
}

/**
 * Checks a region's own words, its map, and each of the four lists it composes.
 *
 * `dominantCulture` may be `null`, which is what a region named from a referenced culture stores;
 * a region with no settlements, no realms or no organizations is accepted, because each of those
 * is something a user can remove. What is not optional is the map and the region's own ruler: the
 * first is the tool's output and the second is the only thing every region has exactly one of.
 */
export function validateRegionSnapshot(payload: unknown): PayloadResult<RegionSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'region payload is not an object');
  }
  if (!hasStringFields(record, ['name', 'description'])) {
    return rejectedPayload('invalid-payload', 'region payload needs a name and a description');
  }
  if (!isFiniteNumber(record.mainRealm)) {
    return rejectedPayload('invalid-payload', 'region payload has no main realm index');
  }
  if (asRecord(record.environment) === null) {
    return rejectedPayload('invalid-payload', 'region payload has no environment');
  }

  if (record.dominantCulture !== null && record.dominantCulture !== undefined) {
    const culture = validateCultureSnapshot(record.dominantCulture);
    if (!culture.ok) {
      return culture as PayloadResult<RegionSnapshot>;
    }
  }

  const checks = [
    validateMap(record.map),
    validateCharacterSnapshot(record.authority),
    validateList(record.settlements, 'settlements', (entry) => validateSettlementSnapshot(entry)),
    validateList(record.realms, 'realms', validateRealm),
    validateList(record.organizations, 'organizations', (entry) =>
      validateOrganizationSnapshot(entry),
    ),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<RegionSnapshot>;
  }

  return acceptedPayload(record as unknown as RegionSnapshot);
}

/** Qualifies direct actors and composes the settlement and organization migrations. */
export function migrateRegionSnapshot(
  payload: unknown,
  from: number,
): PayloadResult<RegionSnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `Regions have no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'region payload is not an object');
  }

  const migrateActor = (value: unknown): unknown => {
    const actor = asRecord(value);
    return actor === null ? value : withLegacyActorMechanics(actor, 'migrated');
  };
  const settlements = Array.isArray(record.settlements)
    ? record.settlements.map((settlement) => {
        const migrated = migrateSettlementSnapshot(settlement, 2);
        return migrated.ok ? migrated.value : settlement;
      })
    : record.settlements;
  const organizations = Array.isArray(record.organizations)
    ? record.organizations.map((organization) => {
        const migrated = migrateOrganizationSnapshot(organization, 1);
        return migrated.ok ? migrated.value : organization;
      })
    : record.organizations;
  const realms = Array.isArray(record.realms)
    ? record.realms.map((realm) => {
        const storedRealm = asRecord(realm);
        return storedRealm === null
          ? realm
          : { ...storedRealm, authority: migrateActor(storedRealm.authority) };
      })
    : record.realms;

  return validateRegionSnapshot({
    ...record,
    authority: migrateActor(record.authority),
    settlements,
    organizations,
    realms,
  });
}

/** What to call a saved region: its name, or the kind when the name has been emptied. */
function regionName(snapshot: RegionSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Region' : name;
}

/**
 * A region as an artifact.
 *
 * The codec is a dynamic import because its reading half rebuilds a culture, every settlement,
 * every organization and four kinds of character, and through their arms it reaches 18 MB of charge
 * art. Listing a project must not pay for that.
 */
export const regionArtifactKind = defineArtifactKind<Region, RegionSnapshot>({
  kind: REGION_ARTIFACT_KIND,
  displayName: 'Region',
  icon: map,
  payloadVersion: REGION_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toRegionSnapshot }, { regionFromSnapshot }] = await Promise.all([
      import('./region_snapshot.js'),
      import('./region_rehydrate.js'),
    ]);
    return {
      toSnapshot: (region: Region) => toRegionSnapshot(region),
      fromSnapshot: regionFromSnapshot,
    };
  },
  nameOf: regionName,
  validate: validateRegionSnapshot,
  migrate: migrateRegionSnapshot,
});
