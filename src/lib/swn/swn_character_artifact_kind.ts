import pistol from '$lib/assets/icons/set3/gun-pistol.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  hasStringFields,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { SWNCharacter } from './character';
import type { SwnCharacterSnapshot } from './swn_character_snapshot';

/**
 * Stable artifact kind id.
 *
 * Concept first, system as the qualifier, so every character kind sorts together in a vault
 * listing. A Stars Without Number character is a set of numbers that mean something only under that
 * ruleset — skill levels that cap at the class, saving throws counted downwards, Effort — so it is
 * system-qualified per decision 4 of docs/workshop.md, alongside `character.adnd-2e` and
 * `character.dcc`.
 */
export const SWN_CHARACTER_ARTIFACT_KIND = 'character.swn' as const;

/** Version 1. The first shape a SWN character has been stored in. */
export const SWN_CHARACTER_PAYLOAD_VERSION = 1 as const;

/**
 * The numbers a character sheet cannot be read without.
 *
 * Not every number on the character. The stored block runs to a dozen more — the three armour
 * classes, the two attack bonuses, Effort, credits — and a validator listing all of them would be a
 * second copy of `SWNCharacter` living in a module that does not own it, and the copy is the half
 * that goes stale. What a validator owes is what reading depends on.
 */
const CHARACTER_NUMBER_FIELDS = [
  'currentLevel',
  'hitPoints',
  'armorClassEquipped',
  'savingThrowMental',
  'savingThrowEvasion',
  'savingThrowPhysical',
];

function hasNumberFields(record: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => Number.isFinite(record[key]));
}

/** A named row, which is what most of a SWN character is made of. */
function isNamedObjectArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      const record = asRecord(entry);
      return record !== null && typeof record.name === 'string';
    })
  );
}

function validateNamedList(value: unknown, field: string): PayloadResult<unknown> {
  if (value === undefined || isNamedObjectArray(value)) {
    return acceptedPayload(value);
  }
  return rejectedPayload(
    'invalid-payload',
    `SWN character ${field} is not a list of named entries`,
  );
}

/**
 * The six stats, each a score and the modifier derived from it.
 *
 * Both numbers are checked because both are stored and both are shown. The modifier is derivable
 * from the score, which is exactly why it must be validated rather than recomputed: a referee who
 * has adjusted one has made a decision, and a reader that quietly recalculated it would overrule
 * them.
 */
function validateStats(value: unknown): PayloadResult<unknown> {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const stat = asRecord(entry);
      return (
        stat !== null &&
        hasStringFields(stat, ['name', 'abbreviation']) &&
        hasNumberFields(stat, ['score', 'modifier'])
      );
    })
  ) {
    return rejectedPayload(
      'invalid-payload',
      'SWN character stats are not named scores with modifiers',
    );
  }
  return acceptedPayload(value);
}

/** Skills, which the sheet prints as `Shoot-1` and an editor offers a level for. */
function validateSkills(value: unknown): PayloadResult<unknown> {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const skill = asRecord(entry);
      return skill !== null && typeof skill.name === 'string' && Number.isFinite(skill.level);
    })
  ) {
    return rejectedPayload('invalid-payload', 'SWN character skills are not named levels');
  }
  return acceptedPayload(value);
}

/** Foci, which carry their own level: the pick and its level are the row itself. */
function validateFocuses(value: unknown): PayloadResult<unknown> {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const focus = asRecord(entry);
      return (
        focus !== null && typeof focus.name === 'string' && Number.isFinite(focus.currentLevel)
      );
    })
  ) {
    return rejectedPayload('invalid-payload', 'SWN character focuses are not named levels');
  }
  return acceptedPayload(value);
}

/** Class abilities, every one of which the sheet prints by its description. */
function validateAbilities(value: unknown): PayloadResult<unknown> {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => {
      const ability = asRecord(entry);
      return ability !== null && typeof ability.description === 'string';
    })
  ) {
    return rejectedPayload('invalid-payload', 'SWN character abilities are not described entries');
  }
  return acceptedPayload(value);
}

/**
 * The psychic picks, when there are any.
 *
 * Absent is accepted, and deliberately: a character with no psychic skill has no picks to record,
 * and a payload written before the field existed is a character whose disciplines were never
 * recorded as decisions — not a corrupt one. `swnCharacterFromSnapshot` supplies the empty list.
 */
