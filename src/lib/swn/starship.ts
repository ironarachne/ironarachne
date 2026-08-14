import * as RNG from '@ironarachne/rng';
import * as Text from '$lib/format';
import { OWNER_TYPES } from './starship_owner_type_data';
import { STARSHIP_FITTINGS } from './starship_fitting_data';

export type SWNStarship = {
  name: string;
  className: string;
  manufacturer: string;
  hullType: HullType;
  currentCrew: number;
  totalCost: number;
  tonsOfCargo: number;
  usedMass: number;
  usedPower: number;
  usedHardPoints: number;
  ownerType: OwnerType;
  weapons: Weapon[];
  defenses: DefenseFitting[];
  fittings: Fitting[];
  drive: DriveFitting;
};

export function createSwnStarship(ownerType: OwnerType, hullType: HullType): SWNStarship {
  return {
    name: '',
    className: '',
    manufacturer: '',
    hullType,
    ownerType,
    currentCrew: 0,
    totalCost: 0,
    tonsOfCargo: 0,
    usedMass: 0,
    usedPower: 0,
    usedHardPoints: 0,
    weapons: [],
    defenses: [],
    fittings: [],
    drive: getStarterDrive(),
  };
}

/**
 * What a hull has left to spend. Every fitting phase draws the same three pools down, so they
 * are threaded through the build as one mutable record rather than as three separate counters.
 */
type ShipBudget = {
  mass: number;
  power: number;
  hardpoints: number;
};

/**
 * How much a bigger hull multiplies a fitting's table figures by. Only the figures whose
 * matching `*Expands` flag is set scale; the rest are flat whatever the hull.
 */
type ClassMultipliers = {
  cost: number;
  mass: number;
  power: number;
};

function hullClassMultipliers(hullClass: number): ClassMultipliers {
  if (hullClass === 1) {
    return { cost: 10, mass: 2, power: 2 };
  }

  if (hullClass === 2) {
    return { cost: 25, mass: 3, power: 3 };
  }

  if (hullClass === 3) {
    return { cost: 100, mass: 4, power: 4 };
  }

  return { cost: 1, mass: 1, power: 1 };
}

/** The subset of a fitting the multipliers act on; every fitting table row satisfies it. */
type ExpandableFitting = {
  cost: number;
  costExpands: boolean;
  mass: number;
  massExpands: boolean;
  power: number;
  powerExpands: boolean;
};

/** A fitting's cost, mass, and power once the hull's multipliers have been applied. */
function expandedCosts(fitting: ExpandableFitting, multipliers: ClassMultipliers) {
  return {
    cost: fitting.costExpands ? fitting.cost * multipliers.cost : fitting.cost,
    mass: fitting.massExpands ? fitting.mass * multipliers.mass : fitting.mass,
    power: fitting.powerExpands ? fitting.power * multipliers.power : fitting.power,
  };
}

/**
 * A system-only owner trades its spike drive for a small system drive, which is cheaper and
 * frees up the power and mass the spike drive would have taken.
 */
function installSystemDrive(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
): void {
  const systemDrive = createDriveFitting(
    'System Drive',
    0,
    0,
    0,
    0,
    3,
    'Replace spike drive with small system drive',
  );

  starship.hullType.cost = Math.floor(starship.hullType.cost * 0.9);

  starship.hullType.power += multipliers.power;
  starship.hullType.mass += multipliers.power * 2;
  starship.drive = systemDrive;

  budget.mass = starship.hullType.mass;
  budget.power = starship.hullType.power;
}

/**
 * Most ships keep their stock drive; roughly three in ten shop for a better one they can afford.
 *
 * The expanded costs are carried alongside the drive rather than recomputed after it is
 * chosen. They used to be worked out twice and differently: the affordability check applied each
 * multiplier only when the drive's matching `*Expands` flag was set, while the subtraction
 * applied all three unconditionally. A drive that does not expand was therefore checked at its
 * table cost and charged at the hull's multiple of it, which is a second way for a ship to spend
 * more than its hull has — one the measurements in #106 attributed to the required fitting.
 */
