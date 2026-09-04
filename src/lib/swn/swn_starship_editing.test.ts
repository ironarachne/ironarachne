import { describe, expect, it } from 'vitest';

import {
  addSwnAllocationRow,
  removeSwnAllocationRow,
  setSwnAllocationNumber,
  setSwnAllocationText,
  setSwnHullNumber,
  setSwnHullText,
  setSwnStarshipDriveField,
  setSwnStarshipDriveNumber,
  setSwnStarshipNumber,
  setSwnStarshipText,
  setSwnWeaponDamage,
  setSwnWeaponQualities,
  swnStarshipBudgetFromAllocation,
  swnStarshipWithRecomputedBudget,
} from './swn_starship_editing';
import { rollSwnStarshipSnapshot } from './swn_starship_roll';
import type { SwnStarshipSnapshot } from './swn_starship_snapshot';

/** A patroller: armed, so every one of the three allocation lists has something in it. */
function armedShip(): SwnStarshipSnapshot {
  for (let index = 0; index < 200; index += 1) {
    const ship = rollSwnStarshipSnapshot(`armed-${index}`);
    if (ship.weapons.length > 0 && ship.defenses.length > 0 && ship.fittings.length > 0) {
      return ship;
    }
  }
  throw new Error('no armed ship in 200 seeds');
}

const SHIP = armedShip();

describe('the identity fields', () => {
  it('rewrites one without disturbing the rest', () => {
    const renamed = setSwnStarshipText(SHIP, 'name', 'Cold Comfort');

    expect(renamed.name).toBe('Cold Comfort');
    expect(renamed.className).toBe(SHIP.className);
    expect(renamed.fittings).toEqual(SHIP.fittings);
    expect(SHIP.name).not.toBe('Cold Comfort');
  });

  it('lets the owner type be corrected as text', () => {
    expect(setSwnStarshipText(SHIP, 'ownerTypeName', 'privateer').ownerTypeName).toBe('privateer');
  });
});

describe('the numbers', () => {
  it('takes a whole number and leaves everything else alone', () => {
    const changed = setSwnStarshipNumber(SHIP, 'currentCrew', 14);

    expect(changed.currentCrew).toBe(14);
    expect(changed.totalCost).toBe(SHIP.totalCost);
  });

  it('reads an emptied number field as zero rather than as NaN', () => {
    // `valueAsNumber` on a cleared input is NaN, which would be stored and then printed.
    expect(setSwnStarshipNumber(SHIP, 'tonsOfCargo', Number.NaN).tonsOfCargo).toBe(0);
  });

  it('does not move a budget total when a hull pool changes', () => {
    // Requirement 4.2: a referee who has written a used-mass figure down has made a decision.
    const changed = setSwnHullNumber(SHIP, 'mass', SHIP.hullType.mass + 10);

    expect(changed.hullType.mass).toBe(SHIP.hullType.mass + 10);
    expect(changed.usedMass).toBe(SHIP.usedMass);
  });

  it('rewrites the hull text', () => {
    expect(setSwnHullText(SHIP, 'crewSkill', 'Pilot-2').hullType.crewSkill).toBe('Pilot-2');
  });
});

describe('the drive', () => {
  it('is renamed and re-rated without touching the budget', () => {
    const refit = setSwnStarshipDriveNumber(
      setSwnStarshipDriveField(SHIP, 'name', 'Spike Drive-6'),
      'mass',
      4,
    );

    expect(refit.drive.name).toBe('Spike Drive-6');
    expect(refit.drive.mass).toBe(4);
    expect(refit.usedMass).toBe(SHIP.usedMass);
  });
});

