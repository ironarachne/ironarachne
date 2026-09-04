/**
 * Writing a Stars Without Number starship snapshot, and reading one back.
 *
 * **One field cannot be stored, and it is the reason this module is not the identity function the
 * character's snapshot is.** A `SWNStarship` carries its `ownerType` as a whole `OwnerType` from
 * the shared table, and an owner type holds two closures — `getRandomClassName` and
 * `getRandomShipName`. `structuredClone`, which IndexedDB stores with, refuses a function outright.
 * So the snapshot stores `ownerTypeName` and resolves it on read, in the shape AD&D stores a class
 * and `$lib/creatures` stores a species.
 *
 * **Everything else is stored, including the three derived budget totals.** `usedMass`,
 * `usedPower` and `usedHardPoints` are each the hull's pool less what the fittings drew from it, so
 * every one of them could be recomputed from `fittings`, `weapons` and `drive`. They stay because
 * requirement 4.2 makes the payload authoritative: a referee who has written a ship's used mass
 * down has made a decision, and a reader that quietly recalculated it would overrule them.
 * `swn_starship_editing.ts` offers the arithmetic as an explicit command instead.
 *
 * **And the allocation is stored beside the totals**, which is decision 5 of
 * `docs/readiness-objects.md`. The totals are what a sheet reads; the fittings, weapons and drive
 * are the decisions that produced them, and an editor cannot offer back a decision it cannot read.
 */

import type { RNG } from '@ironarachne/rng';

import type {
  DefenseFitting,
  DriveFitting,
  Fitting,
  HullType,
  OwnerType,
  SWNStarship,
  Weapon,
} from './starship.js';
import { OWNER_TYPES } from './starship_owner_type_data.js';

/**
 * A SWN starship as it is stored.
 *
 * The live shape with `ownerType` replaced by its name. Every other field is carried across as it
 * is: a hull type, a drive, a fitting, a weapon and a defense are all plain records of strings,
 * numbers and booleans, so there is nothing else to strip.
 */
export type SwnStarshipSnapshot = {
  name: string;
  className: string;
  manufacturer: string;
  /** The owner type by name, resolved against the table on read. */
  ownerTypeName: string;
  hullType: HullType;
  currentCrew: number;
  totalCost: number;
  tonsOfCargo: number;
  /** The three budget totals. Derived from the allocation below, and stored all the same. */
  usedMass: number;
  usedPower: number;
  usedHardPoints: number;
  /** The allocation: what the user's ship actually carries, which is what an editor offers back. */
  weapons: Weapon[];
  defenses: DefenseFitting[];
  fittings: Fitting[];
  drive: DriveFitting;
};

/** The owner type a ship falls back to when nothing else fits: the first the table declares. */
const FALLBACK_OWNER_TYPE = OWNER_TYPES[0];

/**
 * The owner type of that name, or a stand-in that keeps the name.
 *
 * A name this build no longer has is not a corrupt ship — an owner type is a category the tables
 * may rename between releases, and the ship it describes is still a ship. So the stand-in keeps the
 * stored name and borrows the first table entry's rules, including its naming closures. Nothing
 * calls those on a ship read back from storage: a stored ship is finished, and a re-roll goes from
 * the seed rather than from the payload. They are there so that the resolved value is a real
 * `OwnerType` rather than one with holes in it.
 */
export function swnOwnerTypeByName(name: string): OwnerType {
  const found = OWNER_TYPES.find((entry) => entry.name === name);
  return found ?? { ...FALLBACK_OWNER_TYPE, name };
}

/**
 * A ship as it is stored: a fresh top level, the owner type reduced to its name.
 *
 * Shallow over the lists, because nothing downstream writes into them — the editor replaces entries
 * rather than mutating them, and IndexedDB stores through `structuredClone`, which copies. What the
 * fresh top level buys is that a snapshot handed to a save control is not the object a page is
 * still rendering.
 */
export function toSwnStarshipSnapshot(starship: SWNStarship): SwnStarshipSnapshot {
  return {
    name: starship.name,
    className: starship.className,
    manufacturer: starship.manufacturer,
    ownerTypeName: starship.ownerType.name,
    hullType: { ...starship.hullType },
    currentCrew: starship.currentCrew,
    totalCost: starship.totalCost,
    tonsOfCargo: starship.tonsOfCargo,
    usedMass: starship.usedMass,
    usedPower: starship.usedPower,
    usedHardPoints: starship.usedHardPoints,
    weapons: [...starship.weapons],
    defenses: [...starship.defenses],
    fittings: [...starship.fittings],
    drive: { ...starship.drive },
  };
}

/**
 * A stored ship back into the live one the library works with.
 *
 * Nothing is recomputed and nothing is re-rolled. The one thing done on read is resolving the owner
 * type by name, which is the one field the stored form does not hold whole.
 */
export function swnStarshipFromSnapshot(snapshot: SwnStarshipSnapshot): SWNStarship {
  return {
    name: snapshot.name,
    className: snapshot.className,
    manufacturer: snapshot.manufacturer,
    ownerType: swnOwnerTypeByName(snapshot.ownerTypeName),
    hullType: { ...snapshot.hullType },
    currentCrew: snapshot.currentCrew,
    totalCost: snapshot.totalCost,
    tonsOfCargo: snapshot.tonsOfCargo,
    usedMass: snapshot.usedMass,
    usedPower: snapshot.usedPower,
    usedHardPoints: snapshot.usedHardPoints,
    weapons: [...snapshot.weapons],
    defenses: [...snapshot.defenses],
    fittings: [...snapshot.fittings],
    drive: { ...snapshot.drive },
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a ship is finished when it is stored, and drawing anything from a seed on the
 * way back would be regenerating over the user's edits.
 */
export function swnStarshipFromSnapshotWithRng(
  snapshot: SwnStarshipSnapshot,
  _rng: RNG,
): SWNStarship {
  return swnStarshipFromSnapshot(snapshot);
}