function installDriveUpgrade(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
  rng: RNG.RNG,
): void {
  const chanceOfDriveUpgrade = rng.int(1, 100);

  if (chanceOfDriveUpgrade <= 70) {
    return;
  }

  const drives = allDriveFittings()
    .map((drive) => ({ drive, ...expandedCosts(drive, multipliers) }))
    .filter(
      (option) =>
        option.drive.minimumClass <= starship.hullType.hullClass &&
        option.drive.maximumClass >= starship.hullType.hullClass &&
        option.power <= budget.power &&
        option.mass <= budget.mass,
    );

  if (drives.length === 0) {
    return;
  }

  const driveUpgrade = rng.item(drives);

  starship.fittings.push(driveUpgrade.drive);
  starship.drive = driveUpgrade.drive;

  budget.mass -= driveUpgrade.mass;
  budget.power -= driveUpgrade.power;
  starship.totalCost += driveUpgrade.cost;
}

function installDrive(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
  rng: RNG.RNG,
): void {
  if (starship.ownerType.systemOnly) {
    installSystemDrive(starship, budget, multipliers);
  } else {
    installDriveUpgrade(starship, budget, multipliers, rng);
  }
}

function affordableWeapons(starship: SWNStarship, budget: ShipBudget, weapons: Weapon[]): Weapon[] {
  return weapons.filter(
    (weapon) =>
      weapon.mass <= budget.mass &&
      weapon.power <= budget.power &&
      weapon.hardPoints <= budget.hardpoints &&
      weapon.hullClass <= starship.hullType.hullClass,
  );
}

function installWeapons(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
  rng: RNG.RNG,
): void {
  let possibleWeapons = affordableWeapons(starship, budget, allWeapons());

  const numberOfWeapons = rng.int(1, 2);

  for (let i = 0; i < numberOfWeapons; i++) {
    // The filter above can match nothing at all: a class 0 hull that spent its mass and power
    // on a drive upgrade has no budget left for any weapon in the table. rng.item of an empty
    // list is undefined, which threw on the next property access and aborted generation.
    if (possibleWeapons.length === 0) {
      break;
    }

    const newWeapon = rng.item(possibleWeapons);
    const costs = expandedCosts(newWeapon, multipliers);

    if (
      costs.mass <= budget.mass &&
      costs.power <= budget.power &&
      newWeapon.hardPoints <= budget.hardpoints &&
      newWeapon.hullClass <= starship.hullType.hullClass
    ) {
      starship.weapons.push(newWeapon);
      budget.mass -= costs.mass;
      budget.power -= costs.power;
      budget.hardpoints -= newWeapon.hardPoints;
      starship.totalCost += costs.cost;
    }

    possibleWeapons = removeFittingFromList(newWeapon, possibleWeapons);
  }
}

function installDefenses(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
  rng: RNG.RNG,
): void {
  let possibleDefenses = allDefenses().filter(
    (defense) => defense.hullClass <= starship.hullType.hullClass,
  );

  const numberOfDefenses = rng.int(0, 2);

  for (let i = 0; i < numberOfDefenses; i++) {
    const newDefense = rng.item(possibleDefenses) as DefenseFitting;
    const costs = expandedCosts(newDefense, multipliers);

    if (costs.mass <= budget.mass && costs.power <= budget.power) {
      starship.defenses.push(newDefense);
      budget.mass -= costs.mass;
      budget.power -= costs.power;
      starship.totalCost += costs.cost;
    }

    possibleDefenses = removeFittingFromList(newDefense, possibleDefenses);
  }
}

/**
 * The fitting an owner is defined by — cargo holds for a merchant, weapons for a patrol boat.
 *
 * The required fitting used to be fitted whatever it cost — the one place in this build that
 * spent the budget without checking it first. A mandated fitting on a small hull could push the
 * ship past its own mass or power, which the sheet then reported as using more than the hull
 * provides. Choosing among the options that fit keeps the fitting required wherever the hull can
 * pay for it; when none fits, the ship goes without rather than overloading.
 *
 * The costs are expanded before the filter rather than after, because the hull class multipliers
 * are what decide affordability: an expanding fitting is cheap in the table and not on a frigate.
 *
 * Returns the remaining options with the chosen fitting removed.
 */
