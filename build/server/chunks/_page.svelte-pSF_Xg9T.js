import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from './ssr-kRdx30EW.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-nUrLnAlE.js';
import random from 'random';
import seedrandom from 'seedrandom';

class SWNStarship {
  name;
  className;
  manufacturer;
  hullType;
  currentCrew;
  totalCost;
  tonsOfCargo;
  usedMass;
  usedPower;
  usedHardPoints;
  ownerType;
  weapons;
  defenses;
  fittings;
  drive;
  constructor(ownerType, hullType) {
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
function generate() {
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
      "Replace spike drive with small system drive"
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
        if (allDrives[i].minimumClass <= starship.hullType.hullClass && allDrives[i].maximumClass >= starship.hullType.hullClass) {
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
    let possibleWeapons = [];
    for (let i = 0; i < weaponList.length; i++) {
      const weaponMassCost = weaponList[i].mass;
      const weaponPowerCost = weaponList[i].power;
      const weaponHardpoints = weaponList[i].hardPoints;
      if (weaponMassCost <= massBudget && weaponPowerCost <= powerBudget && weaponHardpoints <= hardpointBudget && weaponList[i].hullClass <= starship.hullType.hullClass) {
        possibleWeapons.push(weaponList[i]);
      }
    }
    const numberOfWeapons = random.int(1, 2);
    for (let i = 0; i < numberOfWeapons; i++) {
      const newWeapon = RND.item(possibleWeapons);
      newWeapon.cost;
      let weaponMassCost = newWeapon.mass;
      let weaponPowerCost = newWeapon.power;
      const weaponHardpoints = newWeapon.hardPoints;
      if (newWeapon.massExpands) {
        weaponMassCost = weaponMassCost * massMultiplier;
      }
      if (newWeapon.powerExpands) {
        weaponPowerCost = weaponPowerCost * powerMultiplier;
      }
      if (newWeapon.costExpands)
        ;
      if (weaponMassCost <= massBudget && weaponPowerCost <= powerBudget && weaponHardpoints <= hardpointBudget && newWeapon.hullClass <= starship.hullType.hullClass) {
        starship.weapons.push(newWeapon);
        massBudget -= weaponMassCost;
        powerBudget -= weaponPowerCost;
        hardpointBudget -= weaponHardpoints;
      }
      possibleWeapons = removeWeaponFittingFromList(newWeapon, possibleWeapons);
    }
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
  let requiredFittingOptions = getFittingsByType(starship.ownerType.requiredFittingType);
  requiredFittingOptions = filterFittingsByHullClass(
    requiredFittingOptions,
    starship.hullType.hullClass
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
      tonsMultiplier = 2e3;
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
function filterFittingsByHullClass(fittings, hullClass) {
  const result = [];
  for (let i = 0; i < fittings.length; i++) {
    if (fittings[i].minimumClass <= hullClass && fittings[i].maximumClass >= hullClass) {
      result.push(fittings[i]);
    }
  }
  return result;
}
function getAllAppropriateFittings(fittingTypes) {
  const all = allFittings();
  const fittings = [];
  for (let i = 0; i < all.length; i++) {
    if (fittingTypes.includes(all[i].fittingType)) {
      fittings.push(all[i]);
    }
  }
  return fittings;
}
class HullType {
  name;
  cost;
  speed;
  armor;
  hp;
  crewMinimum;
  crewMaximum;
  ac;
  power;
  mass;
  hardPoints;
  hullClass;
  hullClassName;
  crewSkill;
  constructor(name, cost, speed, armor, hp, crewMinimum, crewMaximum, ac, power, mass, hardPoints, hullClass, crewSkill) {
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
    new HullType("strike fighter", 2e5, 5, 5, 8, 1, 11, 16, 5, 2, 1, 0, "+2"),
    new HullType("shuttle", 2e5, 3, 0, 15, 1, 10, 11, 3, 5, 1, 0, "+1"),
    new HullType("free merchant", 5e5, 3, 2, 20, 1, 6, 14, 10, 15, 2, 1, "+1"),
    new HullType("patrol boat", 25e5, 4, 5, 25, 5, 20, 14, 15, 10, 4, 1, "+2"),
    new HullType("corvette", 4e6, 2, 10, 40, 10, 40, 13, 15, 15, 6, 1, "+2"),
    new HullType("heavy frigate", 7e6, 1, 10, 50, 30, 120, 15, 25, 20, 8, 1, "+2"),
    new HullType("bulk freighter", 5e6, 0, 0, 40, 10, 40, 11, 15, 25, 2, 2, "+1"),
    new HullType("fleet cruiser", 1e7, 1, 15, 60, 50, 200, 14, 50, 30, 10, 2, "+2"),
    new HullType("battleship", 5e7, 0, 20, 100, 200, 1e3, 16, 75, 50, 15, 3, "+3"),
    new HullType("carrier", 6e7, 0, 10, 75, 300, 1500, 14, 50, 100, 4, 3, "+3")
  ];
}
function getHullType(hullTypeName) {
  const types = allHullTypes();
  for (let i = 0; i < types.length; i++) {
    if (types[i].name === hullTypeName) {
      return types[i];
    }
  }
  return types[0];
}
function randomHullType(ownerType) {
  return getHullType(RND.item(ownerType.possibleHullTypes));
}
class OwnerType {
  name;
  isArmed;
  systemOnly;
  possibleHullTypes;
  getRandomClassName;
  getRandomShipName;
  requiredFittingType;
  fillWithCargo;
  allowedFittingTypes;
  constructor(name, isArmed, systemOnly, possibleHullTypes, getRandomClassName, getRandomShipName, requiredFittingType, fillWithCargo, allowedFittingTypes) {
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
          "Shannon"
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
          "Alistair"
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
        "support"
      ]
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
          "Shannon"
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
          "Alistair"
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
        "support"
      ]
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
          "Hulk"
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
          "Alistair"
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
        "support"
      ]
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
          "Badge"
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
          "LES"
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
        "weapons"
      ]
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
          "Juggernaut"
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
          "Gryphon"
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
        "weapons"
      ]
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
          "Paladin"
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
          "Hind"
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
        "weapons"
      ]
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
          "Shannon"
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
          "Solar Tide"
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
        "weapons"
      ]
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
          "Shannon"
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
          "Alistair"
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
        "support"
      ]
    )
  ];
  return RND.item(types);
}
class DriveFitting {
  name;
  cost;
  costExpands;
  power;
  powerExpands;
  mass;
  massExpands;
  minimumClass;
  maximumClass;
  effect;
  constructor(name, cost, power, mass, minimumClass, maximumClass, effect) {
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
    new DriveFitting("Spike Drive-2", 1e4, 1, 1, 0, 3, "Upgrade a spike drive to drive-2 rating"),
    new DriveFitting("Spike Drive-3", 2e4, 2, 2, 0, 3, "Upgrade a spike drive to drive-3 rating"),
    new DriveFitting("Spike Drive-4", 4e4, 2, 3, 1, 3, "Upgrade a spike drive to drive-4 rating"),
    new DriveFitting(
      "Spike Drive-5",
      1e5,
      3,
      3,
      1,
      3,
      "Upgrade a spike drive to drive-5 rating"
    ),
    new DriveFitting(
      "Spike Drive-6",
      5e5,
      3,
      4,
      2,
      3,
      "Upgrade a spike drive to drive-6 rating"
    )
  ];
}
function getFittingsByType(fittingType) {
  const all = allFittings();
  const result = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].fittingType === fittingType) {
      result.push(all[i]);
    }
  }
  return result;
}
class CargoFitting {
  name;
  fittingType;
  cost;
  costExpands;
  power;
  powerExpands;
  mass;
  massExpands;
  minimumClass;
  maximumClass;
  effect;
  constructor(name, cost, power, mass, minimumClass, maximumClass, effect) {
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
class Fitting {
  name;
  fittingType;
  cost;
  costExpands;
  power;
  powerExpands;
  mass;
  massExpands;
  minimumClass;
  maximumClass;
  effect;
  constructor(name, fittingType, cost, costExpands, power, powerExpands, mass, massExpands, minimumClass, maximumClass, effect) {
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
      1e4,
      true,
      1,
      true,
      2,
      false,
      1,
      3,
      "Skill bonus for analysis and research"
    ),
    new Fitting(
      "Advanced nav computer",
      "navigation",
      1e4,
      true,
      1,
      true,
      0,
      false,
      1,
      3,
      "Adds +2 for traveling familiar spike courses"
    ),
    new Fitting(
      "Amphibious operation",
      "landing",
      25e3,
      false,
      1,
      false,
      1,
      true,
      0,
      3,
      "Can land and can operate under water"
    ),
    new Fitting(
      "Armory",
      "weapons",
      1e4,
      true,
      0,
      false,
      0,
      false,
      1,
      3,
      "Weapons and armor for the crew"
    ),
    new Fitting(
      "Atmospheric configuration",
      "landing",
      5e3,
      true,
      0,
      false,
      1,
      false,
      0,
      1,
      "Can land"
    ),
    new Fitting(
      "Auto-targeting system",
      "weapons",
      5e4,
      false,
      1,
      false,
      0,
      false,
      0,
      3,
      "Fires one weapon system without a gunner"
    ),
    new Fitting(
      "Automation support",
      "computer",
      1e4,
      true,
      2,
      false,
      1,
      false,
      0,
      3,
      "Ship can use simple robots as crew"
    ),
    new Fitting(
      "Boarding tubes",
      "troops",
      5e3,
      true,
      0,
      false,
      1,
      false,
      1,
      3,
      "Allows boarding of a hostile disabled ship"
    ),
    new Fitting(
      "Cargo lighter",
      "shuttle",
      25e3,
      false,
      0,
      false,
      2,
      false,
      1,
      3,
      "Orbit-to-surface cargo shuttle"
    ),
    new CargoFitting("Cargo space", 0, 0, 1, 0, 3, "Pressurized cargo space"),
    new Fitting(
      "Cold sleep pods",
      "passenger",
      5e3,
      true,
      1,
      false,
      1,
      false,
      1,
      3,
      "Keeps occupants in stasis"
    ),
    new Fitting(
      "Colony core",
      "colony",
      1e5,
      true,
      4,
      false,
      2,
      true,
      1,
      3,
      "Ship can be deconstructed into a colony base"
    ),
    new Fitting(
      "Drill course regulator",
      "navigation",
      25e3,
      true,
      1,
      true,
      1,
      false,
      1,
      3,
      "Common drill routes become auto-successes"
    ),
    new Fitting(
      "Drop pod",
      "troops",
      3e5,
      false,
      0,
      false,
      2,
      false,
      1,
      3,
      "Stealthed landing pod for troops"
    ),
    new Fitting(
      "Emissions dampers",
      "stealth",
      25e3,
      true,
      1,
      true,
      1,
      true,
      0,
      3,
      "Adds +2 to skill checks to avoid detection"
    ),
    new Fitting(
      "Exodus bay",
      "passenger",
      5e4,
      true,
      1,
      true,
      2,
      true,
      2,
      3,
      "House vast numbers of cold sleep passengers"
    ),
    new Fitting(
      "Extended life support",
      "crew",
      5e3,
      true,
      1,
      true,
      1,
      true,
      0,
      3,
      "Doubles maximum crew size"
    ),
    new Fitting(
      "Extended medbay",
      "medical",
      5e3,
      true,
      1,
      false,
      1,
      false,
      1,
      3,
      "Can provide medical care to more patients"
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
      "Maximum life support duration is doubled"
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
      "Adds fuel for one more drill between fuelings"
    ),
    new Fitting(
      "Fuel scoops",
      "fuel",
      5e3,
      true,
      2,
      false,
      1,
      true,
      1,
      3,
      "Ship can scoop fuel from a gas giant or star"
    ),
    new Fitting(
      "Hydroponic production",
      "crew",
      1e4,
      true,
      1,
      true,
      2,
      true,
      2,
      3,
      "Ship produces life support resources"
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
      "Emergency escape craft for a ship's crew"
    ),
    new Fitting(
      "Luxury cabins",
      "crew",
      1e4,
      true,
      0,
      false,
      1,
      true,
      1,
      3,
      "10% of the max crew get luxurious quarters"
    ),
    new Fitting(
      "Mobile extractor",
      "mining",
      5e4,
      false,
      2,
      false,
      1,
      false,
      1,
      3,
      "Space mining and refinery fittings"
    ),
    new Fitting(
      "Mobile factory",
      "factory",
      5e4,
      true,
      3,
      false,
      2,
      true,
      2,
      3,
      "Self-sustaining factory and repair facilities"
    ),
    new Fitting(
      "Precognitive nav chamber",
      "psychic",
      1e5,
      true,
      1,
      false,
      0,
      false,
      1,
      3,
      "Allows a precog to assist in navigation"
    ),
    new Fitting(
      "Sensor mask",
      "stealth",
      1e4,
      true,
      1,
      true,
      0,
      false,
      1,
      3,
      "At long distances, disguise ship as another"
    ),
    new Fitting(
      "Ship bay: fighter",
      "carrier",
      2e5,
      false,
      0,
      false,
      2,
      false,
      2,
      3,
      "Carrier housing for a fighter"
    ),
    new Fitting(
      "Ship bay: frigate",
      "carrier",
      1e6,
      false,
      1,
      false,
      4,
      false,
      3,
      3,
      "Carrier housing for a frigate"
    ),
    new Fitting(
      "Ship's locker",
      "cargo",
      2e3,
      true,
      0,
      false,
      0,
      false,
      1,
      3,
      "General equipment for the crew"
    ),
    new Fitting(
      "Shiptender mount",
      "support",
      25e3,
      true,
      1,
      false,
      1,
      false,
      1,
      3,
      "Allow another ship to hitch on a spike drive"
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
      "Small amount of well-hidden cargo space"
    ),
    new Fitting(
      "Survey sensor array",
      "sensors",
      5e3,
      true,
      2,
      false,
      1,
      false,
      1,
      3,
      "Improved planetary sensor array"
    ),
    new Fitting(
      "Tractor beams",
      "support",
      1e4,
      true,
      2,
      false,
      1,
      false,
      1,
      3,
      "Manipulate objects in space at a distance"
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
      "Halve tonnage space of carried vehicles"
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
      "Automated tech workshops for maintenance"
    )
  ];
}
class DefenseFitting {
  name;
  fittingType;
  cost;
  costExpands;
  power;
  powerExpands;
  mass;
  massExpands;
  hullClass;
  minimumClass;
  maximumClass;
  effect;
  constructor(name, cost, power, mass, hullClass, effect) {
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
      1e5,
      5,
      2,
      3,
      "+1 AC, +20 maximum hit points"
    ),
    new DefenseFitting("Augmented Plating", 25e3, 0, 1, 0, "+2 AC, -1 Speed"),
    new DefenseFitting(
      "Boarding Countermeasures",
      25e3,
      2,
      1,
      1,
      "Makes enemy boarding more difficult"
    ),
    new DefenseFitting("Burst ECM Generator", 25e3, 2, 1, 1, "Negate one successful hit"),
    new DefenseFitting("Foxer Drones", 1e4, 2, 1, 3, "+2 AC for one round when fired, Ammo 5"),
    new DefenseFitting(
      "Grav Eddy Displacer",
      5e4,
      5,
      2,
      1,
      "1 in 6 chance of any given attack missing"
    ),
    new DefenseFitting(
      "Hardened Polyceramic Overlay",
      25e3,
      0,
      1,
      0,
      "AP quality of attacking weapons reduced by 5"
    ),
    new DefenseFitting(
      "Planetary Defense Array",
      5e4,
      4,
      2,
      1,
      "Anti-impact and anti-nuke surface defenses"
    ),
    new DefenseFitting(
      "Point Defense Lasers",
      1e4,
      3,
      2,
      1,
      "+2 AC versus weapons that use ammo"
    )
  ];
}
class Weapon {
  name;
  fittingType;
  cost;
  costExpands;
  damage;
  power;
  powerExpands;
  mass;
  massExpands;
  hardPoints;
  hullClass;
  minimumClass;
  maximumClass;
  TL;
  effect;
  qualities;
  constructor(name, cost, damage, power, mass, hardPoints, hullClass, TL, qualities) {
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
    new Weapon("Multifocal Laser", 1e5, "1d4", 5, 1, 1, 0, 4, ["AP 20"]),
    new Weapon("Reaper Battery", 1e5, "3d4", 4, 1, 1, 0, 4, ["Clumsy"]),
    new Weapon("Fractal Impact Charge", 2e5, "2d6", 5, 1, 1, 0, 4, ["AP 15", "Ammo 4"]),
    new Weapon("Polyspectral MES Beam", 2e6, "2d4", 5, 1, 1, 0, 5, ["AP 25"]),
    new Weapon("Sandthrower", 5e4, "2d4", 3, 1, 1, 0, 4, ["Flak"]),
    new Weapon("Flak Emitter Battery", 5e5, "2d6", 5, 3, 1, 1, 4, ["AP 10", "Flak"]),
    new Weapon("Torpedo Launcher", 5e5, "3d8", 10, 3, 1, 1, 4, ["AP 20", "Ammo 4"]),
    new Weapon("Charged Particle Caster", 8e5, "3d6", 10, 1, 2, 1, 4, ["AP 15", "Clumsy"]),
    new Weapon("Plasma Beam", 7e5, "3d6", 5, 2, 2, 1, 4, ["AP 10"]),
    new Weapon("Mag Spike Array", 1e6, "2d6+2", 5, 2, 2, 0, 4, ["AP 10", "Flak", "Ammo 5"]),
    new Weapon("Nuclear Missiles", 5e4, "Special", 5, 1, 2, 0, 4, ["Ammo 5"]),
    new Weapon("Spinal Beam Cannon", 15e5, "3d10", 10, 5, 3, 2, 4, ["AP 15", "Clumsy"]),
    new Weapon("Smart Cloud", 2e6, "3d10", 10, 5, 2, 2, 4, ["Cloud", "Clumsy"]),
    new Weapon("Gravcannon", 2e6, "4d6", 15, 4, 3, 2, 4, ["AP 20"]),
    new Weapon("Spike Inversion Projector", 25e5, "3d8", 10, 3, 3, 2, 4, ["AP 15"]),
    new Weapon("Vortex Tunnel Inductor", 5e6, "3d20", 20, 10, 4, 3, 4, ["AP 20", "Clumsy"]),
    new Weapon("Mass Cannon", 5e6, "2d20", 10, 5, 4, 3, 4, ["AP 20", "Ammo 4"]),
    new Weapon("Lightning Charge Mantle", 4e6, "1d20", 15, 5, 2, 3, 4, ["AP 5", "Cloud"]),
    new Weapon("Singularity Gun", 2e7, "5d20", 25, 10, 5, 3, 5, ["AP 25"])
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
          "Interstellar"
        ]);
        const suffix = RND.item(["Corporation", "Limited", "Technologies", "Fleet Systems"]);
        return prefix + " " + suffix;
      }
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
          "Si"
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
          "pu"
        ]);
        const suffix = RND.item(["dyne", "tech", "tronics", "flux"]);
        return pre1 + pre2 + suffix;
      }
    }
  ];
  const nameType = RND.item(nameTypes);
  return nameType.generate();
}
function removeFittingFromList(fitting, fittings) {
  const options = [];
  for (let i = 0; i < fittings.length; i++) {
    if (fittings[i].name != fitting.name) {
      options.push(fittings[i]);
    }
  }
  return options;
}
function removeWeaponFittingFromList(fitting, fittings) {
  const options = [];
  for (let i = 0; i < fittings.length; i++) {
    if (fittings[i].name != fitting.name) {
      options.push(fittings[i]);
    }
  }
  return options;
}
const css = {
  code: 'div.svelte-fmhe6u.svelte-fmhe6u,h1.svelte-fmhe6u.svelte-fmhe6u,h2.svelte-fmhe6u.svelte-fmhe6u,h4.svelte-fmhe6u.svelte-fmhe6u,p.svelte-fmhe6u.svelte-fmhe6u,strong.svelte-fmhe6u.svelte-fmhe6u,label.svelte-fmhe6u.svelte-fmhe6u,section.svelte-fmhe6u.svelte-fmhe6u{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-fmhe6u.svelte-fmhe6u{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-fmhe6u.svelte-fmhe6u,h2.svelte-fmhe6u.svelte-fmhe6u,h4.svelte-fmhe6u.svelte-fmhe6u{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-fmhe6u.svelte-fmhe6u{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-fmhe6u.svelte-fmhe6u{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h4.svelte-fmhe6u.svelte-fmhe6u{font-size:1.5rem;line-height:1.5rem}p.svelte-fmhe6u.svelte-fmhe6u{margin:1rem 0}label.svelte-fmhe6u.svelte-fmhe6u{font-weight:700;margin-right:1rem}input.svelte-fmhe6u.svelte-fmhe6u{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-fmhe6u.svelte-fmhe6u{margin-bottom:1rem}strong.svelte-fmhe6u.svelte-fmhe6u{font-weight:700}section.main.svelte-fmhe6u.svelte-fmhe6u{padding:0.5rem}#seed.svelte-fmhe6u.svelte-fmhe6u{font-family:monospace}.scifi.svelte-fmhe6u.svelte-fmhe6u{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-fmhe6u h1.svelte-fmhe6u,.scifi.svelte-fmhe6u h2.svelte-fmhe6u,.scifi.svelte-fmhe6u h4.svelte-fmhe6u{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-fmhe6u button.svelte-fmhe6u{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-fmhe6u button.svelte-fmhe6u:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-fmhe6u button.svelte-fmhe6u:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let starship = generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-pi6wnu_START -->${$$result.title = `<title>Stars Without Number Starship Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-pi6wnu_END -->`, ""} <section class="main scifi svelte-fmhe6u"><h1 class="svelte-fmhe6u" data-svelte-h="svelte-1wjkajd">Stars Without Number Starship Generator</h1> <div class="input-group svelte-fmhe6u"><label for="seed" class="svelte-fmhe6u" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-fmhe6u"${add_attribute("value", seed, 0)}></div> <button class="svelte-fmhe6u" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-fmhe6u" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <button class="svelte-fmhe6u" data-svelte-h="svelte-13jabvw">Save</button> <h2 class="svelte-fmhe6u">${escape(starship.name)}</h2> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-53rddp">Owner Type:</strong> ${escape(starship.ownerType.name)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-n2ia69">Manufacturer:</strong> ${escape(starship.manufacturer)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1n6jg5l">Model:</strong> ${escape(starship.className)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-j1brld">Hull Type:</strong> ${escape(starship.hullType.name)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1trbir7">Hull Class:</strong> ${escape(starship.hullType.hullClassName)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-76xse">Drive:</strong> ${escape(starship.drive.name)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1dyh534">Mass:</strong> ${escape(starship.usedMass)}/${escape(starship.hullType.mass)}
    (${escape(starship.hullType.mass - starship.usedMass)} free)</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-fk6lz1">Power:</strong> ${escape(starship.usedPower)}/${escape(starship.hullType.power)}
    (${escape(starship.hullType.power - starship.usedPower)} free)</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1dhodsa">Hardpoints:</strong> ${escape(starship.usedHardPoints)}/${escape(starship.hullType.hardPoints)}
    (${escape(starship.hullType.hardPoints - starship.usedHardPoints)} free)</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-68jrmf">Speed:</strong> ${escape(starship.hullType.speed)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1hp7ear">Armor:</strong> ${escape(starship.hullType.armor)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-6el7vw">AC:</strong> ${escape(starship.hullType.ac)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1cs6kjo">HP:</strong> ${escape(starship.hullType.hp)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1q8muh1">Minimum Crew:</strong> ${escape(starship.hullType.crewMinimum)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-kipncr">Maximum Crew:</strong> ${escape(starship.hullType.crewMaximum)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1uqmfn2">Current Crew:</strong> ${escape(starship.currentCrew)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-4ggtit">Total Ship Value:</strong> ${escape(new Intl.NumberFormat("en-US").format(starship.totalCost))} credits</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1il9rc6">Total Crew Cost:</strong> ${escape(new Intl.NumberFormat("en-US").format(starship.currentCrew * 43800))}
    credits per year</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-164ms38">Crew Skill:</strong> ${escape(starship.hullType.crewSkill)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1g7b8ps">Cargo Space:</strong> ${escape(starship.tonsOfCargo)} tons</p> <h4 class="svelte-fmhe6u" data-svelte-h="svelte-p0qu7e">Fittings</h4> ${each(starship.fittings, (fitting) => {
    return `<div class="svelte-fmhe6u">${escape(fitting.name)} - ${escape(fitting.effect)} </div>`;
  })} <h4 class="svelte-fmhe6u" data-svelte-h="svelte-1jz2vmd">Weapons</h4> ${each(starship.weapons, (weapon) => {
    return `<div class="svelte-fmhe6u">${escape(weapon.name)} (${escape(weapon.damage)}, ${escape(weapon.qualities.join(", "))})
    </div>`;
  })} <h4 class="svelte-fmhe6u" data-svelte-h="svelte-78ulrr">Defenses</h4> ${each(starship.defenses, (defense) => {
    return `<div class="svelte-fmhe6u">${escape(defense.name)}: ${escape(defense.effect)} </div>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-pSF_Xg9T.js.map