function validatePsychicPicks(value: unknown): PayloadResult<unknown> {
  if (
    value !== undefined &&
    (!Array.isArray(value) ||
      !value.every((entry) => {
        const pick = asRecord(entry);
        return (
          pick !== null &&
          hasStringFields(pick, ['disciplineName', 'abilityName']) &&
          Number.isFinite(pick.level)
        );
      }))
  ) {
    return rejectedPayload(
      'invalid-payload',
      'SWN character psychicPicks are not disciplines drawn at a level',
    );
  }
  return acceptedPayload(value);
}

/** A background or a character class: a named row the sheet reads the character from. */
function validateNamedRow(value: unknown, field: string): PayloadResult<unknown> {
  const record = asRecord(value);
  if (record === null || typeof record.name !== 'string') {
    return rejectedPayload('invalid-payload', `SWN character ${field} has no name`);
  }
  return acceptedPayload(record);
}

/** Checks what `swnCharacterFromSnapshot` depends on, and what a sheet is printed from. */
export function validateSwnCharacterSnapshot(
  payload: unknown,
): PayloadResult<SwnCharacterSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'SWN character payload is not an object');
  }
  if (!hasStringFields(record, ['firstName', 'lastName'])) {
    return rejectedPayload('invalid-payload', 'SWN character payload needs string names');
  }
  if (!hasNumberFields(record, CHARACTER_NUMBER_FIELDS)) {
    return rejectedPayload(
      'invalid-payload',
      `SWN character payload needs numeric ${CHARACTER_NUMBER_FIELDS.join(', ')}`,
    );
  }

  const checks: PayloadResult<unknown>[] = [
    validateNamedRow(record.background, 'background'),
    validateNamedRow(record.characterClass, 'characterClass'),
    validateStats(record.stats),
    validateSkills(record.skills),
    validateFocuses(record.focuses),
    validateAbilities(record.abilities),
    validatePsychicPicks(record.psychicPicks),
    validateNamedList(record.equipment, 'equipment'),
    validateNamedList(record.rangedWeapons, 'rangedWeapons'),
    validateNamedList(record.meleeWeapons, 'meleeWeapons'),
    validateNamedList(record.armor, 'armor'),
  ];
  const failed = checks.find((check) => !check.ok);
  if (failed !== undefined) {
    return failed as PayloadResult<SwnCharacterSnapshot>;
  }

  return acceptedPayload(record as unknown as SwnCharacterSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes. A kind without one looks complete right up until it silently drops someone's work
 * — and local-only means there is no server-side migration to fall back on.
 */
export function migrateSwnCharacterSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<SwnCharacterSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `SWN character has no migration from payload version ${from}; version ${SWN_CHARACTER_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/** What to call a character saved unnamed: what they are, which they always have. */
function swnCharacterName(snapshot: SwnCharacterSnapshot): string {
  const given = `${snapshot.firstName} ${snapshot.lastName}`.trim();
  if (given !== '') {
    return given;
  }
  const what = `${snapshot.background.name} ${snapshot.characterClass.name}`.trim();
  return what === '' ? 'SWN Character' : what;
}

/**
 * A Stars Without Number character as an artifact.
 *
 * The codec is cheap on both sides — the snapshot is the character, and reading one back adds a
 * default and nothing else — so unlike settlement or heraldry there is no expensive half to keep
 * out of the chunk that merely lists a project. It is still loaded on demand, because the contract
 * is the same for every kind and a codec that happens to be cheap today is not a reason to wire it
 * differently from its neighbours.
 */
export const swnCharacterArtifactKind = defineArtifactKind<SWNCharacter, SwnCharacterSnapshot>({
  kind: SWN_CHARACTER_ARTIFACT_KIND,
  displayName: 'SWN Character',
  icon: pistol,
  payloadVersion: SWN_CHARACTER_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { swnCharacterFromSnapshotWithRng, toSwnCharacterSnapshot } =
      await import('./swn_character_snapshot.js');
    return {
      toSnapshot: toSwnCharacterSnapshot,
      fromSnapshot: swnCharacterFromSnapshotWithRng,
    };
  },
  nameOf: swnCharacterName,
  validate: validateSwnCharacterSnapshot,
  migrate: migrateSwnCharacterSnapshot,
});