function installRequiredFitting(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
  fittingOptions: Fitting[],
  rng: RNG.RNG,
): Fitting[] {
  const requiredFittingOptions = filterFittingsByHullClass(
    getFittingsByType(starship.ownerType.requiredFittingType),
    starship.hullType.hullClass,
  );

  const affordableRequiredFittings = requiredFittingOptions
    .map((fitting) => ({ fitting, ...expandedCosts(fitting, multipliers) }))
    .filter((option) => option.mass <= budget.mass && option.power <= budget.power);

  if (affordableRequiredFittings.length === 0) {
    return fittingOptions;
  }

  const required = rng.item(affordableRequiredFittings);

  starship.fittings.push(fittedCopy(required.fitting));
  budget.mass -= required.mass;
  budget.power -= required.power;
  starship.totalCost += required.cost;

  return removeFittingFromList(required.fitting, fittingOptions);
}

function installOptionalFittings(
  starship: SWNStarship,
  budget: ShipBudget,
  multipliers: ClassMultipliers,
  fittingOptions: Fitting[],
  rng: RNG.RNG,
): void {
  let options = fittingOptions;

  const maxNumberOfFittings = rng.int(1, 3);

  for (let i = 0; i < maxNumberOfFittings; i++) {
    const newFitting = rng.item(options);
    const costs = expandedCosts(newFitting, multipliers);

    if (costs.mass <= budget.mass && costs.power <= budget.power) {
      starship.fittings.push(fittedCopy(newFitting));
      budget.mass -= costs.mass;
      budget.power -= costs.power;
      starship.totalCost += costs.cost;
    }

    options = removeFittingFromList(newFitting, options);
  }
}

/** How many tons one unit of cargo mass is worth on a hull of this class. */
function tonsPerCargoUnit(hullClass: number): number {
  if (hullClass === 1) {
    return 20;
  }

  if (hullClass === 2) {
    return 200;
  }

  if (hullClass === 3) {
    return 2000;
  }

  return 2;
}

/**
 * An owner that hauls freight turns whatever mass is left into cargo space.
 *
 * Cargo is bought a whole mass unit at a time, and the budget left over need not be whole:
 * fittings that expand by half a unit are common on the larger hulls. Both spends below used
 * to ignore that — the first took a unit whenever anything at all remained, and the loop ran
 * `i < 3.5` for four iterations — so a ship with half a unit spare ended half a unit over.
 */
function fillRemainingMassWithCargo(starship: SWNStarship, budget: ShipBudget): number {
  if (!starship.ownerType.fillWithCargo || budget.mass <= 0) {
    return 0;
  }

  const tonsMultiplier = tonsPerCargoUnit(starship.hullType.hullClass);
  const alreadyHasCargo = starship.fittings.some((fitting) => fitting.name === 'Cargo space');

  let tonsOfCargo = alreadyHasCargo ? tonsMultiplier : 0;

  if (!alreadyHasCargo && budget.mass >= 1) {
    starship.fittings.push(
      createCargoFitting('Cargo space', 0, 0, 1, 0, 3, 'Pressurized cargo space'),
    );
    budget.mass--;
  }

  const numberOfCargoFittings = Math.floor(budget.mass);

  for (let i = 0; i < numberOfCargoFittings; i++) {
    tonsOfCargo += tonsMultiplier;
    budget.mass--;
  }

  return tonsOfCargo;
}

