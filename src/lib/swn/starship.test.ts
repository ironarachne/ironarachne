import { describe, expect, it } from 'vitest';
import * as RNG from '@ironarachne/rng';
import { SWNStarship, formatAsText, generate } from './starship';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function shipsFrom(count: number) {
  return Array.from({ length: count }, (_, i) => generate(new RNG.RNG('seed-' + i)));
}

describe('generate', () => {
  // Compared through their serialised form rather than with toEqual, because OwnerType carries
  // getRandomShipName/getRandomClassName as function properties built fresh on every call. Those
  // closures never compare equal by identity, so toEqual would fail on two identical ships.
  it('is reproducible from a seed', () => {
    const first = generate(new RNG.RNG('seed-a'));
    const second = generate(new RNG.RNG('seed-a'));

    expect(JSON.parse(JSON.stringify(first))).toEqual(JSON.parse(JSON.stringify(second)));
    expect(formatAsText(first)).toBe(formatAsText(second));
  });

  it('stays reproducible across many seeds', () => {
    for (let i = 0; i < 50; i++) {
      const seed = 'repeat-' + i;

      expect(formatAsText(generate(new RNG.RNG(seed)))).toBe(
        formatAsText(generate(new RNG.RNG(seed))),
      );
    }
  });

  it('varies with the seed', () => {
    const names = new Set(seeds.map((seed) => generate(new RNG.RNG(seed)).name));

    expect(names.size).toBeGreaterThan(1);
  });

  it('returns a fully populated starship', () => {
    for (const seed of seeds) {
      const ship = generate(new RNG.RNG(seed));

      expect(ship).toBeInstanceOf(SWNStarship);
      expect(ship.name.length).toBeGreaterThan(0);
      expect(ship.className.length).toBeGreaterThan(0);
      expect(ship.manufacturer.length).toBeGreaterThan(0);
      expect(ship.hullType.name.length).toBeGreaterThan(0);
      expect(ship.ownerType.name.length).toBeGreaterThan(0);
      expect(ship.drive.name.length).toBeGreaterThan(0);
    }
  });

  // Regression: a class 0 hull that spent its budget on a drive upgrade left no weapon
  // affordable, and rng.item of the resulting empty list threw. 230 of 50000 seeds aborted.
  it('never throws across a wide sweep of seeds', () => {
    const failures: string[] = [];

    for (let i = 0; i < 20000; i++) {
      try {
        generate(new RNG.RNG('sweep-' + i));
      } catch (error) {
        failures.push(`sweep-${i}: ${(error as Error).message}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('crews the ship within the hull’s stated limits', () => {
    for (const ship of shipsFrom(200)) {
      expect(ship.currentCrew).toBeGreaterThanOrEqual(ship.hullType.crewMinimum);
      expect(ship.currentCrew).toBeLessThanOrEqual(ship.hullType.crewMaximum);
    }
  });

  it('never spends more hardpoints than the hull provides', () => {
    for (const ship of shipsFrom(200)) {
      expect(ship.usedHardPoints).toBeLessThanOrEqual(ship.hullType.hardPoints);
    }
  });

  // DEFECT: the required-fitting block subtracts mass and power from the budget unconditionally,
  // without first checking the fitting fits. A small hull whose owner type mandates a bulky
  // fitting therefore overspends its own hull. Roughly 1% of ships, and only ever owners that
  // have a required fitting — smuggler, mining ship and merchant.
  it('overspends the hull’s mass only for owners with a required fitting', () => {
    const overspent = shipsFrom(2000).filter((ship) => ship.usedMass > ship.hullType.mass);

    expect(overspent.length).toBeGreaterThan(0);
    for (const ship of overspent) {
      expect(ship.ownerType.requiredFittingType.length).toBeGreaterThan(0);
      expect(ship.fittings.length).toBeGreaterThan(0);
    }
  });

  it('keeps the mass overspend to a small minority of ships', () => {
    const ships = shipsFrom(2000);
    const overspent = ships.filter((ship) => ship.usedMass > ship.hullType.mass);

    expect(overspent.length / ships.length).toBeLessThan(0.05);
  });

  it('never spends a negative amount', () => {
    for (const ship of shipsFrom(200)) {
      expect(ship.usedMass).toBeGreaterThanOrEqual(0);
      expect(ship.usedPower).toBeGreaterThanOrEqual(0);
      expect(ship.usedHardPoints).toBeGreaterThanOrEqual(0);
    }
  });

  it('costs at least the price of the bare hull', () => {
    for (const ship of shipsFrom(200)) {
      expect(ship.totalCost).toBeGreaterThanOrEqual(ship.hullType.cost);
    }
  });

  it('only arms ships whose owner type is armed', () => {
    for (const ship of shipsFrom(500)) {
      if (!ship.ownerType.isArmed) {
        expect(ship.weapons).toEqual([]);
        expect(ship.defenses).toEqual([]);
      }
    }
  });

  it('fits no more than two weapons', () => {
    for (const ship of shipsFrom(500)) {
      expect(ship.weapons.length).toBeLessThanOrEqual(2);
    }
  });

  it('never fits the same weapon or defense twice', () => {
    for (const ship of shipsFrom(500)) {
      const weaponNames = ship.weapons.map((weapon) => weapon.name);
      const defenseNames = ship.defenses.map((defense) => defense.name);

      expect(new Set(weaponNames).size).toBe(weaponNames.length);
      expect(new Set(defenseNames).size).toBe(defenseNames.length);
    }
  });

  it('only fits weapons and defenses the hull class permits', () => {
    for (const ship of shipsFrom(500)) {
      for (const weapon of ship.weapons) {
        expect(weapon.hullClass).toBeLessThanOrEqual(ship.hullType.hullClass);
      }
      for (const defense of ship.defenses) {
        expect(defense.hullClass).toBeLessThanOrEqual(ship.hullType.hullClass);
      }
    }
  });

  it('gives a system-only owner a system drive and no spike drive', () => {
    const systemOnly = shipsFrom(500).filter((ship) => ship.ownerType.systemOnly);

    expect(systemOnly.length).toBeGreaterThan(0);
    for (const ship of systemOnly) {
      expect(ship.drive.name).toBe('System Drive');
    }
  });

  it('gives every other owner a spike drive', () => {
    const spikers = shipsFrom(500).filter((ship) => !ship.ownerType.systemOnly);

    expect(spikers.length).toBeGreaterThan(0);
    for (const ship of spikers) {
      expect(ship.drive.name).toMatch(/^Spike Drive-\d$/);
    }
  });

  it('only carries cargo when the owner type fills with cargo', () => {
    for (const ship of shipsFrom(500)) {
      if (!ship.ownerType.fillWithCargo) {
        expect(ship.tonsOfCargo).toBe(0);
      }
    }
  });

  it('gives a cargo hauler cargo space among its fittings', () => {
    const haulers = shipsFrom(500).filter(
      (ship) => ship.ownerType.fillWithCargo && ship.tonsOfCargo > 0,
    );

    expect(haulers.length).toBeGreaterThan(0);
    for (const ship of haulers) {
      expect(ship.fittings.some((fitting) => fitting.name === 'Cargo space')).toBe(true);
    }
  });

  it('only picks a hull its owner type allows', () => {
    for (const ship of shipsFrom(500)) {
      expect(ship.ownerType.possibleHullTypes).toContain(ship.hullType.name);
    }
  });

  it('reaches every owner type and every hull type across enough seeds', () => {
    const ships = shipsFrom(1000);

    expect(new Set(ships.map((ship) => ship.ownerType.name)).size).toBe(8);
    expect(new Set(ships.map((ship) => ship.hullType.name)).size).toBe(10);
  });

  it('reaches all four hull classes', () => {
    const classes = new Set(shipsFrom(500).map((ship) => ship.hullType.hullClass));

    expect([...classes].sort()).toEqual([0, 1, 2, 3]);
  });

  it('never fits the same fitting twice', () => {
    for (const ship of shipsFrom(500)) {
      const names = ship.fittings.map((fitting) => fitting.name);

      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe('SWNStarship', () => {
  it('starts empty apart from its hull, owner and starter drive', () => {
    const ship = generate(new RNG.RNG('seed-a'));
    const fresh = new SWNStarship(ship.ownerType, ship.hullType);

    expect(fresh.name).toBe('');
    expect(fresh.className).toBe('');
    expect(fresh.manufacturer).toBe('');
    expect(fresh.currentCrew).toBe(0);
    expect(fresh.totalCost).toBe(0);
    expect(fresh.tonsOfCargo).toBe(0);
    expect(fresh.usedMass).toBe(0);
    expect(fresh.usedPower).toBe(0);
    expect(fresh.usedHardPoints).toBe(0);
    expect(fresh.weapons).toEqual([]);
    expect(fresh.defenses).toEqual([]);
    expect(fresh.fittings).toEqual([]);
    expect(fresh.drive.name).toBe('Spike Drive-1');
  });
});

describe('formatAsText', () => {
  const ship = generate(new RNG.RNG('seed-a'));
  const text = formatAsText(ship);

  it('includes the ship’s identity', () => {
    expect(text).toContain(ship.name);
    expect(text).toContain(ship.className);
    expect(text).toContain(ship.manufacturer);
    expect(text).toContain(ship.hullType.name);
    expect(text).toContain(ship.ownerType.name);
    expect(text).toContain(ship.drive.name);
  });

  it('includes each of the three sections', () => {
    expect(text).toContain('Fittings');
    expect(text).toContain('Weapons');
    expect(text).toContain('Defenses');
  });

  it('groups the thousands in the money figures', () => {
    expect(text).toContain(new Intl.NumberFormat('en-US').format(ship.totalCost));
    expect(text).toContain(new Intl.NumberFormat('en-US').format(ship.currentCrew * 43800));
  });

  it('lists every fitting, weapon and defense the ship carries', () => {
    for (const seed of seeds) {
      const subject = generate(new RNG.RNG(seed));
      const rendered = formatAsText(subject);

      for (const fitting of subject.fittings) {
        expect(rendered).toContain(fitting.name);
      }
      for (const weapon of subject.weapons) {
        expect(rendered).toContain(weapon.name);
      }
      for (const defense of subject.defenses) {
        expect(rendered).toContain(defense.name);
      }
    }
  });

  it('renders a ship with no weapons or defenses without breaking', () => {
    const bare = generate(new RNG.RNG('seed-a'));
    bare.weapons = [];
    bare.defenses = [];
    bare.fittings = [];

    const rendered = formatAsText(bare);

    expect(rendered).toContain('Weapons');
    expect(rendered).toContain('Defenses');
    expect(rendered).toContain(bare.name);
  });

  it('is stable for a given ship', () => {
    expect(formatAsText(ship)).toBe(text);
  });
});
