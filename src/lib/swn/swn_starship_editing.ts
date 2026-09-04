/**
 * Editing a stored Stars Without Number starship, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming a ship must not disturb
 * its fittings, and pulling one weapon off must not re-roll the hull — and it is what lets the
 * editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * **Nothing here recomputes anything on its own.** Removing a fitting does not move `usedMass`, and
 * changing a hull's pool does not move what is drawn from it. That is requirement 4.2 taken
 * seriously rather than a gap: a referee who has written a ship's used mass down has made a
 * decision, and a form that quietly corrected it on every keystroke would overrule them repeatedly.
 * `swnStarshipBudgetFromAllocation` is the arithmetic offered as an explicit command instead — in
 * the editor it is a button, which is what the design means by "the budget lines recompute as an
 * explicit command rather than silently".
 */

import type { DefenseFitting, DriveFitting, Fitting, Weapon } from './starship.js';
import type { SwnStarshipSnapshot } from './swn_starship_snapshot.js';

/** The identity fields a user may rewrite. */
export const SWN_STARSHIP_TEXT_FIELDS = [
  'name',
  'className',
  'manufacturer',
  'ownerTypeName',
] as const;

export type SwnStarshipTextField = (typeof SWN_STARSHIP_TEXT_FIELDS)[number];

/** The ship's own numbers, including the three budget totals a user may correct by hand. */
export const SWN_STARSHIP_NUMBER_FIELDS = [
  'currentCrew',
  'totalCost',
  'tonsOfCargo',
  'usedMass',
  'usedPower',
  'usedHardPoints',
] as const;

export type SwnStarshipNumberField = (typeof SWN_STARSHIP_NUMBER_FIELDS)[number];

/**
 * The hull numbers the sheet shows.
 *
 * All of them the screen prints, which is what requirement 4.1 asks for: the three pools the budget
 * lines are read against, the crew band, and the four combat figures. `hullClass` is not here —
 * it is what the fitting tables were filtered by when the ship was built, and a stored ship's
 * fittings are already chosen, so offering it would be offering a decision that no longer decides
 * anything.
 */
export const SWN_HULL_NUMBER_FIELDS = [
  'mass',
  'power',
  'hardPoints',
  'speed',
  'armor',
  'ac',
  'hp',
  'cost',
  'crewMinimum',
  'crewMaximum',
] as const;

export type SwnHullNumberField = (typeof SWN_HULL_NUMBER_FIELDS)[number];

/** The hull's own text: what it is called, its class in words, and the skill it is crewed on. */
export const SWN_HULL_TEXT_FIELDS = ['name', 'hullClassName', 'crewSkill'] as const;

export type SwnHullTextField = (typeof SWN_HULL_TEXT_FIELDS)[number];

/** The three lists an allocation is made of, each of which the sheet prints under its own heading. */
export const SWN_ALLOCATION_LISTS = ['fittings', 'weapons', 'defenses'] as const;

export type SwnAllocationList = (typeof SWN_ALLOCATION_LISTS)[number];

/** One row of an allocation, as the editing functions need to see it. */
type AllocationRow = { name: string; mass: number; power: number; effect: string };