export function generate(rng: RNG.RNG): SWNStarship {
  const ownerType = randomStarshipOwnerType(rng);
  const hullType = randomHullType(ownerType, rng);
  const starship = createSwnStarship(ownerType, hullType);

  starship.name = starship.ownerType.getRandomShipName(rng);
  starship.className = starship.ownerType.getRandomClassName(rng);
  starship.manufacturer = randomManufacturerName(rng);
  starship.currentCrew = rng.int(starship.hullType.crewMinimum, starship.hullType.crewMaximum);

  const budget: ShipBudget = {
    mass: starship.hullType.mass,
    power: starship.hullType.power,
    hardpoints: starship.hullType.hardPoints,
  };

  const multipliers = hullClassMultipliers(starship.hullType.hullClass);

  // Read before the system drive discount below, which lowers the hull cost but not the total.
  starship.totalCost = starship.hullType.cost;

  installDrive(starship, budget, multipliers, rng);

  if (starship.ownerType.isArmed) {
    installWeapons(starship, budget, multipliers, rng);
    installDefenses(starship, budget, multipliers, rng);
  }

  const fittingOptions = filterFittingsByHullClass(
    getAllAppropriateFittings(starship.ownerType.allowedFittingTypes),
    starship.hullType.hullClass,
  );

  const remainingOptions = installRequiredFitting(
    starship,
    budget,
    multipliers,
    fittingOptions,
    rng,
  );

  installOptionalFittings(starship, budget, multipliers, remainingOptions, rng);

  starship.tonsOfCargo = fillRemainingMassWithCargo(starship, budget);

  starship.usedMass = starship.hullType.mass - budget.mass;
  starship.usedPower = starship.hullType.power - budget.power;
  starship.usedHardPoints = starship.hullType.hardPoints - budget.hardpoints;

  return starship;
}

function filterFittingsByHullClass(
  fittings: (Weapon | DefenseFitting | Fitting | CargoFitting)[],
  hullClass: number,
) {
  const result = [];

  for (let i = 0; i < fittings.length; i++) {
    if (fittings[i].minimumClass <= hullClass && fittings[i].maximumClass >= hullClass) {
      result.push(fittings[i]);
    }
  }

  return result;
}

function getAllAppropriateFittings(fittingTypes: string[]) {
  const all = allFittings();

  const fittings = [];

  for (let i = 0; i < all.length; i++) {
    if (fittingTypes.includes(all[i].fittingType)) {
      fittings.push(all[i]);
    }
  }

  return fittings;
}

export type HullType = {
  name: string;
  cost: number;
  speed: number;
  armor: number;
  hp: number;
  crewMinimum: number;
  crewMaximum: number;
  ac: number;
  power: number;
  mass: number;
  hardPoints: number;
  hullClass: number;
  hullClassName: string;
  crewSkill: string;
};

function hullClassName(hullClass: number): string {
  if (hullClass === 0) {
    return 'fighter';
  } else if (hullClass === 1) {
    return 'frigate';
  } else if (hullClass === 2) {
    return 'cruiser';
  } else if (hullClass === 3) {
    return 'capital';
  }

  return 'station';
}

export function createHullType(
  name: string,
  cost: number,
  speed: number,
  armor: number,
  hp: number,
  crewMinimum: number,
  crewMaximum: number,
  ac: number,
  power: number,
  mass: number,
  hardPoints: number,
  hullClass: number,
  crewSkill: string,
): HullType {
  return {
    name,
    cost,
    speed,
    armor,
    hp,
    crewMinimum,
    crewMaximum,
    ac,
    power,
    mass,
    hardPoints,
    hullClass,
    hullClassName: hullClassName(hullClass),
    crewSkill,
  };
}

function allHullTypes() {
  return [
    createHullType('strike fighter', 200000, 5, 5, 8, 1, 11, 16, 5, 2, 1, 0, '+2'),
    createHullType('shuttle', 200000, 3, 0, 15, 1, 10, 11, 3, 5, 1, 0, '+1'),
    createHullType('free merchant', 500000, 3, 2, 20, 1, 6, 14, 10, 15, 2, 1, '+1'),
    createHullType('patrol boat', 2500000, 4, 5, 25, 5, 20, 14, 15, 10, 4, 1, '+2'),
    createHullType('corvette', 4000000, 2, 10, 40, 10, 40, 13, 15, 15, 6, 1, '+2'),
    createHullType('heavy frigate', 7000000, 1, 10, 50, 30, 120, 15, 25, 20, 8, 1, '+2'),
    createHullType('bulk freighter', 5000000, 0, 0, 40, 10, 40, 11, 15, 25, 2, 2, '+1'),
    createHullType('fleet cruiser', 10000000, 1, 15, 60, 50, 200, 14, 50, 30, 10, 2, '+2'),
    createHullType('battleship', 50000000, 0, 20, 100, 200, 1000, 16, 75, 50, 15, 3, '+3'),
    createHullType('carrier', 60000000, 0, 10, 75, 300, 1500, 14, 50, 100, 4, 3, '+3'),
  ];
}