describe('the allocation', () => {
  it('renames one row of one list', () => {
    const changed = setSwnAllocationText(SHIP, 'fittings', 0, 'name', 'Smuggler Hold');

    expect(changed.fittings[0].name).toBe('Smuggler Hold');
    expect(changed.fittings.slice(1)).toEqual(SHIP.fittings.slice(1));
    expect(changed.weapons).toEqual(SHIP.weapons);
  });

  it('re-rates one row of one list', () => {
    const changed = setSwnAllocationNumber(SHIP, 'defenses', 0, 'power', 9);

    expect(changed.defenses[0].power).toBe(9);
    expect(changed.usedPower).toBe(SHIP.usedPower);
  });

  it('ignores an index that is not there', () => {
    expect(setSwnAllocationText(SHIP, 'weapons', 99, 'name', 'x')).toBe(SHIP);
    expect(setSwnAllocationNumber(SHIP, 'weapons', -1, 'mass', 1)).toBe(SHIP);
    expect(removeSwnAllocationRow(SHIP, 'weapons', 99)).toBe(SHIP);
  });

  it('takes one thing off the ship and leaves the totals where they were', () => {
    const stripped = removeSwnAllocationRow(SHIP, 'weapons', 0);

    expect(stripped.weapons.length).toBe(SHIP.weapons.length - 1);
    expect(stripped.usedHardPoints).toBe(SHIP.usedHardPoints);
  });

  it('bolts a blank row on in the shape its list expects', () => {
    const refitted = addSwnAllocationRow(SHIP, 'weapons');
    const added = refitted.weapons[refitted.weapons.length - 1];

    expect(refitted.weapons.length).toBe(SHIP.weapons.length + 1);
    expect(added.name).toBe('');
    expect(added.qualities).toEqual([]);
    expect(added.damage).toBe('');
    expect(addSwnAllocationRow(SHIP, 'fittings').fittings.at(-1)?.fittingType).toBe('fitting');
  });
});

describe('a weapon', () => {
  it('has its damage rewritten', () => {
    expect(setSwnWeaponDamage(SHIP, 0, '4d6').weapons[0].damage).toBe('4d6');
    expect(setSwnWeaponDamage(SHIP, 99, '4d6')).toBe(SHIP);
  });

  it('parses its qualities from the comma-separated list the sheet prints', () => {
    expect(setSwnWeaponQualities(SHIP, 0, 'AP 20, Flak , Ammo 5').weapons[0].qualities).toEqual([
      'AP 20',
      'Flak',
      'Ammo 5',
    ]);
  });

  it('reads an emptied qualities field as no qualities, not one blank one', () => {
    expect(setSwnWeaponQualities(SHIP, 0, '  ,  ').weapons[0].qualities).toEqual([]);
    expect(setSwnWeaponQualities(SHIP, 99, 'AP 10')).toBe(SHIP);
  });
});

describe('the budget recompute', () => {
  it('adds up the drive, the fittings, the weapons and the defenses', () => {
    const settled = swnStarshipBudgetFromAllocation(SHIP);
    const expectedMass = [SHIP.drive, ...SHIP.fittings, ...SHIP.weapons, ...SHIP.defenses].reduce(
      (total, row) => total + row.mass,
      0,
    );

    expect(settled.usedMass).toBe(expectedMass);
    expect(settled.usedHardPoints).toBe(
      SHIP.weapons.reduce((total, weapon) => total + weapon.hardPoints, 0),
    );
  });

  it('changes nothing until it is asked for', () => {
    // The whole point of the explicit command: re-rating a fitting moves what the sum *would* say
    // and leaves the stored total exactly where the referee left it.
    const rerated = setSwnAllocationNumber(SHIP, 'fittings', 0, 'mass', SHIP.hullType.mass + 99);

    expect(swnStarshipBudgetFromAllocation(rerated).usedMass).toBeGreaterThan(SHIP.usedMass);
    expect(rerated.usedMass).toBe(SHIP.usedMass);
  });

  it('applies the sum when it is', () => {
    const stripped = removeSwnAllocationRow(SHIP, 'weapons', 0);
    const settled = swnStarshipWithRecomputedBudget(stripped);

    expect(settled.usedMass).toBe(swnStarshipBudgetFromAllocation(stripped).usedMass);
    expect(settled.usedHardPoints).toBeLessThan(SHIP.usedHardPoints);
    expect(settled.fittings).toEqual(stripped.fittings);
  });

  it('survives a row that lost its numbers', () => {
    // A hand-edited payload may hold a row with no mass at all. It counts as nothing rather than
    // turning the whole budget into NaN.
    const broken = {
      ...SHIP,
      fittings: [{ name: 'Ghost' }],
      weapons: [],
      defenses: [],
    } as unknown as SwnStarshipSnapshot;

    expect(swnStarshipBudgetFromAllocation(broken).usedMass).toBe(SHIP.drive.mass);
  });
});
