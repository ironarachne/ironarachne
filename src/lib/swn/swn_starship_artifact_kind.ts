import airplane from '$lib/assets/icons/set3/airplane.svg?raw';
import {
  acceptedPayload,
  asRecord,
  defineArtifactKind,
  rejectedPayload,
  type PayloadResult,
} from '$lib/artifact_kinds';

import type { SWNStarship } from './starship';
import type { SwnStarshipSnapshot } from './swn_starship_snapshot';

/**
 * Stable artifact kind id.
 *
 * Concept first, system as the qualifier. A hull's mass, its power budget and its hardpoint count
 * mean something only under the Stars Without Number ruleset — the numbers are that game's, not a
 * general fact about spacecraft — so it is system-qualified per decision 4 of docs/workshop.md,
 * alongside `character.swn`.
 *
 * It is deliberately **not** the same kind as `spooky-ship`, which decision 6 of
 * docs/readiness-objects.md settled: that one is a paragraph about something adrift, this one is a
 * fitted hull, and one kind would put a fittings editor in front of a sentence.
 */
export const SWN_STARSHIP_ARTIFACT_KIND = 'starship.swn' as const;

/** Version 1. The first shape a SWN starship has been stored in. */
export const SWN_STARSHIP_PAYLOAD_VERSION = 1 as const;

/**
 * The hull numbers a ship sheet cannot be read without.
 *
 * Not every number on a hull. A `HullType` carries fourteen fields, and a validator listing all of
 * them would be a second copy of the type living in a module that does not own it — and the copy is
 * the half that goes stale. What a validator owes is what reading depends on: the three pools the
 * budget lines are printed against, and the name of the hull itself.
 */
const HULL_NUMBER_FIELDS = ['mass', 'power', 'hardPoints'] as const;

/** The ship's own numbers, every one of which the sheet prints. */
const SHIP_NUMBER_FIELDS = [
  'currentCrew',
  'totalCost',
  'tonsOfCargo',
  'usedMass',
  'usedPower',
  'usedHardPoints',
] as const;

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function hasNumberFields(record: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => Number.isFinite(record[key]));
}

/**
 * One row of the allocation: a fitting, a weapon or a defense.
 *
 * Every row is normalised rather than refused, and the fields are the union of what the three
 * shapes carry. A weapon's `damage` and `qualities` are absent from a fitting, and a fitting's
 * `effect` is what a weapon fills with `'Kills things'`; keeping each only when it is there is what
 * lets one reader serve all three lists without inventing fields on rows that never had them.
 */
function readAllocationRow(value: unknown): Record<string, unknown> | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.name !== 'string') {
    return undefined;
  }

  const row: Record<string, unknown> = {
    ...record,
    name: record.name,
    fittingType: readText(record.fittingType),
    effect: readText(record.effect),
    cost: readNumber(record.cost),
    mass: readNumber(record.mass),
    power: readNumber(record.power),
  };
  if (Array.isArray(record.qualities)) {
    row.qualities = record.qualities.filter((entry): entry is string => typeof entry === 'string');
  }
  return row;
}

/**
 * One of the three allocation lists.
 *
 * A list that is not a list at all becomes an empty one, and a row with no name is dropped rather
 * than taking the ship with it. That is requirement 3.3: an unarmed ship stored with no weapons and
 * a ship whose weapon list was hand-edited into nonsense both read back as a ship with no weapons,
 * which is a well-defined empty result rather than a refusal.
 */
function readAllocationList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(readAllocationRow)
    .filter((row): row is Record<string, unknown> => row !== undefined);
}

/** The drive, which every ship has exactly one of. A missing one reads back as an unnamed drive. */
function readDrive(value: unknown): Record<string, unknown> {
  return readAllocationRow(value) ?? { name: '', fittingType: 'drive', effect: '' };
}