function usable(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function setSwnStarshipText(
  snapshot: SwnStarshipSnapshot,
  field: SwnStarshipTextField,
  value: string,
): SwnStarshipSnapshot {
  return { ...snapshot, [field]: value };
}

export function setSwnStarshipNumber(
  snapshot: SwnStarshipSnapshot,
  field: SwnStarshipNumberField,
  value: number,
): SwnStarshipSnapshot {
  return { ...snapshot, [field]: usable(value) };
}

export function setSwnHullText(
  snapshot: SwnStarshipSnapshot,
  field: SwnHullTextField,
  value: string,
): SwnStarshipSnapshot {
  return { ...snapshot, hullType: { ...snapshot.hullType, [field]: value } };
}

export function setSwnHullNumber(
  snapshot: SwnStarshipSnapshot,
  field: SwnHullNumberField,
  value: number,
): SwnStarshipSnapshot {
  return { ...snapshot, hullType: { ...snapshot.hullType, [field]: usable(value) } };
}

/** The drive, which a ship has exactly one of and which a refit replaces. */
export function setSwnStarshipDriveField(
  snapshot: SwnStarshipSnapshot,
  field: 'name' | 'effect',
  value: string,
): SwnStarshipSnapshot {
  return { ...snapshot, drive: { ...snapshot.drive, [field]: value } };
}

export function setSwnStarshipDriveNumber(
  snapshot: SwnStarshipSnapshot,
  field: 'mass' | 'power' | 'cost',
  value: number,
): SwnStarshipSnapshot {
  return { ...snapshot, drive: { ...snapshot.drive, [field]: usable(value) } };
}

function replaceIn<T>(list: T[], index: number, entry: T): T[] {
  return list.map((current, at) => (at === index ? entry : current));
}

/** The text on one row of one allocation list: what it is called and what it does. */
export function setSwnAllocationText(
  snapshot: SwnStarshipSnapshot,
  list: SwnAllocationList,
  index: number,
  field: 'name' | 'effect',
  value: string,
): SwnStarshipSnapshot {
  const rows = snapshot[list] as AllocationRow[];
  if (index < 0 || index >= rows.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    [list]: replaceIn(rows, index, { ...rows[index], [field]: value }),
  };
}

/** What one row of the allocation draws from the ship's pools. */
export function setSwnAllocationNumber(
  snapshot: SwnStarshipSnapshot,
  list: SwnAllocationList,
  index: number,
  field: 'mass' | 'power' | 'cost',
  value: number,
): SwnStarshipSnapshot {
  const rows = snapshot[list] as AllocationRow[];
  if (index < 0 || index >= rows.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    [list]: replaceIn(rows, index, { ...rows[index], [field]: usable(value) }),
  };
}

/** A weapon's damage, which is the one field only that list has. */
export function setSwnWeaponDamage(
  snapshot: SwnStarshipSnapshot,
  index: number,
  value: string,
): SwnStarshipSnapshot {
  if (index < 0 || index >= snapshot.weapons.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    weapons: replaceIn(snapshot.weapons, index, { ...snapshot.weapons[index], damage: value }),
  };
}

/**
 * A weapon's qualities, as the comma-separated list the sheet prints.
 *
 * Parsed here rather than in the editor so the splitting rule has one home and a test. An empty
 * field is no qualities, which is what an unqualified weapon has, rather than one blank quality.
 */
export function setSwnWeaponQualities(
  snapshot: SwnStarshipSnapshot,
  index: number,
  value: string,
): SwnStarshipSnapshot {
  if (index < 0 || index >= snapshot.weapons.length) {
    return snapshot;
  }
  const qualities = value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
  return {
    ...snapshot,
    weapons: replaceIn(snapshot.weapons, index, { ...snapshot.weapons[index], qualities }),
  };
}

/**
 * Take one thing off the ship.
 *
 * The budget totals are deliberately left where they were. Stripping a hardpoint does not by itself
 * say what the freed mass is now doing, and 4.2 makes the payload authoritative; the recompute
 * below is how a user says "and settle up".
 */
export function removeSwnAllocationRow(
  snapshot: SwnStarshipSnapshot,
  list: SwnAllocationList,
  index: number,
): SwnStarshipSnapshot {
  const rows = snapshot[list] as AllocationRow[];
  if (index < 0 || index >= rows.length) {
    return snapshot;
  }
  return { ...snapshot, [list]: rows.filter((_row, at) => at !== index) };
}

/** A blank row for a user to fill in, in the shape the list it joins expects. */
function blankRow(list: SwnAllocationList): Weapon | DefenseFitting | Fitting {
  const base = {
    name: '',
    fittingType: list === 'weapons' ? 'weapon' : list === 'defenses' ? 'defense' : 'fitting',
    cost: 0,
    costExpands: false,
    power: 0,
    powerExpands: false,
    mass: 0,
    massExpands: false,
    minimumClass: 0,
    maximumClass: 4,
    effect: '',
  };
  if (list === 'weapons') {
    return { ...base, damage: '', hardPoints: 1, hullClass: 0, TL: 4, qualities: [] } as Weapon;
  }
  if (list === 'defenses') {
    return { ...base, hullClass: 0 } as DefenseFitting;
  }
  return base as Fitting;
}

/** Bolt something new on: a refit is a thing a referee does, and 4.4 says one part at a time. */
export function addSwnAllocationRow(
  snapshot: SwnStarshipSnapshot,
  list: SwnAllocationList,
): SwnStarshipSnapshot {
  const rows = snapshot[list] as AllocationRow[];
  return { ...snapshot, [list]: [...rows, blankRow(list) as unknown as AllocationRow] };
}

/** What the allocation on a ship's sheet actually draws from its three pools. */
export type SwnStarshipBudget = {
  usedMass: number;
  usedPower: number;
  usedHardPoints: number;
};

function sum(rows: { mass?: number; power?: number }[], field: 'mass' | 'power'): number {
  return rows.reduce((total, row) => total + usable(row[field] ?? 0), 0);
}

/**
 * The budget as the allocation adds up, without applying it.
 *
 * The drive counts, because it sits on the ship and draws mass and power like everything else.
 * Hardpoints come from the weapons alone: nothing else on a SWN ship consumes one.
 *
 * Separated from the setter below so the editor can show a user what the recompute *would* say
 * before they take it, which is the difference between an explicit command and a surprise.
 */
export function swnStarshipBudgetFromAllocation(snapshot: SwnStarshipSnapshot): SwnStarshipBudget {
  const drawing: { mass?: number; power?: number }[] = [
    snapshot.drive as DriveFitting,
    ...snapshot.fittings,
    ...snapshot.weapons,
    ...snapshot.defenses,
  ];
  return {
    usedMass: sum(drawing, 'mass'),
    usedPower: sum(drawing, 'power'),
    usedHardPoints: snapshot.weapons.reduce(
      (total, weapon) => total + usable(weapon.hardPoints ?? 0),
      0,
    ),
  };
}

/**
 * Settle the three budget lines against what the ship is actually carrying.
 *
 * The explicit command, and the only thing here that changes a field the user did not type into.
 * Offered rather than done automatically for the reason at the top of this module: the totals are a
 * referee's to state, and the table's own multipliers mean a hand-built refit will not always agree
 * with a naive sum. What this promises is arithmetic on demand, not a correction.
 */
export function swnStarshipWithRecomputedBudget(
  snapshot: SwnStarshipSnapshot,
): SwnStarshipSnapshot {
  return { ...snapshot, ...swnStarshipBudgetFromAllocation(snapshot) };
}
