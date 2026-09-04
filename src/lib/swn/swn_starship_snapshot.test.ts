import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { rollSwnStarship } from './swn_starship_roll';
import {
  swnOwnerTypeByName,
  swnStarshipFromSnapshot,
  swnStarshipFromSnapshotWithRng,
  toSwnStarshipSnapshot,
} from './swn_starship_snapshot';

const SHIP = rollSwnStarship('snapshot-seed');
const SNAPSHOT = toSwnStarshipSnapshot(SHIP);

describe('toSwnStarshipSnapshot', () => {
  it('stores the owner type by name rather than whole', () => {
    // The one field the live shape holds that the stored one cannot: an OwnerType carries
    // getRandomClassName and getRandomShipName, and structuredClone refuses a function.
    expect(SNAPSHOT.ownerTypeName).toBe(SHIP.ownerType.name);
    expect(SNAPSHOT).not.toHaveProperty('ownerType');
  });

  it('is storable, which is the whole reason the owner type is reduced', () => {
    expect(() => structuredClone(SNAPSHOT)).not.toThrow();
    expect(() => structuredClone(SHIP)).toThrow();
  });

  it('keeps the allocation beside the totals it was derived from', () => {
    // Decision 5 of docs/readiness-objects.md. The totals because 4.2 makes the payload
    // authoritative, the allocation because an editor cannot offer back what it cannot read.
    expect(SNAPSHOT.usedMass).toBe(SHIP.usedMass);
    expect(SNAPSHOT.usedPower).toBe(SHIP.usedPower);
    expect(SNAPSHOT.usedHardPoints).toBe(SHIP.usedHardPoints);
    expect(SNAPSHOT.fittings).toEqual(SHIP.fittings);
    expect(SNAPSHOT.weapons).toEqual(SHIP.weapons);
    expect(SNAPSHOT.defenses).toEqual(SHIP.defenses);
    expect(SNAPSHOT.drive).toEqual(SHIP.drive);
  });

  it('hands back a fresh top level, so an editor cannot write into the page', () => {
    expect(SNAPSHOT.hullType).not.toBe(SHIP.hullType);
    expect(SNAPSHOT.fittings).not.toBe(SHIP.fittings);
  });
});

describe('the round trip', () => {
  // Requirement 7.2, over a spread of seeds rather than one, because a ship's shape varies with
  // its owner type: an unarmed merchant has no weapons and a patroller has two.
  it('is lossless for every field a sheet is printed from', () => {
    for (let index = 0; index < 25; index += 1) {
      const ship = rollSwnStarship(`round-trip-${index}`);
      const restored = swnStarshipFromSnapshot(toSwnStarshipSnapshot(ship));

      expect(restored.name).toBe(ship.name);
      expect(restored.className).toBe(ship.className);
      expect(restored.manufacturer).toBe(ship.manufacturer);
      expect(restored.ownerType.name).toBe(ship.ownerType.name);
      expect(restored.hullType).toEqual(ship.hullType);
      expect(restored.currentCrew).toBe(ship.currentCrew);
      expect(restored.totalCost).toBe(ship.totalCost);
      expect(restored.tonsOfCargo).toBe(ship.tonsOfCargo);
      expect(restored.usedMass).toBe(ship.usedMass);
      expect(restored.usedPower).toBe(ship.usedPower);
      expect(restored.usedHardPoints).toBe(ship.usedHardPoints);
      expect(restored.weapons).toEqual(ship.weapons);
      expect(restored.defenses).toEqual(ship.defenses);
      expect(restored.fittings).toEqual(ship.fittings);
      expect(restored.drive).toEqual(ship.drive);
    }
  });

  it('resolves the owner type back to the shared table entry', () => {
    const restored = swnStarshipFromSnapshot(SNAPSHOT);

    expect(restored.ownerType.getRandomShipName).toBeTypeOf('function');
    expect(restored.ownerType.possibleHullTypes).toEqual(SHIP.ownerType.possibleHullTypes);
  });

  it('draws nothing from the RNG the registry hands it', () => {
    // A stored ship is finished. Drawing on the way back would be regenerating over a user's edits.
    const rng = new RNG('unused');
    const first = swnStarshipFromSnapshotWithRng(SNAPSHOT, rng);
    const second = swnStarshipFromSnapshotWithRng(SNAPSHOT, rng);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('swnOwnerTypeByName', () => {
  it('finds an owner type the table declares', () => {
    expect(swnOwnerTypeByName('pirate').name).toBe('pirate');
    expect(swnOwnerTypeByName('pirate').isArmed).toBe(true);
  });

  it('keeps a name this build no longer has rather than losing the ship', () => {
    // An owner type is a category the tables may rename between releases. The ship it describes is
    // still a ship, so the stand-in keeps the stored name and borrows the first entry's rules.
    const unknown = swnOwnerTypeByName('privateer flotilla');

    expect(unknown.name).toBe('privateer flotilla');
    expect(unknown.getRandomShipName).toBeTypeOf('function');
  });
});
