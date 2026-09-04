import crown from '$lib/assets/icons/set3/crown.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  isStringArray,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';
import { withLegacyActorMechanics } from '$lib/rulesets';
import { validateCharacterSnapshot } from '$lib/characters/character_artifact_kind';

import type { FamilySnapshot } from './family_snapshot';
import type { Family } from './family_types';

/**
 * Stable artifact kind id. Unqualified: a family is neither a game system's nor a setting's, per
 * the kind table in docs/tool-readiness.md.
 */
export const FAMILY_ARTIFACT_KIND = 'family' as const;

/** Version 2 qualifies every family member's compatibility mechanics. */
export const FAMILY_PAYLOAD_VERSION = 2 as const;

/** A pattern source: a list of patterns, or patterns with combinations. */
function isPatternSource(value: unknown): boolean {
  if (isStringArray(value)) {
    return true;
  }
  const record = asRecord(value);
  return record !== null && isStringArray(record.patterns) && Array.isArray(record.combinations);
}

function validateNamePatterns(value: unknown): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null || !isPatternSource(record.female) || !isPatternSource(record.male)) {
    return rejectedPayload(
      'invalid-payload',
      'family namePatterns needs a female and a male pattern source',
    );
  }
  return acceptedPayload(record);
}

/**
 * One edge: two ids and a type with a name. The type carries more — reciprocal name, phrase
 * templates — but what reading depends on is the name, which is how spouse and parent edges are
 * told apart, and a validator that listed the rest would be a second copy of `RelationshipType`.
 */
function isStoredRelationship(value: unknown): boolean {
  const relationship = asRecord(value);
  if (
    relationship === null ||
    !hasStringFields(relationship, ['id', 'originatorId', 'recipientId'])
  ) {
    return false;
  }
  const type = asRecord(relationship.type);
  return type !== null && typeof type.name === 'string';
}

/**
 * Checks what reading depends on: the family's own fields, its members as characters, its edges,
 * and the pattern sources its generators are rebuilt from.
 *
 * A family with no members is accepted. A user who has removed everyone from a saved family has
 * made an editing decision, and a payload that fails its own validator is a broken artifact rather
 * than an empty one — 3.3 asks for a well-defined empty result, not a refusal. An edge that names
 * a member who is gone is accepted too: the relation helpers look ids up and find nothing, which
 * is the well-defined answer, and refusing the whole family over one dangling edge would lose it.
 */
export function validateFamilySnapshot(payload: unknown): PayloadResult<FamilySnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'family payload is not an object');
  }
  if (!hasStringFields(record, ['id', 'name'])) {
    return rejectedPayload('invalid-payload', 'family payload needs an id and a name');
  }
  if (record.headId !== undefined && typeof record.headId !== 'string') {
    return rejectedPayload('invalid-payload', 'family headId is not a string');
  }
  if (!isStringArray(record.memberIds)) {
    return rejectedPayload('invalid-payload', 'family memberIds is not an array of strings');
  }
  if (!Array.isArray(record.members)) {
    return rejectedPayload('invalid-payload', 'family members is not a list');
  }
  const failedMember = record.members.map(validateCharacterSnapshot).find((check) => !check.ok);
  if (failedMember !== undefined) {
    return failedMember as PayloadResult<FamilySnapshot>;
  }
  if (!Array.isArray(record.relationships) || !record.relationships.every(isStoredRelationship)) {
    return rejectedPayload(
      'invalid-payload',
      'family relationships is not a list of edges with two ids and a typed name',
    );
  }
  const patterns = validateNamePatterns(record.namePatterns);
  if (!patterns.ok) {
    return patterns as PayloadResult<FamilySnapshot>;
  }

  return acceptedPayload(record as unknown as FamilySnapshot);
}

/** Qualifies every embedded member without changing the family graph or prose. */
export function migrateFamilySnapshot(
  payload: unknown,
  from: number,
): PayloadResult<FamilySnapshot> {
  if (from !== 1) {
    return rejectedPayload(
      'unsupported-version',
      `Families have no migration from payload version ${from}; version 1 is the only older shape there has been`,
    );
  }
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'family payload is not an object');
  }
  return validateFamilySnapshot({
    ...record,
    members: Array.isArray(record.members)
      ? record.members.map((member) => {
          const person = asRecord(member);
          return person === null ? member : withLegacyActorMechanics(person, 'migrated');
        })
      : record.members,
  });
}

/** What to call a saved family: "the X family", as the page heads it. */
function familyName(snapshot: FamilySnapshot): string {
  const name = snapshot.name.trim();
  return name === '' ? 'Family' : `The ${name} Family`;
}

/**
 * A family as an artifact.
 *
 * The codec is a dynamic import because its reading half reaches the archetype tables, the
 * made-up-names package and, through a member's arms, the charge art. Listing a project must not
 * pay for that.
 */
export const familyArtifactKind = defineArtifactKind<Family, FamilySnapshot>({
  kind: FAMILY_ARTIFACT_KIND,
  displayName: 'Family',
  icon: crown,
  payloadVersion: FAMILY_PAYLOAD_VERSION,
  loadCodec: async () => {
    const [{ toFamilySnapshot }, { familyFromSnapshot }] = await Promise.all([
      import('./family_snapshot.js'),
      import('./family_rehydrate.js'),
    ]);
    return { toSnapshot: toFamilySnapshot, fromSnapshot: familyFromSnapshot };
  },
  nameOf: familyName,
  validate: validateFamilySnapshot,
  migrate: migrateFamilySnapshot,
});