function getHullType(hullTypeName: string) {
  const types = allHullTypes();

  for (let i = 0; i < types.length; i++) {
    if (types[i].name === hullTypeName) {
      return types[i];
    }
  }

  return types[0];
}

function randomHullType(ownerType: OwnerType, rng: RNG.RNG) {
  return getHullType(rng.item(ownerType.possibleHullTypes));
}

export type OwnerType = {
  name: string;
  isArmed: boolean;
  systemOnly: boolean;
  possibleHullTypes: string[];
  getRandomClassName: (rng: RNG.RNG) => string;
  getRandomShipName: (rng: RNG.RNG) => string;
  requiredFittingType: string;
  fillWithCargo: boolean;
  allowedFittingTypes: string[];
};

export function createOwnerType(
  name: string,
  isArmed: boolean,
  systemOnly: boolean,
  possibleHullTypes: string[],
  getRandomClassName: (rng: RNG.RNG) => string,
  getRandomShipName: (rng: RNG.RNG) => string,
  requiredFittingType: string,
  fillWithCargo: boolean,
  allowedFittingTypes: string[],
): OwnerType {
  return {
    name,
    isArmed,
    systemOnly,
    possibleHullTypes,
    getRandomClassName,
    getRandomShipName,
    requiredFittingType,
    fillWithCargo,
    allowedFittingTypes,
  };
}

/**
 * Picks an owner type, and hands back the shared table entry rather than a copy.
 *
 * This one cannot be copied: an owner type carries `getRandomClassName` and `getRandomShipName`
 * closures, and `structuredClone` throws on functions. It lands on `starship.ownerType`, so treat
 * it as read-only — shuffling `possibleHullTypes` or `allowedFittingTypes` in place, for example,
 * would reorder that owner type for every ship generated afterwards.
 */
function randomStarshipOwnerType(rng: RNG.RNG): OwnerType {
  return rng.item(OWNER_TYPES);
}

export type DriveFitting = {
  name: string;
  // Its three siblings — CargoFitting, DefenseFitting, WeaponFitting — all carry one, and a drive
  // is pushed onto `starship.fittings` beside them. Without it the push needed a cast to Fitting,
  // which is what kept this gap invisible. Nothing selects on it: drives come from
  // `allDriveFittings`, which `getFittingsByType` never sees.
  fittingType: string;
  cost: number;
  costExpands: boolean;
  power: number;
  powerExpands: boolean;
  mass: number;
  massExpands: boolean;
  minimumClass: number;
  maximumClass: number;
  effect: string;
};

export function createDriveFitting(
  name: string,
  cost: number,
  power: number,
  mass: number,
  minimumClass: number,
  maximumClass: number,
  effect: string,
): DriveFitting {
  return {
    name,
    fittingType: 'drive',
    cost,
    costExpands: true,
    power,
    powerExpands: true,
    mass,
    massExpands: true,
    minimumClass,
    maximumClass,
    effect,
  };
}

function getStarterDrive() {
  return createDriveFitting('Spike Drive-1', 0, 1, 1, 0, 3, 'A class-1 spike drive');
}

function allDriveFittings() {
  return [
    createDriveFitting(
      'Spike Drive-2',
      10000,
      1,
      1,
      0,
      3,
      'Upgrade a spike drive to drive-2 rating',
    ),
    createDriveFitting(
      'Spike Drive-3',
      20000,
      2,
      2,
      0,
      3,
      'Upgrade a spike drive to drive-3 rating',
    ),
    createDriveFitting(
      'Spike Drive-4',
      40000,
      2,
      3,
      1,
      3,
      'Upgrade a spike drive to drive-4 rating',
    ),
    createDriveFitting(
      'Spike Drive-5',
      100000,
      3,
      3,
      1,
      3,
      'Upgrade a spike drive to drive-5 rating',
    ),
    createDriveFitting(
      'Spike Drive-6',
      500000,
      3,
      4,
      2,
      3,
      'Upgrade a spike drive to drive-6 rating',
    ),
  ];
}

function getFittingsByType(fittingType: string) {
  const all = allFittings();
  const result: Fitting[] = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].fittingType === fittingType) {
      result.push(all[i]);
    }
  }

  return result;
}