/**
 * Checks what `swnStarshipFromSnapshot` depends on, and what a ship sheet is printed from.
 *
 * The hard requirements are an identity and a hull: a payload with no `hullType` has nothing to
 * print the budget lines against, and reading its pools as zero would show a ship whose every
 * fitting overflows a hull that does not exist. Everything below that degrades — a ship missing its
 * cargo figure is still a ship, and an allocation list that cannot be read is an empty one.
 */
export function validateSwnStarshipSnapshot(payload: unknown): PayloadResult<SwnStarshipSnapshot> {
  const record = asRecord(payload);
  if (record === null) {
    return rejectedPayload('invalid-payload', 'SWN starship payload is not an object');
  }
  if (typeof record.name !== 'string' || typeof record.ownerTypeName !== 'string') {
    return rejectedPayload(
      'invalid-payload',
      'SWN starship payload needs a name and an owner type name',
    );
  }

  const hull = asRecord(record.hullType);
  if (
    hull === null ||
    typeof hull.name !== 'string' ||
    !hasNumberFields(hull, HULL_NUMBER_FIELDS)
  ) {
    return rejectedPayload(
      'invalid-payload',
      `SWN starship hull needs a name and numeric ${HULL_NUMBER_FIELDS.join(', ')}`,
    );
  }

  const numbers: Record<string, number> = {};
  for (const field of SHIP_NUMBER_FIELDS) {
    numbers[field] = readNumber(record[field]);
  }

  return acceptedPayload({
    ...numbers,
    name: record.name,
    className: readText(record.className),
    manufacturer: readText(record.manufacturer),
    ownerTypeName: record.ownerTypeName,
    hullType: hull,
    weapons: readAllocationList(record.weapons),
    defenses: readAllocationList(record.defenses),
    fittings: readAllocationList(record.fittings),
    drive: readDrive(record.drive),
  } as unknown as SwnStarshipSnapshot);
}

/**
 * There has only ever been version 1, so this rejects rather than pretending otherwise.
 *
 * It is here because the contract requires it, and it is where the first real step goes the day the
 * shape changes. A kind without one looks complete right up until it silently drops someone's work
 * — and local-only means there is no server-side migration to fall back on.
 */
export function migrateSwnStarshipSnapshot(
  _payload: unknown,
  from: number,
): PayloadResult<SwnStarshipSnapshot> {
  return rejectedPayload(
    'unsupported-version',
    `SWN starships have no migration from payload version ${from}; version ${SWN_STARSHIP_PAYLOAD_VERSION} is the only shape there has been`,
  );
}

/**
 * What to call a saved ship.
 *
 * Its name, which the generator always gives it. A ship stored without one falls back to what it is
 * — a pirate corvette reads better in a vault listing than an empty row does.
 */
export function swnStarshipName(snapshot: SwnStarshipSnapshot): string {
  const given = snapshot.name.trim();
  if (given !== '') {
    return given;
  }
  const what = `${snapshot.ownerTypeName} ${snapshot.hullType?.name ?? ''}`.trim();
  return what === '' ? 'SWN Starship' : what;
}

/**
 * A Stars Without Number starship as an artifact.
 *
 * The codec resolves one field — the owner type, which is stored by name because it carries naming
 * closures `structuredClone` refuses. It is still a dynamic import, as every kind's is: the
 * contract is the same for all of them, and a codec that happens to be cheap today is not a reason
 * to wire it differently from its neighbours.
 */
export const swnStarshipArtifactKind = defineArtifactKind<SWNStarship, SwnStarshipSnapshot>({
  kind: SWN_STARSHIP_ARTIFACT_KIND,
  displayName: 'SWN Starship',
  icon: airplane,
  payloadVersion: SWN_STARSHIP_PAYLOAD_VERSION,
  loadCodec: async () => {
    const { swnStarshipFromSnapshotWithRng, toSwnStarshipSnapshot } =
      await import('./swn_starship_snapshot.js');
    return {
      toSnapshot: toSwnStarshipSnapshot,
      fromSnapshot: swnStarshipFromSnapshotWithRng,
    };
  },
  nameOf: swnStarshipName,
  validate: validateSwnStarshipSnapshot,
  migrate: migrateSwnStarshipSnapshot,
});
