import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Text from "../format/text.js";

import random from "random";

export class SWNStarship {
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

  constructor(ownerType: OwnerType, hullType: HullType) {
    this.name = "";
    this.className = "";
    this.manufacturer = "";
    this.hullType = hullType;
    this.ownerType = ownerType;
    this.currentCrew = 0;
    this.totalCost = 0;
    this.tonsOfCargo = 0;
    this.usedMass = 0;
    this.usedPower = 0;
    this.usedHardPoints = 0;
    this.weapons = [];
    this.defenses = [];
    this.fittings = [];
    this.drive = getStarterDrive();
  }
}

export function generate() {
  const ownerType = randomStarshipOwnerType();
  const hullType = randomHullType(ownerType);
  const starship = new SWNStarship(ownerType, hullType);

  starship.name = starship.ownerType.getRandomShipName();
  starship.className = starship.ownerType.getRandomClassName();
  starship.manufacturer = randomManufacturerName();
  starship.currentCrew = random.int(starship.hullType.crewMinimum, starship.hullType.crewMaximum);

  let massBudget = starship.hullType.mass;
  let powerBudget = starship.hullType.power;
  let hardpointBudget = starship.hullType.hardPoints;

  let costMultiplier = 1;
  let massMultiplier = 1;
  let powerMultiplier = 1;

  starship.totalCost = starship.hullType.cost;

  if (starship.hullType.hullClass === 1) {
    costMultiplier = 10;
    powerMultiplier = 2;
    massMultiplier = 2;
  } else if (starship.hullType.hullClass === 2) {
    costMultiplier = 25;
    powerMultiplier = 3;
    massMultiplier = 3;
  } else if (starship.hullType.hullClass === 3) {
    costMultiplier = 100;
    powerMultiplier = 4;
    massMultiplier = 4;
  }

  if (starship.ownerType.systemOnly) {
    const systemDrive = new DriveFitting(
      "System Drive",
      0,
      0,
      0,
      0,
      3,
      "Replace spike drive with small system drive",
    );

    starship.hullType.cost = Math.floor(starship.hullType.cost * 0.9);

    starship.hullType.power += powerMultiplier;
    starship.hullType.mass += powerMultiplier * 2;
    starship.drive = systemDrive;

    massBudget = starship.hullType.mass;
    powerBudget = starship.hullType.power;
  } else {
    const chanceOfDriveUpgrade = random.int(1, 100);

    if (chanceOfDriveUpgrade > 70) {
      const allDrives = allDriveFittings();
      const drives = [];

      for (let i = 0; i < allDrives.length; i++) {
        let driveMassCost = allDrives[i].mass;
        let drivePowerCost = allDrives[i].power;

        if (allDrives[i].massExpands) {
          driveMassCost *= massMultiplier;
        }

        if (allDrives[i].powerExpands) {
          drivePowerCost *= powerMultiplier;
        }

        if (
          allDrives[i].minimumClass <= starship.hullType.hullClass
          && allDrives[i].maximumClass >= starship.hullType.hullClass
        ) {
          if (drivePowerCost <= powerBudget && driveMassCost <= massBudget) {
            drives.push(allDrives[i]);
          }
        }
      }

      if (drives.length > 0) {
        const driveUpgrade = RND.item(drives);

        starship.fittings.push(driveUpgrade);
        starship.drive = driveUpgrade;

        massBudget -= driveUpgrade.mass * massMultiplier;
        powerBudget -= driveUpgrade.power * powerMultiplier;
        starship.totalCost += driveUpgrade.cost * costMultiplier;
      }
    }
  }

  if (starship.ownerType.isArmed) {
    const weaponList = allWeapons();
    let possibleWeapons: Weapon[] = [];
    for (let i = 0; i < weaponList.length; i++) {
      const weaponMassCost = weaponList[i].mass;
      const weaponPowerCost = weaponList[i].power;
      const weaponHardpoints = weaponList[i].hardPoints;

      if (
        weaponMassCost <= massBudget
        && weaponPowerCost <= powerBudget
        && weaponHardpoints <= hardpointBudget
        && weaponList[i].hullClass <= starship.hullType.hullClass
      ) {
        possibleWeapons.push(weaponList[i]);
      }
    }

    const numberOfWeapons = random.int(1, 2);
    for (let i = 0; i < numberOfWeapons; i++) {
      const newWeapon = RND.item(possibleWeapons);

      let weaponCost = newWeapon.cost;
      let weaponMassCost = newWeapon.mass;
      let weaponPowerCost = newWeapon.power;
      const weaponHardpoints = newWeapon.hardPoints;

      if (newWeapon.massExpands) {
        weaponMassCost = weaponMassCost * massMultiplier;
      }

      if (newWeapon.powerExpands) {
        weaponPowerCost = weaponPowerCost * powerMultiplier;
      }

      if (newWeapon.costExpands) {
        weaponCost = weaponCost * costMultiplier;
      }

      if (
        weaponMassCost <= massBudget
        && weaponPowerCost <= powerBudget
        && weaponHardpoints <= hardpointBudget
        && newWeapon.hullClass <= starship.hullType.hullClass
      ) {
        starship.weapons.push(newWeapon);
        massBudget -= weaponMassCost;
        powerBudget -= weaponPowerCost;
        hardpointBudget -= weaponHardpoints;
      }

      possibleWeapons = removeWeaponFittingFromList(newWeapon, possibleWeapons);
    }

    // Begin addition of defenses

    const defenseList = allDefenses();
    let possibleDefenses = [];

    for (let i = 0; i < defenseList.length; i++) {
      if (defenseList[i].hullClass <= starship.hullType.hullClass) {
        possibleDefenses.push(defenseList[i]);
      }
    }

    const numberOfDefenses = random.int(0, 2);

    for (let i = 0; i < numberOfDefenses; i++) {
      const newDefense = RND.item(possibleDefenses);

      let defenseCost = newDefense.cost;
      let defenseMassCost = newDefense.mass;
      let defensePowerCost = newDefense.power;

      if (newDefense.massExpands) {
        defenseMassCost = defenseMassCost * massMultiplier;
      }

      if (newDefense.powerExpands) {
        defensePowerCost = defensePowerCost * powerMultiplier;
      }

      if (newDefense.costExpands) {
        defenseCost = defenseCost * costMultiplier;
      }

      if (defenseMassCost <= massBudget && defensePowerCost <= powerBudget) {
        starship.defenses.push(newDefense);
        massBudget -= defenseMassCost;
        powerBudget -= defensePowerCost;
        starship.totalCost += defenseCost;
      }

      possibleDefenses = removeFittingFromList(newDefense, possibleDefenses);
    }
  }

  const possibleFittings = getAllAppropriateFittings(starship.ownerType.allowedFittingTypes);
  let fittingOptions = filterFittingsByHullClass(possibleFittings, starship.hullType.hullClass);

  // Begin addition of required fitting

  let requiredFittingOptions = getFittingsByType(starship.ownerType.requiredFittingType);
  requiredFittingOptions = filterFittingsByHullClass(
    requiredFittingOptions,
    starship.hullType.hullClass,
  );

  if (requiredFittingOptions.length > 0) {
    const requiredFitting = RND.item(requiredFittingOptions);
    starship.fittings.push(requiredFitting);

    let requiredFittingCost = requiredFitting.cost;
    let requiredMassCost = requiredFitting.mass;
    let requiredPowerCost = requiredFitting.power;

    if (requiredFitting.costExpands) {
      requiredFittingCost *= costMultiplier;
    }

    if (requiredFitting.massExpands) {
      requiredMassCost *= massMultiplier;
    }

    if (requiredFitting.powerExpands) {
      requiredPowerCost *= powerMultiplier;
    }

    massBudget -= requiredMassCost;
    powerBudget -= requiredPowerCost;
    starship.totalCost += requiredFittingCost;

    fittingOptions = removeFittingFromList(requiredFitting, fittingOptions);
  }

  // Begin addition of fittings

  const maxNumberOfFittings = random.int(1, 3);

  for (let i = 0; i < maxNumberOfFittings; i++) {
    const newFitting = RND.item(fittingOptions);

    let fittingCost = newFitting.cost;
    let fittingMassCost = newFitting.mass;
    let fittingPowerCost = newFitting.power;

    if (newFitting.costExpands) {
      fittingCost *= costMultiplier;
    }

    if (newFitting.massExpands) {
      fittingMassCost *= massMultiplier;
    }

    if (newFitting.powerExpands) {
      fittingPowerCost *= powerMultiplier;
    }

    if (fittingMassCost <= massBudget && fittingPowerCost <= powerBudget) {
      starship.fittings.push(newFitting);
      massBudget -= fittingMassCost;
      powerBudget -= fittingPowerCost;
      starship.totalCost += fittingCost;
    }

    fittingOptions = removeFittingFromList(newFitting, fittingOptions);
  }

  let tonsOfCargo = 0;

  if (starship.ownerType.fillWithCargo && massBudget > 0) {
    const cargoFitting = new CargoFitting("Cargo space", 0, 0, 1, 0, 3, "Pressurized cargo space");

    let foundCargo = false;

    let tonsMultiplier = 2;

    if (starship.hullType.hullClass === 1) {
      tonsMultiplier = 20;
    } else if (starship.hullType.hullClass === 2) {
      tonsMultiplier = 200;
    } else if (starship.hullType.hullClass === 3) {
      tonsMultiplier = 2000;
    }

    for (let i = 0; i < starship.fittings.length; i++) {
      if (starship.fittings[i].name === "Cargo space") {
        foundCargo = true;
        tonsOfCargo = tonsMultiplier;
      }
    }

    if (!foundCargo) {
      starship.fittings.push(cargoFitting);
      massBudget--;
    }

    const numberOfCargoFittings = massBudget;

    for (let i = 0; i < numberOfCargoFittings; i++) {
      tonsOfCargo += tonsMultiplier;
      massBudget--;
    }
  }

  starship.tonsOfCargo = tonsOfCargo;

  starship.usedMass = starship.hullType.mass - massBudget;
  starship.usedPower = starship.hullType.power - powerBudget;
  starship.usedHardPoints = starship.hullType.hardPoints - hardpointBudget;

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

export class HullType {
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

  constructor(
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
  ) {
    this.name = name;
    this.cost = cost;
    this.speed = speed;
    this.armor = armor;
    this.hp = hp;
    this.crewMinimum = crewMinimum;
    this.crewMaximum = crewMaximum;
    this.ac = ac;
    this.power = power;
    this.mass = mass;
    this.hardPoints = hardPoints;
    this.hullClass = hullClass;

    if (this.hullClass === 0) {
      this.hullClassName = "fighter";
    } else if (this.hullClass === 1) {
      this.hullClassName = "frigate";
    } else if (this.hullClass === 2) {
      this.hullClassName = "cruiser";
    } else if (this.hullClass === 3) {
      this.hullClassName = "capital";
    } else {
      this.hullClassName = "station";
    }

    this.crewSkill = crewSkill;
  }
}

function allHullTypes() {
  return [
    new HullType("strike fighter", 200000, 5, 5, 8, 1, 11, 16, 5, 2, 1, 0, "+2"),
    new HullType("shuttle", 200000, 3, 0, 15, 1, 10, 11, 3, 5, 1, 0, "+1"),
    new HullType("free merchant", 500000, 3, 2, 20, 1, 6, 14, 10, 15, 2, 1, "+1"),
    new HullType("patrol boat", 2500000, 4, 5, 25, 5, 20, 14, 15, 10, 4, 1, "+2"),
    new HullType("corvette", 4000000, 2, 10, 40, 10, 40, 13, 15, 15, 6, 1, "+2"),
    new HullType("heavy frigate", 7000000, 1, 10, 50, 30, 120, 15, 25, 20, 8, 1, "+2"),
    new HullType("bulk freighter", 5000000, 0, 0, 40, 10, 40, 11, 15, 25, 2, 2, "+1"),
    new HullType("fleet cruiser", 10000000, 1, 15, 60, 50, 200, 14, 50, 30, 10, 2, "+2"),
    new HullType("battleship", 50000000, 0, 20, 100, 200, 1000, 16, 75, 50, 15, 3, "+3"),
    new HullType("carrier", 60000000, 0, 10, 75, 300, 1500, 14, 50, 100, 4, 3, "+3"),
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

function randomHullType(ownerType: OwnerType) {
  return getHullType(RND.item(ownerType.possibleHullTypes));
}

export class OwnerType {
  name: string;
  isArmed: boolean;
  systemOnly: boolean;
  possibleHullTypes: string[];
  getRandomClassName: Function;
  getRandomShipName: Function;
  requiredFittingType: string;
  fillWithCargo: boolean;
  allowedFittingTypes: string[];

  constructor(
    name: string,
    isArmed: boolean,
    systemOnly: boolean,
    possibleHullTypes: string[],
    getRandomClassName: Function,
    getRandomShipName: Function,
    requiredFittingType: string,
    fillWithCargo: boolean,
    allowedFittingTypes: string[],
  ) {
    this.name = name;
    this.isArmed = isArmed;
    this.systemOnly = systemOnly;
    this.possibleHullTypes = possibleHullTypes;
    this.getRandomClassName = getRandomClassName;
    this.getRandomShipName = getRandomShipName;
    this.requiredFittingType = requiredFittingType;
    this.fillWithCargo = fillWithCargo;
    this.allowedFittingTypes = allowedFittingTypes;
  }
}

function randomStarshipOwnerType() {
  const types = [
    new OwnerType(
      "civilian",
      false,
      false,
      ["shuttle", "free merchant"],
      function() {
        const shipClassNames = [
          "Coventry",
          "Hermes",
          "Laurel",
          "Mermaid",
          "Star Runner",
          "Venus",
          "Amazon",
          "Hermione",
          "Cerce",
          "Triton",
          "Wizard",
          "Minerva",
          "Pallas",
          "Antioch",
          "Cerberus",
          "Diana",
          "Dryad",
          "Phoebe",
          "Emerald",
          "Ruby",
          "Diamond",
          "Seahorse",
          "Stag",
          "Hydra",
          "Boadicea",
          "Galatea",
          "Shannon",
        ];

        const modelNumber = MUN.modelNumber();

        return modelNumber + " " + RND.item(shipClassNames);
      },
      function() {
        const shipNames = [
          "Mistral",
          "Dictator",
          "Alceste",
          "Kilmersdon",
          "Goldfinch",
          "Century Hawk",
          "Brazen Mistress",
          "Norman",
          "Badger",
          "Nox",
          "Dredger",
          "Mimosa",
          "Scotch",
          "Bad Wine",
          "Lady Luck",
          "Powerful",
          "Glasgow",
          "Errant",
          "Pouncer",
          "Ayrshire",
          "Rocinante",
          "Mercy",
          "Princess",
          "Aphrodite",
          "Athena",
          "Hera",
          "Deidre",
          "Naomi",
          "Alice",
          "Denali",
          "Roberta",
          "Darlin",
          "Marlin",
          "Swordfish",
          "Borderstar",
          "Bad Habit",
          "Escolano",
          "Simplicity",
          "Good Fortune",
          "Fortune",
          "Alistair",
        ];

        return RND.item(shipNames);
      },
      "cargo",
      false,
      [
        "cargo",
        "colony",
        "computer",
        "crew",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "passenger",
        "science",
        "sensors",
        "shuttle",
        "support",
      ],
    ),
    new OwnerType(
      "merchant",
      false,
      false,
      ["shuttle", "free merchant", "bulk freighter"],
      function() {
        const shipClassNames = [
          "Coventry",
          "Hermes",
          "Laurel",
          "Mermaid",
          "Star Runner",
          "Venus",
          "Amazon",
          "Hermione",
          "Cerce",
          "Triton",
          "Wizard",
          "Minerva",
          "Pallas",
          "Antioch",
          "Cerberus",
          "Diana",
          "Dryad",
          "Phoebe",
          "Emerald",
          "Ruby",
          "Diamond",
          "Seahorse",
          "Stag",
          "Hydra",
          "Boadicea",
          "Galatea",
          "Shannon",
        ];

        const modelNumber = MUN.modelNumber();

        return modelNumber + " " + RND.item(shipClassNames);
      },
      function() {
        const shipNames = [
          "Mistral",
          "Dictator",
          "Alceste",
          "Kilmersdon",
          "Goldfinch",
          "Century Hawk",
          "Brazen Mistress",
          "Norman",
          "Badger",
          "Nox",
          "Dredger",
          "Mimosa",
          "Scotch",
          "Bad Wine",
          "Lady Luck",
          "Powerful",
          "Glasgow",
          "Errant",
          "Pouncer",
          "Ayrshire",
          "Rocinante",
          "Mercy",
          "Princess",
          "Aphrodite",
          "Athena",
          "Hera",
          "Deidre",
          "Naomi",
          "Alice",
          "Denali",
          "Roberta",
          "Darlin",
          "Marlin",
          "Swordfish",
          "Borderstar",
          "Bad Habit",
          "Escolano",
          "Simplicity",
          "Good Fortune",
          "Fortune",
          "Alistair",
        ];

        return RND.item(shipNames);
      },
      "cargo",
      true,
      [
        "cargo",
        "colony",
        "computer",
        "crew",
        "factory",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "passenger",
        "science",
        "sensors",
        "shuttle",
        "support",
      ],
    ),
    new OwnerType(
      "mining ship",
      false,
      false,
      ["shuttle", "free merchant", "bulk freighter"],
      function() {
        const shipClassNames = [
          "Behemoth",
          "Leviathan",
          "Hermes",
          "Workhorse",
          "Odyssey",
          "Sojourner",
          "Prospect",
          "Procurer",
          "Retriever",
          "Covetor",
          "Venture",
          "Endurance",
          "Orca",
          "Hulk",
        ];

        const modelNumber = MUN.modelNumber();

        return modelNumber + " " + RND.item(shipClassNames);
      },
      function() {
        const shipNames = [
          "Mistral",
          "Dictator",
          "Alceste",
          "Kilmersdon",
          "Goldfinch",
          "Century Hawk",
          "Brazen Mistress",
          "Norman",
          "Badger",
          "Nox",
          "Dredger",
          "Mimosa",
          "Scotch",
          "Bad Wine",
          "Lady Luck",
          "Powerful",
          "Glasgow",
          "Errant",
          "Pouncer",
          "Ayrshire",
          "Rocinante",
          "Mercy",
          "Princess",
          "Aphrodite",
          "Athena",
          "Hera",
          "Deidre",
          "Naomi",
          "Alice",
          "Denali",
          "Roberta",
          "Darlin",
          "Marlin",
          "Swordfish",
          "Borderstar",
          "Bad Habit",
          "Escolano",
          "Simplicity",
          "Good Fortune",
          "Fortune",
          "Alistair",
        ];

        return RND.item(shipNames);
      },
      "mining",
      true,
      [
        "cargo",
        "colony",
        "computer",
        "crew",
        "factory",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "passenger",
        "science",
        "sensors",
        "shuttle",
        "support",
      ],
    ),
    new OwnerType(
      "law enforcement",
      true,
      true,
      ["patrol boat"],
      function() {
        const shipClassNames = [
          "Shrike",
          "Shooting Star",
          "Vindicator",
          "Centurion",
          "Sentinel",
          "Guardian",
          "Defender",
          "Patroller",
          "Sherriff",
          "Constable",
          "Cavalry",
          "Marshal",
          "Badge",
        ];

        const modelNumber = MUN.modelNumber();

        return modelNumber + " " + RND.item(shipClassNames);
      },
      function() {
        let shipName = "";

        shipName = RND.item([
          "PS",
          "SPS",
          "SP",
          "Star Police Cruiser",
          "Solar Police",
          "Star Police",
          "LES",
        ]);

        const unitNumber = random.int(100, 500);

        const designationForm = random.int(0, 100);

        if (designationForm < 30) {
          shipName += " " + unitNumber;
        } else if (designationForm < 70) {
          shipName += " " + random.int(1, 9) + "-" + unitNumber;
        } else {
          shipName += " Unit " + unitNumber;
        }

        return shipName;
      },
      "weapons",
      false,
      [
        "cargo",
        "computer",
        "crew",
        "fuel",
        "landing",
        "navigation",
        "science",
        "sensors",
        "shuttle",
        "support",
        "weapons",
      ],
    ),
    new OwnerType(
      "military line of battle",
      true,
      false,
      ["fleet cruiser", "battleship", "carrier"],
      function() {
        const shipClassNames = [
          "Vindicator",
          "Imperator",
          "Executor",
          "Dreadnought",
          "Invictus",
          "Leviathan",
          "Balwark",
          "Sun Crusher",
          "Brutality",
          "Victory",
          "Guardian",
          "Dominator",
          "Annihilator",
          "Titan",
          "Sovereign",
          "Juggernaut",
        ];

        return RND.item(shipClassNames) + "-class";
      },
      function() {
        const shipNames = [
          "Righteousness",
          "Hammer of God",
          "Apollo",
          "Alexander",
          "Atalanta",
          "Baroness",
          "Baron",
          "Oberon",
          "Wrath",
          "Honor",
          "Gladius",
          "Harlegand",
          "Hittite",
          "Karnack",
          "Helios",
          "Andromeda",
          "Liberator",
          "Nirvana",
          "Khan",
          "Adogan",
          "Chimera",
          "Warlock",
          "Warlord",
          "Centipede",
          "Manticore",
          "Gryphon",
        ];

        const designator = RND.item(["HMS", "USS", "ISS"]);

        return designator + " " + RND.item(shipNames);
      },
      "weapons",
      false,
      [
        "cargo",
        "computer",
        "crew",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "passenger",
        "psychic",
        "science",
        "sensors",
        "shuttle",
        "stealth",
        "support",
        "troops",
        "weapons",
      ],
    ),
    new OwnerType(
      "military patroller",
      true,
      false,
      ["patrol boat", "corvette", "heavy frigate"],
      function() {
        const shipClassNames = [
          "Vanguard",
          "Shrike",
          "Avenger",
          "Cutter",
          "Ghost",
          "Specter",
          "Centipede",
          "Wasp",
          "Hornet",
          "Dart",
          "Talon",
          "Bandit",
          "Lancer",
          "Angel",
          "Paladin",
        ];

        return RND.item(shipClassNames) + "-class";
      },
      function() {
        const shipNames = [
          "Gibraltar",
          "Biddeford",
          "Seaford",
          "Pandora",
          "Siren",
          "Champion",
          "Daphne",
          "Unicorn",
          "Perseus",
          "Sphinx",
          "Gryphon",
          "Wight",
          "Spectre",
          "Dragon",
          "Wyvern",
          "Hyena",
          "Wolf",
          "Dagger",
          "Falchion",
          "Warhammer",
          "Conway",
          "Conqueror",
          "Hind",
        ];

        const designator = RND.item(["HMS", "USS", "ISS"]);

        return designator + " " + RND.item(shipNames);
      },
      "weapons",
      false,
      [
        "cargo",
        "computer",
        "crew",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "passenger",
        "psychic",
        "science",
        "sensors",
        "shuttle",
        "stealth",
        "support",
        "weapons",
      ],
    ),
    new OwnerType(
      "pirate",
      true,
      false,
      ["strike fighter", "patrol boat", "corvette", "heavy frigate"],
      function() {
        const shipClassNames = [
          "Coventry",
          "Hermes",
          "Laurel",
          "Mermaid",
          "Star Runner",
          "Venus",
          "Amazon",
          "Hermione",
          "Cerce",
          "Triton",
          "Wizard",
          "Minerva",
          "Pallas",
          "Antioch",
          "Cerberus",
          "Diana",
          "Dryad",
          "Phoebe",
          "Emerald",
          "Ruby",
          "Diamond",
          "Seahorse",
          "Stag",
          "Hydra",
          "Boadicea",
          "Galatea",
          "Shannon",
        ];

        const modelNumber = MUN.modelNumber();

        return modelNumber + " " + RND.item(shipClassNames);
      },
      function() {
        const shipNames = [
          "Revenge",
          "Blood",
          "Bloodletter",
          "Pearl",
          "Broken Soul",
          "Lost Soul",
          "Reaver",
          "Raider",
          "Corsair",
          "Vengeance",
          "Freedom",
          "Free Will",
          "Serpent",
          "Burning Rose",
          "Black Rose",
          "Black Star",
          "Crimson Star",
          "Crimson",
          "Maelstrom",
          "Runner",
          "Old James",
          "Dog of War",
          "Solar Tide",
        ];

        return RND.item(shipNames);
      },
      "weapons",
      false,
      [
        "cargo",
        "computer",
        "crew",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "sensors",
        "shuttle",
        "stealth",
        "support",
        "troops",
        "weapons",
      ],
    ),
    new OwnerType(
      "smuggler",
      true,
      false,
      ["free merchant", "patrol boat"],
      function() {
        const shipClassNames = [
          "Coventry",
          "Hermes",
          "Laurel",
          "Mermaid",
          "Star Runner",
          "Venus",
          "Amazon",
          "Hermione",
          "Cerce",
          "Triton",
          "Wizard",
          "Minerva",
          "Pallas",
          "Antioch",
          "Cerberus",
          "Diana",
          "Dryad",
          "Phoebe",
          "Emerald",
          "Ruby",
          "Diamond",
          "Seahorse",
          "Stag",
          "Hydra",
          "Boadicea",
          "Galatea",
          "Shannon",
        ];

        const modelNumber = MUN.modelNumber();

        return modelNumber + " " + RND.item(shipClassNames);
      },
      function() {
        const shipNames = [
          "Mistral",
          "Dictator",
          "Alceste",
          "Kilmersdon",
          "Goldfinch",
          "Century Hawk",
          "Brazen Mistress",
          "Norman",
          "Badger",
          "Nox",
          "Dredger",
          "Mimosa",
          "Scotch",
          "Bad Wine",
          "Lady Luck",
          "Powerful",
          "Glasgow",
          "Errant",
          "Pouncer",
          "Ayrshire",
          "Rocinante",
          "Mercy",
          "Princess",
          "Aphrodite",
          "Athena",
          "Hera",
          "Deidre",
          "Naomi",
          "Alice",
          "Denali",
          "Roberta",
          "Darlin",
          "Marlin",
          "Swordfish",
          "Borderstar",
          "Bad Habit",
          "Escolano",
          "Simplicity",
          "Good Fortune",
          "Fortune",
          "Alistair",
        ];

        return RND.item(shipNames);
      },
      "smuggling",
      true,
      [
        "cargo",
        "computer",
        "crew",
        "fuel",
        "landing",
        "medical",
        "navigation",
        "passenger",
        "sensors",
        "shuttle",
        "smuggling",
        "stealth",
        "support",
      ],
    ),
  ];

  return RND.item(types);
}

export class DriveFitting {
  name: string;
  cost: number;
  costExpands: boolean;
  power: number;
  powerExpands: boolean;
  mass: number;
  massExpands: boolean;
  minimumClass: number;
  maximumClass: number;
  effect: string;

  constructor(
    name: string,
    cost: number,
    power: number,
    mass: number,
    minimumClass: number,
    maximumClass: number,
    effect: string,
  ) {
    this.name = name;
    this.cost = cost;
    this.costExpands = true;
    this.power = power;
    this.powerExpands = true;
    this.mass = mass;
    this.massExpands = true;
    this.minimumClass = minimumClass;
    this.maximumClass = maximumClass;
    this.effect = effect;
  }
}

function getStarterDrive() {
  return new DriveFitting("Spike Drive-1", 0, 1, 1, 0, 3, "A class-1 spike drive");
}

function allDriveFittings() {
  return [
    new DriveFitting("Spike Drive-2", 10000, 1, 1, 0, 3, "Upgrade a spike drive to drive-2 rating"),
    new DriveFitting("Spike Drive-3", 20000, 2, 2, 0, 3, "Upgrade a spike drive to drive-3 rating"),
    new DriveFitting("Spike Drive-4", 40000, 2, 3, 1, 3, "Upgrade a spike drive to drive-4 rating"),
    new DriveFitting(
      "Spike Drive-5",
      100000,
      3,
      3,
      1,
      3,
      "Upgrade a spike drive to drive-5 rating",
    ),
    new DriveFitting(
      "Spike Drive-6",
      500000,
      3,
      4,
      2,
      3,
      "Upgrade a spike drive to drive-6 rating",
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

export class CargoFitting {
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

  constructor(
    name: string,
    cost: number,
    power: number,
    mass: number,
    minimumClass: number,
    maximumClass: number,
    effect: string,
  ) {
    this.name = name;
    this.fittingType = "cargo";
    this.cost = cost;
    this.costExpands = false;
    this.power = power;
    this.powerExpands = false;
    this.mass = mass;
    this.massExpands = false;
    this.minimumClass = minimumClass;
    this.maximumClass = maximumClass;
    this.effect = effect;
  }
}

export class Fitting {
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

  constructor(
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
  ) {
    this.name = name;
    this.fittingType = fittingType;
    this.cost = cost;
    this.costExpands = costExpands;
    this.power = power;
    this.powerExpands = powerExpands;
    this.mass = mass;
    this.massExpands = massExpands;
    this.minimumClass = minimumClass;
    this.maximumClass = maximumClass;
    this.effect = effect;
  }
}

function allFittings() {
  return [
    new Fitting(
      "Advanced lab",
      "science",
      10000,
      true,
      1,
      true,
      2,
      false,
      1,
      3,
      "Skill bonus for analysis and research",
    ),
    new Fitting(
      "Advanced nav computer",
      "navigation",
      10000,
      true,
      1,
      true,
      0,
      false,
      1,
      3,
      "Adds +2 for traveling familiar spike courses",
    ),
    new Fitting(
      "Amphibious operation",
      "landing",
      25000,
      false,
      1,
      false,
      1,
      true,
      0,
      3,
      "Can land and can operate under water",
    ),
    new Fitting(
      "Armory",
      "weapons",
      10000,
      true,
      0,
      false,
      0,
      false,
      1,
      3,
      "Weapons and armor for the crew",
    ),
    new Fitting(
      "Atmospheric configuration",
      "landing",
      5000,
      true,
      0,
      false,
      1,
      false,
      0,
      1,
      "Can land",
    ),
    new Fitting(
      "Auto-targeting system",
      "weapons",
      50000,
      false,
      1,
      false,
      0,
      false,
      0,
      3,
      "Fires one weapon system without a gunner",
    ),
    new Fitting(
      "Automation support",
      "computer",
      10000,
      true,
      2,
      false,
      1,
      false,
      0,
      3,
      "Ship can use simple robots as crew",
    ),
    new Fitting(
      "Boarding tubes",
      "troops",
      5000,
      true,
      0,
      false,
      1,
      false,
      1,
      3,
      "Allows boarding of a hostile disabled ship",
    ),
    new Fitting(
      "Cargo lighter",
      "shuttle",
      25000,
      false,
      0,
      false,
      2,
      false,
      1,
      3,
      "Orbit-to-surface cargo shuttle",
    ),
    new CargoFitting("Cargo space", 0, 0, 1, 0, 3, "Pressurized cargo space"),
    new Fitting(
      "Cold sleep pods",
      "passenger",
      5000,
      true,
      1,
      false,
      1,
      false,
      1,
      3,
      "Keeps occupants in stasis",
    ),
    new Fitting(
      "Colony core",
      "colony",
      100000,
      true,
      4,
      false,
      2,
      true,
      1,
      3,
      "Ship can be deconstructed into a colony base",
    ),
    new Fitting(
      "Drill course regulator",
      "navigation",
      25000,
      true,
      1,
      true,
      1,
      false,
      1,
      3,
      "Common drill routes become auto-successes",
    ),
    new Fitting(
      "Drop pod",
      "troops",
      300000,
      false,
      0,
      false,
      2,
      false,
      1,
      3,
      "Stealthed landing pod for troops",
    ),
    new Fitting(
      "Emissions dampers",
      "stealth",
      25000,
      true,
      1,
      true,
      1,
      true,
      0,
      3,
      "Adds +2 to skill checks to avoid detection",
    ),
    new Fitting(
      "Exodus bay",
      "passenger",
      50000,
      true,
      1,
      true,
      2,
      true,
      2,
      3,
      "House vast numbers of cold sleep passengers",
    ),
    new Fitting(
      "Extended life support",
      "crew",
      5000,
      true,
      1,
      true,
      1,
      true,
      0,
      3,
      "Doubles maximum crew size",
    ),
    new Fitting(
      "Extended medbay",
      "medical",
      5000,
      true,
      1,
      false,
      1,
      false,
      1,
      3,
      "Can provide medical care to more patients",
    ),
    new Fitting(
      "Extended stores",
      "crew",
      2500,
      true,
      0,
      false,
      1,
      true,
      0,
      3,
      "Maximum life support duration is doubled",
    ),
    new Fitting(
      "Fuel bunkers",
      "fuel",
      2500,
      true,
      0,
      false,
      1,
      false,
      0,
      3,
      "Adds fuel for one more drill between fuelings",
    ),
    new Fitting(
      "Fuel scoops",
      "fuel",
      5000,
      true,
      2,
      false,
      1,
      true,
      1,
      3,
      "Ship can scoop fuel from a gas giant or star",
    ),
    new Fitting(
      "Hydroponic production",
      "crew",
      10000,
      true,
      1,
      true,
      2,
      true,
      2,
      3,
      "Ship produces life support resources",
    ),
    new Fitting(
      "Lifeboats",
      "shuttle",
      2500,
      true,
      0,
      false,
      1,
      false,
      1,
      3,
      "Emergency escape craft for a ship's crew",
    ),
    new Fitting(
      "Luxury cabins",
      "crew",
      10000,
      true,
      0,
      false,
      1,
      true,
      1,
      3,
      "10% of the max crew get luxurious quarters",
    ),
    new Fitting(
      "Mobile extractor",
      "mining",
      50000,
      false,
      2,
      false,
      1,
      false,
      1,
      3,
      "Space mining and refinery fittings",
    ),
    new Fitting(
      "Mobile factory",
      "factory",
      50000,
      true,
      3,
      false,
      2,
      true,
      2,
      3,
      "Self-sustaining factory and repair facilities",
    ),
    new Fitting(
      "Precognitive nav chamber",
      "psychic",
      100000,
      true,
      1,
      false,
      0,
      false,
      1,
      3,
      "Allows a precog to assist in navigation",
    ),
    new Fitting(
      "Sensor mask",
      "stealth",
      10000,
      true,
      1,
      true,
      0,
      false,
      1,
      3,
      "At long distances, disguise ship as another",
    ),
    new Fitting(
      "Ship bay: fighter",
      "carrier",
      200000,
      false,
      0,
      false,
      2,
      false,
      2,
      3,
      "Carrier housing for a fighter",
    ),
    new Fitting(
      "Ship bay: frigate",
      "carrier",
      1000000,
      false,
      1,
      false,
      4,
      false,
      3,
      3,
      "Carrier housing for a frigate",
    ),
    new Fitting(
      "Ship's locker",
      "cargo",
      2000,
      true,
      0,
      false,
      0,
      false,
      1,
      3,
      "General equipment for the crew",
    ),
    new Fitting(
      "Shiptender mount",
      "support",
      25000,
      true,
      1,
      false,
      1,
      false,
      1,
      3,
      "Allow another ship to hitch on a spike drive",
    ),
    new Fitting(
      "Smuggler's hold",
      "smuggling",
      2500,
      true,
      0,
      false,
      1,
      false,
      0,
      3,
      "Small amount of well-hidden cargo space",
    ),
    new Fitting(
      "Survey sensor array",
      "sensors",
      5000,
      true,
      2,
      false,
      1,
      false,
      1,
      3,
      "Improved planetary sensor array",
    ),
    new Fitting(
      "Tractor beams",
      "support",
      10000,
      true,
      2,
      false,
      1,
      false,
      1,
      3,
      "Manipulate objects in space at a distance",
    ),
    new Fitting(
      "Vehicle transport fittings",
      "carrier",
      2500,
      true,
      0,
      false,
      1,
      true,
      1,
      3,
      "Halve tonnage space of carried vehicles",
    ),
    new Fitting(
      "Workshop",
      "support",
      500,
      true,
      1,
      false,
      0.5,
      true,
      1,
      3,
      "Automated tech workshops for maintenance",
    ),
  ];
}

export class DefenseFitting {
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

  constructor(
    name: string,
    cost: number,
    power: number,
    mass: number,
    hullClass: number,
    effect: string,
  ) {
    this.name = name;
    this.fittingType = "defense";
    this.cost = cost;
    this.costExpands = true;
    this.power = power;
    this.powerExpands = false;
    this.mass = mass;
    this.massExpands = true;
    this.hullClass = hullClass;
    this.minimumClass = hullClass;
    this.maximumClass = 4;
    this.effect = effect;
  }
}

function allDefenses() {
  return [
    new DefenseFitting(
      "Ablative Hull Compartments",
      100000,
      5,
      2,
      3,
      "+1 AC, +20 maximum hit points",
    ),
    new DefenseFitting("Augmented Plating", 25000, 0, 1, 0, "+2 AC, -1 Speed"),
    new DefenseFitting(
      "Boarding Countermeasures",
      25000,
      2,
      1,
      1,
      "Makes enemy boarding more difficult",
    ),
    new DefenseFitting("Burst ECM Generator", 25000, 2, 1, 1, "Negate one successful hit"),
    new DefenseFitting("Foxer Drones", 10000, 2, 1, 3, "+2 AC for one round when fired, Ammo 5"),
    new DefenseFitting(
      "Grav Eddy Displacer",
      50000,
      5,
      2,
      1,
      "1 in 6 chance of any given attack missing",
    ),
    new DefenseFitting(
      "Hardened Polyceramic Overlay",
      25000,
      0,
      1,
      0,
      "AP quality of attacking weapons reduced by 5",
    ),
    new DefenseFitting(
      "Planetary Defense Array",
      50000,
      4,
      2,
      1,
      "Anti-impact and anti-nuke surface defenses",
    ),
    new DefenseFitting(
      "Point Defense Lasers",
      10000,
      3,
      2,
      1,
      "+2 AC versus weapons that use ammo",
    ),
  ];
}

export class Weapon {
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

  constructor(
    name: string,
    cost: number,
    damage: string,
    power: number,
    mass: number,
    hardPoints: number,
    hullClass: number,
    TL: number,
    qualities: string[],
  ) {
    this.name = name;
    this.fittingType = "weapon";
    this.cost = cost;
    this.costExpands = false;
    this.damage = damage;
    this.power = power;
    this.powerExpands = false;
    this.mass = mass;
    this.massExpands = false;
    this.hardPoints = hardPoints;
    this.hullClass = hullClass;
    this.minimumClass = hullClass;
    this.maximumClass = 4;
    this.TL = TL;
    this.effect = "Kills things";
    this.qualities = qualities;
  }
}

function allWeapons() {
  return [
    new Weapon("Multifocal Laser", 100000, "1d4", 5, 1, 1, 0, 4, ["AP 20"]),
    new Weapon("Reaper Battery", 100000, "3d4", 4, 1, 1, 0, 4, ["Clumsy"]),
    new Weapon("Fractal Impact Charge", 200000, "2d6", 5, 1, 1, 0, 4, ["AP 15", "Ammo 4"]),
    new Weapon("Polyspectral MES Beam", 2000000, "2d4", 5, 1, 1, 0, 5, ["AP 25"]),
    new Weapon("Sandthrower", 50000, "2d4", 3, 1, 1, 0, 4, ["Flak"]),
    new Weapon("Flak Emitter Battery", 500000, "2d6", 5, 3, 1, 1, 4, ["AP 10", "Flak"]),
    new Weapon("Torpedo Launcher", 500000, "3d8", 10, 3, 1, 1, 4, ["AP 20", "Ammo 4"]),
    new Weapon("Charged Particle Caster", 800000, "3d6", 10, 1, 2, 1, 4, ["AP 15", "Clumsy"]),
    new Weapon("Plasma Beam", 700000, "3d6", 5, 2, 2, 1, 4, ["AP 10"]),
    new Weapon("Mag Spike Array", 1000000, "2d6+2", 5, 2, 2, 0, 4, ["AP 10", "Flak", "Ammo 5"]),
    new Weapon("Nuclear Missiles", 50000, "Special", 5, 1, 2, 0, 4, ["Ammo 5"]),
    new Weapon("Spinal Beam Cannon", 1500000, "3d10", 10, 5, 3, 2, 4, ["AP 15", "Clumsy"]),
    new Weapon("Smart Cloud", 2000000, "3d10", 10, 5, 2, 2, 4, ["Cloud", "Clumsy"]),
    new Weapon("Gravcannon", 2000000, "4d6", 15, 4, 3, 2, 4, ["AP 20"]),
    new Weapon("Spike Inversion Projector", 2500000, "3d8", 10, 3, 3, 2, 4, ["AP 15"]),
    new Weapon("Vortex Tunnel Inductor", 5000000, "3d20", 20, 10, 4, 3, 4, ["AP 20", "Clumsy"]),
    new Weapon("Mass Cannon", 5000000, "2d20", 10, 5, 4, 3, 4, ["AP 20", "Ammo 4"]),
    new Weapon("Lightning Charge Mantle", 4000000, "1d20", 15, 5, 2, 3, 4, ["AP 5", "Cloud"]),
    new Weapon("Singularity Gun", 20000000, "5d20", 25, 10, 5, 3, 5, ["AP 25"]),
  ];
}

function randomManufacturerName() {
  const nameTypes = [
    {
      generate: function() {
        const prefix = RND.item([
          "Aether",
          "Kurich",
          "Bulior",
          "Bulloch",
          "Andromeda",
          "Astrogator",
          "Galadyne",
          "Guidenhauser",
          "Legends",
          "Blueshift",
          "Redshift",
          "Andaria",
          "Pax",
          "Interstellar",
        ]);

        const suffix = RND.item(["Corporation", "Limited", "Technologies", "Fleet Systems"]);

        return prefix + " " + suffix;
      },
    },
    {
      generate: function() {
        const pre1 = RND.item([
          "Xa",
          "Ka",
          "Ga",
          "La",
          "Na",
          "Sa",
          "Xo",
          "Ko",
          "Go",
          "Lo",
          "So",
          "Xe",
          "Ke",
          "Ge",
          "Le",
          "Se",
          "Xi",
          "Ki",
          "Gi",
          "Li",
          "Si",
        ]);

        const pre2 = RND.item([
          "la",
          "ka",
          "ra",
          "sa",
          "na",
          "pa",
          "le",
          "ke",
          "re",
          "se",
          "ne",
          "pe",
          "li",
          "ki",
          "ri",
          "si",
          "ni",
          "pi",
          "lo",
          "ko",
          "ro",
          "so",
          "no",
          "po",
          "lu",
          "ku",
          "ru",
          "su",
          "nu",
          "pu",
        ]);

        const suffix = RND.item(["dyne", "tech", "tronics", "flux"]);

        return pre1 + pre2 + suffix;
      },
    },
  ];

  const nameType = RND.item(nameTypes);

  return nameType.generate();
}

function removeFittingFromList(
  fitting: Fitting | CargoFitting | Weapon | DefenseFitting,
  fittings: (Fitting | CargoFitting | Weapon | DefenseFitting)[],
) {
  const options = [];

  for (let i = 0; i < fittings.length; i++) {
    if (fittings[i].name != fitting.name) {
      options.push(fittings[i]);
    }
  }

  return options;
}

function removeWeaponFittingFromList(
  fitting: Weapon,
  fittings: Weapon[],
): Weapon[] {
  const options: Weapon[] = [];

  for (let i = 0; i < fittings.length; i++) {
    if (fittings[i].name != fitting.name) {
      options.push(fittings[i]);
    }
  }

  return options;
}

export function formatAsText(starship: SWNStarship) {
  let description = Text.header(starship.name);

  description += "Owner Type: " + starship.ownerType.name + "\n";
  description += "Manufacturer: " + starship.manufacturer + "\n";
  description += "Model: " + starship.className + "\n";
  description += "Hull Type: " + starship.hullType.name + "\n";
  description += "Hull Class: " + starship.hullType.hullClassName + "\n";
  description += "Drive: " + starship.drive.name + "\n";
  description += "Maximum Mass: " + starship.hullType.mass + "\n";
  description += "Mass Used: " + starship.usedMass + "\n";
  description += "Maximum Power: " + starship.hullType.power + "\n";
  description += "Power Used: " + starship.usedPower + "\n";
  description += "AC: " + starship.hullType.ac + "\n";
  description += "HP: " + starship.hullType.hp + "\n";
  description += "Minimum Crew: " + starship.hullType.crewMinimum + "\n";
  description += "Maximum Crew: " + starship.hullType.crewMaximum + "\n";
  description += "Current Crew: " + starship.currentCrew + "\n";
  description += "Total Ship Value: " + new Intl.NumberFormat("en-US").format(starship.totalCost) + " credits\n";
  description += "Total Crew Cost: "
    + new Intl.NumberFormat("en-US").format(starship.currentCrew * 43800)
    + " credits per year\n";
  description += "Crew Skill: " + starship.hullType.crewSkill + "\n";
  description += "Cargo Space: " + starship.tonsOfCargo + " tons\n";

  const fittings = [];

  for (let i = 0; i < starship.fittings.length; i++) {
    const fitting = starship.fittings[i].name + ": " + starship.fittings[i].effect;
    fittings.push(fitting);
  }

  description += Text.header("Fittings");

  description += Text.list(fittings);

  const weapons = [];

  for (let i = 0; i < starship.weapons.length; i++) {
    const weapon = starship.weapons[i].name
      + ": "
      + starship.weapons[i].damage
      + " damage, "
      + starship.weapons[i].qualities.join(", ");
    weapons.push(weapon);
  }

  description += Text.header("Weapons");

  description += Text.list(weapons);

  const defenses = [];

  for (let i = 0; i < starship.defenses.length; i++) {
    const defense = starship.defenses[i].name + ": " + starship.defenses[i].effect;
    defenses.push(defense);
  }

  description += Text.header("Defenses");

  description += Text.list(defenses);

  return description;
}
