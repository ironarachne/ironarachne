import scroll from '$lib/assets/icons/set3/scrool-2.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
import { validateCharacterSnapshot } from '$lib/characters/character_artifact_kind';

import type { OrganizationSnapshot } from './organization_snapshot';
import type { Organization } from './organization_types';

/**
 * Stable artifact kind id. Unqualified, per the kind table in docs/tool-readiness.md.
 *
 * Not to be confused with `Organization.kindId`, which names what sort of organization one is
 * (`mercenary_company`, `noble_house`) from this library's own kind registry. That registry
 * predates the artifact kind registry and means something else entirely.
 */
export const ORGANIZATION_ARTIFACT_KIND = 'organization' as const;

/** Version 1. The first shape an organization has been stored on its own in. */
export const ORGANIZATION_PAYLOAD_VERSION = 1 as const;

const EMBLEM_KINDS = ['none', 'heraldry', 'merchant_mark', 'pattern_lattice', 'disc_emblem'];
const GENRES = ['fantasy', 'science_fiction'];

function isLabeledFacet(value: unknown): boolean {
  const facet = asRecord(value);
  return facet !== null && hasStringFields(facet, ['id', 'label']);
}

/** The profile: the facets the page prints, and the hook line. */
function validateProfile(value: unknown): PayloadResult<unknown> {
  const profile = asRecord(value);
  if (profile === null || typeof profile.hook !== 'string') {
    return rejectedPayload('invalid-payload', 'organization profile has no hook');
  }
  if (
    !Array.isArray(profile.personalityTraits) ||
    !profile.personalityTraits.every(isLabeledFacet) ||
    !isLabeledFacet(profile.goal) ||
    !isLabeledFacet(profile.weakness) ||
    !isLabeledFacet(profile.publicStanding)
  ) {
    return rejectedPayload(
      'invalid-payload',
      'organization profile needs labelled traits, a goal, a weakness and a public standing',
    );
  }
  return acceptedPayload(profile);
}

/**
 * A stored coat of arms, or `null` for a referenced one.
 *
 * `null` is accepted because it is what a composed organization is *written* with, so a validator
 * that turned it away would make an organization unreadable by the very build that saved it.
 */
function isStoredArmsOrReference(value: unknown): boolean {
  if (value === null) {
    return true;
  }
  const arms = asRecord(value);
  if (arms === null || typeof arms.blazon !== 'string') {
    return false;
  }
  const device = asRecord(arms.device);
  return (
    device !== null && typeof device.fieldName === 'string' && Array.isArray(device.chargeGroups)
  );
}

/** The identity: an emblem of a known kind carrying its parameters, and the optional extras. */
function validateVisualIdentity(value: unknown): PayloadResult<unknown> {
  const identity = asRecord(value);
  if (identity === null) {
    return rejectedPayload('invalid-payload', 'organization visualIdentity is not an object');
  }
  const emblem = asRecord(identity.emblem);
  if (emblem === null || !EMBLEM_KINDS.includes(emblem.kind as string)) {
    return rejectedPayload('invalid-payload', 'organization emblem is not of a known kind');
  }
  const parameters =
    (emblem.kind === 'heraldry' && isStoredArmsOrReference(emblem.arms)) ||
    (emblem.kind === 'merchant_mark' && asRecord(emblem.mark) !== null) ||
    (emblem.kind === 'pattern_lattice' && asRecord(emblem.lattice) !== null) ||
    (emblem.kind === 'disc_emblem' && asRecord(emblem.disc) !== null) ||
    emblem.kind === 'none';
  if (!parameters) {
    return rejectedPayload('invalid-payload', 'organization emblem is missing its parameters');
  }
  if (identity.motto !== undefined && typeof identity.motto !== 'string') {
    return rejectedPayload('invalid-payload', 'organization motto is not a string');
  }
  if (identity.colors !== undefined) {
    const colors = asRecord(identity.colors);
    if (colors === null || typeof colors.primary !== 'string') {
      return rejectedPayload('invalid-payload', 'organization colors have no primary');
    }
  }
  return acceptedPayload(identity);
}

function isEntryArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) => Array.isArray(entry) && entry.length === 2 && typeof entry[0] === 'string',
    )
  );
}

/** The three maps as entry arrays, which is the whole of what the rebuild depends on. */
function validateHierarchy(value: unknown): PayloadResult<unknown> {
  const hierarchy = asRecord(value);
  if (
    hierarchy === null ||
    !isEntryArray(hierarchy.childToParent) ||
    !isEntryArray(hierarchy.idToOrder) ||
    !isEntryArray(hierarchy.roleById)
  ) {
    return rejectedPayload(
      'invalid-payload',
      'organization hierarchy is not three entry lists keyed by role id',
    );
  }
  return acceptedPayload(hierarchy);
}

function isStoredRelationship(value: unknown): boolean {
  const relationship = asRecord(value);
  return relationship !== null && hasStringFields(relationship, ['relatedOrganizationId', 'kind']);
}

/**
 * Checks what reading depends on. Each person goes through the character kind's own validator
 * rather than a copy of it.
 *
 * An organization with no notable members is accepted: a user who has removed every one of them
 * from a saved guild has made an editing decision, and 3.3 asks for a well-defined empty result.
 */
export function validateOrganizationSnapshot(
  payload: unknown,
): PayloadResult<OrganizationSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'organization payload is not an object');
  }
  if (!hasStringFields(record, ['id', 'name', 'description', 'kindId'])) {
    return rejectedPayload(
      'invalid-payload',
      'organization payload needs string id, name, description and kindId',
    );
  }
  if (!Number.isFinite(record.memberCount)) {
    return rejectedPayload('invalid-payload', 'organization memberCount is not a number');
  }
  if (!GENRES.includes(record.genre as string)) {
    return rejectedPayload('invalid-payload', 'organization genre is not one this build knows');
  }
  if (!Array.isArray(record.notableMembers)) {
    return rejectedPayload('invalid-payload', 'organization notableMembers is not a list');
  }
  if (!Array.isArray(record.relationships) || !record.relationships.every(isStoredRelationship)) {
    return rejectedPayload(
      'invalid-payload',
      'organization relationships is not a list of related ids with a kind',
    );
  }

  const checks: PayloadResult<unknown>[] = [
    validateProfile(record.profile),
    validateVisualIdentity(record.visualIdentity),
    validateHierarchy(record.hierarchy),
    validateCharacterSnapshot(record.leader),
    ...record.notableMembers.map(validateCharacterSnapshot),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<OrganizationSnapshot>;
  }

  return acceptedPayload(record as unknown as OrganizationSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes — a kind without one looks complete right up until it silently drops someone's
 * work, and local-only means there is no server-side migration to fall back on.
 */
export function migrateOrganizationSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<OrganizationSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `Organizations have no migration from payload version ${from}; version ${ORGANIZATION_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a saved organization: its name, or the kind when the name has been emptied. */
function organizationName(snapshot: OrganizationSnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Organization' : name;
}

/**
 * An organization as an artifact.
 *
 * The codec is a dynamic import because its reading half reaches the archetype tables and, through
 * heraldic arms, 18 MB of charge art. Listing a project must not pay for that.
 */
export const organizationArtifactKind = defineArtifactKind<Organization, OrganizationSnapshot>({
  kind: ORGANIZATION_ARTIFACT_KIND,
  displayName: 'Organization',
  icon: scroll,
  payloadVersion: ORGANIZATION_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toOrganizationSnapshot }, { organizationFromSnapshot }] = await Promise.all([
      import('./organization_snapshot.js'),
      import('./organization_rehydrate.js'),
    ]);
    return { toSnapshot: toOrganizationSnapshot, fromSnapshot: organizationFromSnapshot };
  },
  nameOf: organizationName,
  validate: validateOrganizationSnapshot,
  migrate: migrateOrganizationSnapshot,
});