export type CargoFitting = {
  name: string;
  fittingType: string;
  cost: number;
  costExpands: boolean;
  power: number;
  powerExpands: boolean;
  mass: number;
  massExpands: boolean;
  minimumClass: number;
  maximumClass: number;
  effect: string;
};

export function createCargoFitting(
  name: string,
  cost: number,
  power: number,
  mass: number,
  minimumClass: number,
  maximumClass: number,
  effect: string,
): CargoFitting {
  return {
    name,
    fittingType: 'cargo',
    cost,
    costExpands: false,
    power,
    powerExpands: false,
    mass,
    massExpands: false,
    minimumClass,
    maximumClass,
    effect,
  };
}

export type Fitting = {
  name: string;
  fittingType: string;
  cost: number;
  costExpands: boolean;
  power: number;
  powerExpands: boolean;
  mass: number;
  massExpands: boolean;
  minimumClass: number;
  maximumClass: number;
  effect: string;
};

export function createFitting(
  name: string,
  fittingType: string,
  cost: number,
  costExpands: boolean,
  power: number,
  powerExpands: boolean,
  mass: number,
  massExpands: boolean,
  minimumClass: number,
  maximumClass: number,
  effect: string,
): Fitting {
  return {
    name,
    fittingType,
    cost,
    costExpands,
    power,
    powerExpands,
    mass,
    massExpands,
    minimumClass,
    maximumClass,
    effect,
  };
}

/**
 * The fitting table itself — shared and read-only.
 *
 * Nothing here alters a fitting, so the selection helpers may filter and sort this freely. What
 * they must not do is put a row from it straight onto a ship: a ship owns the fittings on its
 * sheet, so `fittedCopy` copies the chosen one on the way in.
 */
function allFittings(): Fitting[] {
  return STARSHIP_FITTINGS;
}

/**
 * A private copy of one fitting, for a ship to keep.
 *
 * Only the chosen row is copied. Cloning the whole table each time it was consulted cost far
 * more than it saved, since a ship keeps a handful of fittings out of thirty-seven.
 */
function fittedCopy(fitting: Fitting): Fitting {
  return structuredClone(fitting);
}

export type DefenseFitting = {
  name: string;
  fittingType: string;
  cost: number;
  costExpands: boolean;
  power: number;
  powerExpands: boolean;
  mass: number;
  massExpands: boolean;
  hullClass: number;
  minimumClass: number;
  maximumClass: number;
  effect: string;
};

export function createDefenseFitting(
  name: string,
  cost: number,
  power: number,
  mass: number,
  hullClass: number,
  effect: string,
): DefenseFitting {
  return {
    name,
    fittingType: 'defense',
    cost,
    costExpands: true,
    power,
    powerExpands: false,
    mass,
    massExpands: true,
    hullClass,
    minimumClass: hullClass,
    maximumClass: 4,
    effect,
  };
}

function allDefenses() {
  return [
    createDefenseFitting(
      'Ablative Hull Compartments',
      100000,
      5,
      2,
      3,
      '+1 AC, +20 maximum hit points',
    ),
    createDefenseFitting('Augmented Plating', 25000, 0, 1, 0, '+2 AC, -1 Speed'),
    createDefenseFitting(
      'Boarding Countermeasures',
      25000,
      2,
      1,
      1,
      'Makes enemy boarding more difficult',
    ),
    createDefenseFitting('Burst ECM Generator', 25000, 2, 1, 1, 'Negate one successful hit'),
    createDefenseFitting('Foxer Drones', 10000, 2, 1, 3, '+2 AC for one round when fired, Ammo 5'),
    createDefenseFitting(
      'Grav Eddy Displacer',
      50000,
      5,
      2,
      1,
      '1 in 6 chance of any given attack missing',
    ),
    createDefenseFitting(
      'Hardened Polyceramic Overlay',
      25000,
      0,
      1,
      0,
      'AP quality of attacking weapons reduced by 5',
    ),
    createDefenseFitting(
      'Planetary Defense Array',
      50000,
      4,
      2,
      1,
      'Anti-impact and anti-nuke surface defenses',
    ),
    createDefenseFitting(
      'Point Defense Lasers',
      10000,
      3,
      2,
      1,
      '+2 AC versus weapons that use ammo',
    ),
  ];
}

export type Weapon = {
  name: string;
  fittingType: string;
  cost: number;
  costExpands: boolean;
  damage: string;
  power: number;
  powerExpands: boolean;
  mass: number;
  massExpands: boolean;
  hardPoints: number;
  hullClass: number;
  minimumClass: number;
  maximumClass: number;
  TL: number;
  effect: string;
  qualities: string[];
};

export function createWeapon(
  name: string,
  cost: number,
  damage: string,
  power: number,
  mass: number,
  hardPoints: number,
  hullClass: number,
  TL: number,
  qualities: string[],
): Weapon {
  return {
    name,
    fittingType: 'weapon',
    cost,
    costExpands: false,
    damage,
    power,
    powerExpands: false,
    mass,
    massExpands: false,
    hardPoints,
    hullClass,
    minimumClass: hullClass,
    maximumClass: 4,
    TL,
    effect: 'Kills things',
    qualities,
  };
}

function allWeapons() {
  return [
    createWeapon('Multifocal Laser', 100000, '1d4', 5, 1, 1, 0, 4, ['AP 20']),
    createWeapon('Reaper Battery', 100000, '3d4', 4, 1, 1, 0, 4, ['Clumsy']),
    createWeapon('Fractal Impact Charge', 200000, '2d6', 5, 1, 1, 0, 4, ['AP 15', 'Ammo 4']),
    createWeapon('Polyspectral MES Beam', 2000000, '2d4', 5, 1, 1, 0, 5, ['AP 25']),
    createWeapon('Sandthrower', 50000, '2d4', 3, 1, 1, 0, 4, ['Flak']),
    createWeapon('Flak Emitter Battery', 500000, '2d6', 5, 3, 1, 1, 4, ['AP 10', 'Flak']),
    createWeapon('Torpedo Launcher', 500000, '3d8', 10, 3, 1, 1, 4, ['AP 20', 'Ammo 4']),
    createWeapon('Charged Particle Caster', 800000, '3d6', 10, 1, 2, 1, 4, ['AP 15', 'Clumsy']),
    createWeapon('Plasma Beam', 700000, '3d6', 5, 2, 2, 1, 4, ['AP 10']),
    createWeapon('Mag Spike Array', 1000000, '2d6+2', 5, 2, 2, 0, 4, ['AP 10', 'Flak', 'Ammo 5']),
    createWeapon('Nuclear Missiles', 50000, 'Special', 5, 1, 2, 0, 4, ['Ammo 5']),
    createWeapon('Spinal Beam Cannon', 1500000, '3d10', 10, 5, 3, 2, 4, ['AP 15', 'Clumsy']),
    createWeapon('Smart Cloud', 2000000, '3d10', 10, 5, 2, 2, 4, ['Cloud', 'Clumsy']),
    createWeapon('Gravcannon', 2000000, '4d6', 15, 4, 3, 2, 4, ['AP 20']),
    createWeapon('Spike Inversion Projector', 2500000, '3d8', 10, 3, 3, 2, 4, ['AP 15']),
    createWeapon('Vortex Tunnel Inductor', 5000000, '3d20', 20, 10, 4, 3, 4, ['AP 20', 'Clumsy']),
    createWeapon('Mass Cannon', 5000000, '2d20', 10, 5, 4, 3, 4, ['AP 20', 'Ammo 4']),
    createWeapon('Lightning Charge Mantle', 4000000, '1d20', 15, 5, 2, 3, 4, ['AP 5', 'Cloud']),
    createWeapon('Singularity Gun', 20000000, '5d20', 25, 10, 5, 3, 5, ['AP 25']),
  ];
}

function randomManufacturerName(rng: RNG.RNG) {
  const nameTypes = [
    {
      generate: (rng: RNG.RNG) => {
        const prefix = rng.item([
          'Aether',
          'Kurich',
          'Bulior',
          'Bulloch',
          'Andromeda',
          'Astrogator',
          'Galadyne',
          'Guidenhauser',
          'Legends',
          'Blueshift',
          'Redshift',
          'Andaria',
          'Pax',
          'Interstellar',
        ]);

        const suffix = rng.item(['Corporation', 'Limited', 'Technologies', 'Fleet Systems']);

        return `${prefix} ${suffix}`;
      },
    },
    {
      generate: (rng: RNG.RNG) => {
        const pre1 = rng.item([
          'Xa',
          'Ka',
          'Ga',
          'La',
          'Na',
          'Sa',
          'Xo',
          'Ko',
          'Go',
          'Lo',
          'So',
          'Xe',
          'Ke',
          'Ge',
          'Le',
          'Se',
          'Xi',
          'Ki',
          'Gi',
          'Li',
          'Si',
        ]);

        const pre2 = rng.item([
          'la',
          'ka',
          'ra',
          'sa',
          'na',
          'pa',
          'le',
          'ke',
          're',
          'se',
          'ne',
          'pe',
          'li',
          'ki',
          'ri',
          'si',
          'ni',
          'pi',
          'lo',
          'ko',
          'ro',
          'so',
          'no',
          'po',
          'lu',
          'ku',
          'ru',
          'su',
          'nu',
          'pu',
        ]);

        const suffix = rng.item(['dyne', 'tech', 'tronics', 'flux']);

        return pre1 + pre2 + suffix;
      },
    },
  ];

  const nameType = rng.item(nameTypes);

  return nameType.generate(rng);
}

/**
 * Every fitting list is narrowed the same way — drop everything sharing the chosen fitting's
 * name so it cannot be picked twice — so one generic filter serves weapons, defenses, and
 * fittings alike, and each caller keeps the element type it started with.
 */
function removeFittingFromList<T extends { name: string }>(
  fitting: { name: string },
  fittings: T[],
): T[] {
  return fittings.filter((candidate) => candidate.name !== fitting.name);
}

export function formatAsText(starship: SWNStarship) {
  let description = Text.header(starship.name);

  description += `Owner Type: ${starship.ownerType.name}\n`;
  description += `Manufacturer: ${starship.manufacturer}\n`;
  description += `Model: ${starship.className}\n`;
  description += `Hull Type: ${starship.hullType.name}\n`;
  description += `Hull Class: ${starship.hullType.hullClassName}\n`;
  description += `Drive: ${starship.drive.name}\n`;
  description += `Maximum Mass: ${starship.hullType.mass}\n`;
  description += `Mass Used: ${starship.usedMass}\n`;
  description += `Maximum Power: ${starship.hullType.power}\n`;
  description += `Power Used: ${starship.usedPower}\n`;
  description += `AC: ${starship.hullType.ac}\n`;
  description += `HP: ${starship.hullType.hp}\n`;
  description += `Minimum Crew: ${starship.hullType.crewMinimum}\n`;
  description += `Maximum Crew: ${starship.hullType.crewMaximum}\n`;
  description += `Current Crew: ${starship.currentCrew}\n`;
  description +=
    'Total Ship Value: ' + new Intl.NumberFormat('en-US').format(starship.totalCost) + ' credits\n';
  description +=
    'Total Crew Cost: ' +
    new Intl.NumberFormat('en-US').format(starship.currentCrew * 43800) +
    ' credits per year\n';
  description += `Crew Skill: ${starship.hullType.crewSkill}\n`;
  description += `Cargo Space: ${starship.tonsOfCargo} tons\n`;

  const fittings = [];

  for (let i = 0; i < starship.fittings.length; i++) {
    const fitting = `${starship.fittings[i].name}: ${starship.fittings[i].effect}`;
    fittings.push(fitting);
  }

  description += Text.header('Fittings');

  description += Text.list(fittings);

  const weapons = [];

  for (let i = 0; i < starship.weapons.length; i++) {
    const weapon =
      starship.weapons[i].name +
      ': ' +
      starship.weapons[i].damage +
      ' damage, ' +
      starship.weapons[i].qualities.join(', ');
    weapons.push(weapon);
  }

  description += Text.header('Weapons');

  description += Text.list(weapons);

  const defenses = [];

  for (let i = 0; i < starship.defenses.length; i++) {
    const defense = `${starship.defenses[i].name}: ${starship.defenses[i].effect}`;
    defenses.push(defense);
  }

  description += Text.header('Defenses');

  description += Text.list(defenses);

  return description;
}
