import * as iarnd from "../random.js";
import * as Text from "../textformat.js";
import * as ModelNumber from "../names/modelnumbers.js";

const random = require("random");

export class SWNStarship {
  name;
  className;
  manufacturer;
  hullType;
  currentCrew;
  totalCost = 0;
  tonsOfCargo;
  usedMass;
  usedPower;
  usedHardpoints;
  ownerType;
  weapons = [];
  defenses = [];
  fittings = [];
  drive = 'Spike Drive-1';
}

export function generate() {
  let starship = new SWNStarship();

  starship.ownerType = randomStarshipOwnerType();

  starship.name = starship.ownerType.getRandomShipName();
  starship.className = starship.ownerType.getRandomClassName();
  starship.manufacturer = randomManufacturerName();

  let hullTypeName = iarnd.item(starship.ownerType.possibleHullTypes);
  starship.hullType = getHullType(hullTypeName);
  starship.currentCrew = random.int(starship.hullType.crewMinimum, starship.hullType.crewMaximum);

  let massBudget = starship.hullType.mass;
  let powerBudget = starship.hullType.power;
  let hardpointBudget = starship.hullType.hardpoints;

  let costMultiplier = 1;
  let massMultiplier = 1;
  let powerMultiplier = 1;

  starship.totalCost = starship.hullType.cost;

  if (starship.hullType.hullClass == 1) {
    costMultiplier = 10;
    powerMultiplier = 2;
    massMultiplier = 2;
  } else if (starship.hullType.hullClass == 2) {
    costMultiplier = 25;
    powerMultiplier = 3;
    massMultiplier = 3;
  } else if (starship.hullType.hullClass == 3) {
    costMultiplier = 100;
    powerMultiplier = 4;
    massMultiplier = 4;
  }

  if (starship.ownerType.systemOnly) {
    let systemDrive = {
      name: "System Drive",
      type: "drive",
      cost: 0,
      costExpands: true,
      power: 0,
      powerExpands: true,
      mass: 0,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Replace spike drive with small system drive",
    };

    starship.hullType.cost = Math.floor(starship.hullType.cost * 0.9);

    starship.hullType.power += powerMultiplier;
    starship.hullType.mass += (powerMultiplier * 2);
    starship.fittings.push(systemDrive);
    starship.drive = 'System Drive';

    massBudget = starship.hullType.mass;
    powerBudget = starship.hullType.power;

  } else {
    let chanceOfDriveUpgrade = random.int(1, 100);

    if (chanceOfDriveUpgrade > 70) {
      let allDrives = allDriveFittings();
      let drives = [];

      for (let i=0;i<allDrives.length;i++) {
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
        let driveUpgrade = iarnd.item(drives);

        starship.fittings.push(driveUpgrade);
        starship.drive = driveUpgrade.name;

        massBudget -= (driveUpgrade.mass * massMultiplier);
        powerBudget -= (driveUpgrade.power * powerMultiplier);
        starship.totalCost += (driveUpgrade.cost * costMultiplier);
      }
    }
  }

  if (starship.ownerType.isArmed) {
    let weaponList = allWeapons();
    let possibleWeapons = [];
    for (let i=0;i<weaponList.length;i++) {
      let weaponCost = weaponList[i].cost;
      let weaponMassCost = weaponList[i].mass;
      let weaponPowerCost = weaponList[i].power;
      let weaponHardpoints = weaponList[i].hardpoints;

      if (weaponList[i].massExpands) {
        weaponMassCost = weaponMassCost * massMultiplier;
      }

      if (weaponList[i].powerExpands) {
        weaponPowerCost = weaponPowerCost * powerMultiplier;
      }

      if (weaponList[i].costExpands) {
        weaponCost = weaponCost * costMultiplier;
      }

      if (weaponMassCost <= massBudget && weaponPowerCost <= powerBudget && weaponHardpoints <= hardpointBudget && weaponList[i].hullClass <= starship.hullType.hullClass) {
        possibleWeapons.push(weaponList[i]);
      }
    }

    let numberOfWeapons = random.int(1, 2);
    for (let i=0;i<numberOfWeapons;i++) {
      let newWeapon = iarnd.item(possibleWeapons);

      let weaponCost = newWeapon.cost;
      let weaponMassCost = newWeapon.mass;
      let weaponPowerCost = newWeapon.power;
      let weaponHardpoints = newWeapon.hardpoints;

      if (newWeapon.massExpands) {
        weaponMassCost = weaponMassCost * massMultiplier;
      }

      if (newWeapon.powerExpands) {
        weaponPowerCost = weaponPowerCost * powerMultiplier;
      }

      if (newWeapon.costExpands) {
        weaponCost = weaponCost * costMultiplier;
      }

      if (weaponMassCost <= massBudget && weaponPowerCost <= powerBudget && weaponHardpoints <= hardpointBudget && newWeapon.hullClass <= starship.hullType.hullClass) {
        starship.weapons.push(newWeapon);
        massBudget -= weaponMassCost;
        powerBudget -= weaponPowerCost;
        hardpointBudget -= weaponHardpoints;
      }

      possibleWeapons = removeFittingFromList(newWeapon, possibleWeapons);
    }

    // Begin addition of defenses

    let defenseList = allDefenses();
    let possibleDefenses = [];

    for (let i=0;i<defenseList.length;i++) {
      if (defenseList[i].hullClass <= starship.hullType.hullClass) {
        possibleDefenses.push(defenseList[i]);
      }
    }

    let numberOfDefenses = random.int(0, 2);

    for (let i=0;i<numberOfDefenses;i++) {
      let newDefense = iarnd.item(possibleDefenses);

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

  let possibleFittings = getAllAppropriateFittings(starship.ownerType.allowedFittingTypes);
  let fittingOptions = filterFittingsByHullClass(possibleFittings, starship.hullType.hullClass);

  // Begin addition of required fitting

  let requiredFittingOptions = getFittingsByType(starship.ownerType.requiredFittingType);
  requiredFittingOptions = filterFittingsByHullClass(requiredFittingOptions, starship.hullType.hullClass);

  if (requiredFittingOptions.length > 0) {
    let requiredFitting = iarnd.item(requiredFittingOptions);
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

  let maxNumberOfFittings = random.int(1, 3);

  for (let i=0;i<maxNumberOfFittings;i++) {
    let newFitting = iarnd.item(fittingOptions);

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
    let cargoFitting = {
      name: "Cargo space",
      type: "cargo",
      cost: 0,
      costExpands: false,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Pressurized cargo space",
    };

    let foundCargo = false;

    let tonsMultiplier = 2;

    if (starship.hullType.hullClass == 1) {
      tonsMultiplier = 20;
    } else if (starship.hullType.hullClass == 2) {
      tonsMultiplier = 200;
    } else if (starship.hullType.hullClass == 3) {
      tonsMultiplier = 2000;
    }

    for (let i=0;i<starship.fittings.length;i++) {
      if (starship.fittings[i].name == "Cargo space") {
        foundCargo = true;
        tonsOfCargo = tonsMultiplier;
      }
    }

    if (!foundCargo) {
      starship.fittings.push(cargoFitting);
      massBudget--;
    }

    let numberOfCargoFittings = massBudget * 1;

    for (let i=0;i<numberOfCargoFittings;i++) {
      tonsOfCargo += tonsMultiplier;
      massBudget--;
    }
  }

  starship.tonsOfCargo = tonsOfCargo;

  starship.usedMass = starship.hullType.mass - massBudget;
  starship.usedPower = starship.hullType.power - powerBudget;
  starship.usedHardpoints = starship.hullType.hardpoints - hardpointBudget;

  return starship;
}

function filterFittingsByHullClass(fittings, hullClass) {
  let result = [];

  for (let i=0;i<fittings.length;i++) {
    if (fittings[i].minimumClass <= hullClass && fittings[i].maximumClass >= hullClass) {
      result.push(fittings[i]);
    }
  }

  return result;
}

function getAllAppropriateFittings(fittingTypes) {
  let all = allFittings();

  let fittings = [];

  for (let i=0;i<all.length;i++) {
    if (fittingTypes.includes(all[i].type)) {
      fittings.push(all[i]);
    }
  }

  return fittings;
}

function getHullClassName(hullClassLevel) {
  if (hullClassLevel == 0) {
    return "fighter";
  } else if (hullClassLevel == 1) {
    return "frigate";
  } else if (hullClassLevel == 2) {
    return "cruiser";
  } else if (hullClassLevel == 3) {
    return "capital";
  } else {
    return "station";
  }
}

function getHullType(hullTypeName) {
  let types = [
    {
      name: "strike fighter",
      cost: 200000,
      speed: 5,
      armor: 5,
      HP: 8,
      crewMinimum: 1,
      crewMaximum: 11,
      AC: 16,
      power: 5,
      mass: 2,
      hardpoints: 1,
      hullClass: 0,
      crewSkill: '+2',
    },
    {
      name: "shuttle",
      cost: 200000,
      speed: 3,
      armor: 0,
      HP: 15,
      crewMinimum: 1,
      crewMaximum: 10,
      AC: 11,
      power: 3,
      mass: 5,
      hardpoints: 1,
      hullClass: 0,
      crewSkill: '+1',
    },
    {
      name: "free merchant",
      cost: 500000,
      speed: 3,
      armor: 2,
      HP: 20,
      crewMinimum: 1,
      crewMaximum: 6,
      AC: 14,
      power: 10,
      mass: 15,
      hardpoints: 2,
      hullClass: 1,
      crewSkill: '+1',
    },
    {
      name: "patrol boat",
      cost: 2500000,
      speed: 4,
      armor: 5,
      HP: 25,
      crewMinimum: 5,
      crewMaximum: 20,
      AC: 14,
      power: 15,
      mass: 10,
      hardpoints: 4,
      hullClass: 1,
      crewSkill: '+2',
    },
    {
      name: "corvette",
      cost: 4000000,
      speed: 2,
      armor: 10,
      HP: 40,
      crewMinimum: 10,
      crewMaximum: 40,
      AC: 13,
      power: 15,
      mass: 15,
      hardpoints: 6,
      hullClass: 1,
      crewSkill: '+2',
    },
    {
      name: "heavy frigate",
      cost: 7000000,
      speed: 1,
      armor: 10,
      HP: 50,
      crewMinimum: 30,
      crewMaximum: 120,
      AC: 15,
      power: 25,
      mass: 20,
      hardpoints: 8,
      hullClass: 1,
      crewSkill: '+2',
    },
    {
      name: "bulk freighter",
      cost: 5000000,
      speed: 0,
      armor: 0,
      HP: 40,
      crewMinimum: 10,
      crewMaximum: 40,
      AC: 11,
      power: 15,
      mass: 25,
      hardpoints: 2,
      hullClass: 2,
      crewSkill: '+1',
    },
    {
      name: "fleet cruiser",
      cost: 10000000,
      speed: 1,
      armor: 15,
      HP: 60,
      crewMinimum: 50,
      crewMaximum: 200,
      AC: 14,
      power: 50,
      mass: 30,
      hardpoints: 10,
      hullClass: 2,
      crewSkill: '+2',
    },
    {
      name: "battleship",
      cost: 50000000,
      speed: 0,
      armor: 20,
      HP: 100,
      crewMinimum: 200,
      crewMaximum: 1000,
      AC: 16,
      power: 75,
      mass: 50,
      hardpoints: 15,
      hullClass: 3,
      crewSkill: '+3',
    },
    {
      name: "carrier",
      cost: 60000000,
      speed: 0,
      armor: 10,
      HP: 75,
      crewMinimum: 300,
      crewMaximum: 1500,
      AC: 14,
      power: 50,
      mass: 100,
      hardpoints: 4,
      hullClass: 3,
      crewSkill: '+3',
    },
  ];

  for (let i=0;i<types.length;i++) {
    types[i].hullClassName = getHullClassName(types[i].hullClass);
    if (types[i].name == hullTypeName) {
      return types[i];
    }
  }
}

function randomStarshipOwnerType() {
  let types = [
    {
      name: "civilian",
      isArmed: false,
      systemOnly: false,
      possibleHullTypes: [
        "shuttle",
        "free merchant",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let modelNumber = ModelNumber.generate();

        return modelNumber + " " + iarnd.item(shipClassNames);
      },
      getRandomShipName: function() {
        let shipNames = [
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

        return iarnd.item(shipNames);
      },
      requiredFittingType: "cargo",
      fillWithCargo: false,
      allowedFittingTypes: [
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
    },
    {
      name: "merchant",
      isArmed: false,
      systemOnly: false,
      possibleHullTypes: [
        "shuttle",
        "free merchant",
        "bulk freighter",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let modelNumber = ModelNumber.generate();

        return modelNumber + " " + iarnd.item(shipClassNames);
      },
      getRandomShipName: function() {
        let shipNames = [
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

        return iarnd.item(shipNames);
      },
      requiredFittingType: "cargo",
      fillWithCargo: true,
      allowedFittingTypes: [
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
    },
    {
      name: "mining ship",
      isArmed: false,
      systemOnly: false,
      possibleHullTypes: [
        "shuttle",
        "free merchant",
        "bulk freighter",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let modelNumber = ModelNumber.generate();

        return modelNumber + " " + iarnd.item(shipClassNames);
      },
      getRandomShipName: function() {
        let shipNames = [
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

        return iarnd.item(shipNames);
      },
      requiredFittingType: "mining",
      fillWithCargo: true,
      allowedFittingTypes: [
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
    },
    {
      name: "law enforcement",
      isArmed: true,
      systemOnly: true,
      possibleHullTypes: [
        "patrol boat",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let modelNumber = ModelNumber.generate();

        return modelNumber + " " + iarnd.item(shipClassNames);
      },
      getRandomShipName: function() {
        let shipName = "";

        let designation = iarnd.item([
          "PS",
          "SPS",
          "SP",
          "Star Police Cruiser",
          "Solar Police",
          "Star Police",
          "LES",
        ]);

        shipName = designation;

        let unitNumber = random.int(100, 500);

        let designationForm = random.int(0, 100);

        if (designationForm < 30) {
          shipName += " " + unitNumber;
        } else if (designationForm < 70) {
          shipName += " " + random.int(1, 9) + "-" + unitNumber;
        } else {
          shipName += " Unit " + unitNumber;
        }

        return shipName;
      },
      requiredFittingType: "weapons",
      fillWithCargo: false,
      allowedFittingTypes: [
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
    },
    {
      name: "military line of battle",
      isArmed: true,
      systemOnly: false,
      possibleHullTypes: [
        "fleet cruiser",
        "battleship",
        "carrier",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let className = iarnd.item(shipClassNames) + "-class";

        return className;
      },
      getRandomShipName: function() {
        let shipNames = [
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

        let designator = iarnd.item([
          "HMS",
          "USS",
          "ISS",
        ]);

        let shipName = designator + " " + iarnd.item(shipNames);

        return shipName;
      },
      requiredFittingType: "weapons",
      fillWithCargo: false,
      allowedFittingTypes: [
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
    },
    {
      name: "military patroller",
      isArmed: true,
      systemOnly: false,
      possibleHullTypes: [
        "patrol boat",
        "corvette",
        "heavy frigate",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let className = iarnd.item(shipClassNames) + "-class";

        return className;
      },
      getRandomShipName: function() {
        let shipNames = [
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

        let designator = iarnd.item([
          "HMS",
          "USS",
          "ISS",
        ]);

        let shipName = designator + " " + iarnd.item(shipNames);

        return shipName;
      },
      requiredFittingType: "weapons",
      fillWithCargo: false,
      allowedFittingTypes: [
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
    },
    {
      name: "pirate",
      isArmed: true,
      systemOnly: false,
      possibleHullTypes: [
        "strike fighter",
        "patrol boat",
        "corvette",
        "heavy frigate",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let modelNumber = ModelNumber.generate();

        return modelNumber + " " + iarnd.item(shipClassNames);
      },
      getRandomShipName: function() {
        let shipNames = [
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

        return iarnd.item(shipNames);
      },
      requiredFittingType: "weapons",
      fillWithCargo: false,
      allowedFittingTypes: [
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
    },
    {
      name: "smuggler",
      isArmed: true,
      systemOnly: false,
      possibleHullTypes: [
        "free merchant",
        "patrol boat",
      ],
      getRandomClassName: function() {
        let shipClassNames = [
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

        let modelNumber = ModelNumber.generate();

        return modelNumber + " " + iarnd.item(shipClassNames);
      },
      getRandomShipName: function() {
        let shipNames = [
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

        return iarnd.item(shipNames);
      },
      requiredFittingType: "smuggling",
      fillWithCargo: true,
      allowedFittingTypes: [
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
    },
  ];

  return iarnd.item(types);
}

function allDriveFittings() {
  return [
    {
      name: "Spike Drive-2",
      type: "drive",
      cost: 10000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 1,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Upgrade a spike drive to drive-2 rating",
    },
    {
      name: "Spike Drive-3",
      type: "drive",
      cost: 20000,
      costExpands: true,
      power: 2,
      powerExpands: true,
      mass: 2,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Upgrade a spike drive to drive-3 rating",
    },
    {
      name: "Spike Drive-4",
      type: "drive",
      cost: 40000,
      costExpands: true,
      power: 2,
      powerExpands: true,
      mass: 3,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Upgrade a spike drive to drive-4 rating",
    },
    {
      name: "Spike Drive-5",
      type: "drive",
      cost: 100000,
      costExpands: true,
      power: 3,
      powerExpands: true,
      mass: 3,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Upgrade a spike drive to drive-5 rating",
    },
    {
      name: "Spike Drive-6",
      type: "drive",
      cost: 500000,
      costExpands: true,
      power: 3,
      powerExpands: true,
      mass: 4,
      massExpands: true,
      minimumClass: 2,
      maximumClass: 3,
      effect: "Upgrade a spike drive to drive-6 rating",
    },
  ];
}

function getFittingsByType(fittingType) {
  let all = allFittings();
  let result = [];

  for (let i=0;i<all.length;i++) {
    if (all[i].type == fittingType) {
      result.push(all[i]);
    }
  }

  return result;
}

function allFittings() {
  return [
    {
      name: "Advanced lab",
      type: "science",
      cost: 10000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 2,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Skill bonus for analysis and research",
    },
    {
      name: "Advanced nav computer",
      type: "navigation",
      cost: 10000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 0,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Adds +2 for traveling familiar spike courses",
    },
    {
      name: "Amphibious operation",
      type: "landing",
      cost: 25000,
      costExpands: false,
      power: 1,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Can land and can operate under water",
    },
    {
      name: "Armory",
      type: "weapons",
      cost: 10000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 0,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Weapons and armor for the crew",
    },
    {
      name: "Atmospheric configuration",
      type: "landing",
      cost: 5000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 1,
      effect: "Can land",
    },
    {
      name: "Auto-targeting system",
      type: "weapons",
      cost: 50000,
      costExpands: false,
      power: 1,
      powerExpands: false,
      mass: 0,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Fires one weapon system withou a gunner",
    },
    {
      name: "Automation support",
      type: "computer",
      cost: 10000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Ship can use simple robots as crew",
    },
    {
      name: "Boarding tubes",
      type: "troops",
      cost: 5000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Allows boarding of a hostile disabled ship",
    },
    {
      name: "Cargo lighter",
      type: "shuttle",
      cost: 25000,
      costExpands: false,
      power: 0,
      powerExpands: false,
      mass: 2,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Orbit-to-surface cargo shuttle",
    },
    {
      name: "Cargo space",
      type: "cargo",
      cost: 0,
      costExpands: false,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Pressurized cargo space",
    },
    {
      name: "Cold sleep pods",
      type: "passenger",
      cost: 5000,
      costExpands: true,
      power: 1,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Keeps occupants in stasis",
    },
    {
      name: "Colony core",
      type: "colony",
      cost: 100000,
      costExpands: true,
      power: 4,
      powerExpands: false,
      mass: 2,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Ship can be deconstructed into a colony base",
    },
    {
      name: "Drill course regulator",
      type: "navigation",
      cost: 25000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Common drill routes become auto-successes",
    },
    {
      name: "Drop pod",
      type: "troops",
      cost: 300000,
      costExpands: false,
      power: 0,
      powerExpands: false,
      mass: 2,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Stealthed landing pod for troops",
    },
    {
      name: "Emissions dampers",
      type: "stealth",
      cost: 25000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 1,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Adds +2 to skill checks to avoid detection",
    },
    {
      name: "Exodus bay",
      type: "passenger",
      cost: 50000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 2,
      massExpands: true,
      minimumClass: 2,
      maximumClass: 3,
      effect: "House vast numbers of cold sleep passengers",
    },
    {
      name: "Extended life support",
      type: "crew",
      cost: 5000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 1,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Doubles maximum crew size",
    },
    {
      name: "Extended medbay",
      type: "medical",
      cost: 5000,
      costExpands: true,
      power: 1,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Can provide medical care to more patients",
    },
    {
      name: "Extended stores",
      type: "crew",
      cost: 2500,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Maximum life support duration is doubled",
    },
    {
      name: "Fuel bunkers",
      type: "fuel",
      cost: 2500,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Adds fuel for one more drill between fuelings",
    },
    {
      name: "Fuel scoops",
      type: "fuel",
      cost: 5000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Ship can scoop fuel from a gas giant or star",
    },
    {
      name: "Hydroponic production",
      type: "crew",
      cost: 10000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 2,
      massExpands: true,
      minimumClass: 2,
      maximumClass: 3,
      effect: "Ship produces life support resources",
    },
    {
      name: "Lifeboats",
      type: "shuttle",
      cost: 2500,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Emergency escape craft for a ship's crew",
    },
    {
      name: "Luxury cabins",
      type: "crew",
      cost: 10000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "10% of the max crew get luxurious quarters",
    },
    {
      name: "Mobile extractor",
      type: "mining",
      cost: 50000,
      costExpands: false,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Space mining and refinery fittings",
    },
    {
      name: "Mobile factory",
      type: "factory",
      cost: 50000,
      costExpands: true,
      power: 3,
      powerExpands: false,
      mass: 2,
      massExpands: true,
      minimumClass: 2,
      maximumClass: 3,
      effect: "Self-sustaining factory and repair facilities",
    },
    {
      name: "Precognitive nav chamber",
      type: "psychic",
      cost: 100000,
      costExpands: true,
      power: 1,
      powerExpands: false,
      mass: 0,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Allows a precog to assist in navigation",
    },
    {
      name: "Sensor mask",
      type: "stealth",
      cost: 10000,
      costExpands: true,
      power: 1,
      powerExpands: true,
      mass: 0,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "At long distances, disguise ship as another",
    },
    {
      name: "Ship bay: fighter",
      type: "carrier",
      cost: 200000,
      costExpands: false,
      power: 0,
      powerExpands: false,
      mass: 2,
      massExpands: false,
      minimumClass: 2,
      maximumClass: 3,
      effect: "Carrier housing for a fighter",
    },
    {
      name: "Ship bay: frigate",
      type: "carrier",
      cost: 1000000,
      costExpands: false,
      power: 1,
      powerExpands: false,
      mass: 4,
      massExpands: false,
      minimumClass: 3,
      maximumClass: 3,
      effect: "Carrier housing for a frigate",
    },
    {
      name: "Ship's locker",
      type: "cargo",
      cost: 2000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 0,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "General equipment for the crew",
    },
    {
      name: "Shiptender mount",
      type: "support",
      cost: 25000,
      costExpands: true,
      power: 1,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Allow another ship to hitch on a spike drive",
    },
    {
      name: "Smuggler's hold",
      type: "smuggling",
      cost: 2500,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 0,
      maximumClass: 3,
      effect: "Small amount of well-hidden cargo space",
    },
    {
      name: "Survey sensor array",
      type: "sensors",
      cost: 5000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Improved planetary sensor array",
    },
    {
      name: "Tractor beams",
      type: "support",
      cost: 10000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: false,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Manipulate objects in space at a distance",
    },
    {
      name: "Vehicle transport fittings",
      type: "carrier",
      cost: 2500,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Halve tonnage space of carried vehicles",
    },
    {
      name: "Workshop",
      type: "support",
      cost: 500,
      costExpands: true,
      power: 1,
      powerExpands: false,
      mass: 0.5,
      massExpands: true,
      minimumClass: 1,
      maximumClass: 3,
      effect: "Automated tech workshops for maintenance",
    },
  ]
}

function allDefenses() {
  return [
    {
      name: "Ablative Hull Compartments",
      cost: 100000,
      costExpands: true,
      power: 5,
      powerExpands: false,
      mass: 2,
      massExpands: true,
      hullClass: 3,
      effect: "+1 AC, +20 maximum hit points",
    },
    {
      name: "Augmented Plating",
      cost: 25000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      hullClass: 0,
      effect: "+2 AC, -1 Speed",
    },
    {
      name: "Boarding Countermeasures",
      cost: 25000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      hullClass: 1,
      effect: "Makes enemy boarding more difficult",
    },
    {
      name: "Burst ECM Generator",
      cost: 25000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      hullClass: 1,
      effect: "Negate one successful hit",
    },
    {
      name: "Foxer Drones",
      cost: 10000,
      costExpands: true,
      power: 2,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      hullClass: 3,
      effect: "+2 AC for one round when fired, Ammo 5",
    },
    {
      name: "Grav Eddy Displacer",
      cost: 50000,
      costExpands: true,
      power: 5,
      powerExpands: false,
      mass: 2,
      massExpands: true,
      hullClass: 1,
      effect: "1 in 6 chance of any given attack missing",
    },
    {
      name: "Hardened Polyceramic Overlay",
      cost: 25000,
      costExpands: true,
      power: 0,
      powerExpands: false,
      mass: 1,
      massExpands: true,
      hullClass: 0,
      effect: "AP quality of attacking weapons reduced by 5",
    },
    {
      name: "Planetary Defense Array",
      cost: 50000,
      costExpands: true,
      power: 4,
      powerExpands: false,
      mass: 2,
      massExpands: true,
      hullClass: 1,
      effect: "Anti-impact and anti-nuke surface defenses",
    },
    {
      name: "Point Defense Lasers",
      cost: 10000,
      costExpands: true,
      power: 3,
      powerExpands: false,
      mass: 2,
      massExpands: true,
      hullClass: 1,
      effect: "+2 AC versus weapons that use ammo",
    },
  ];
}

function allWeapons() {
  return [
    {
      name: "Multifocal Laser",
      cost: 100000,
      damage: "1d4",
      power: 5,
      mass: 1,
      hardpoints: 1,
      hullClass: 0,
      TL: 4,
      qualities: [
        "AP 20",
      ],
    },
    {
      name: "Reaper Battery",
      cost: 100000,
      damage: "3d4",
      power: 4,
      mass: 1,
      hardpoints: 1,
      hullClass: 0,
      TL: 4,
      qualities: [
        "Clumsy",
      ],
    },
    {
      name: "Fractal Impact Charge",
      cost: 200000,
      damage: "2d6",
      power: 5,
      mass: 1,
      hardpoints: 1,
      hullClass: 0,
      TL: 4,
      qualities: [
        "AP 15",
        "Ammo 4",
      ],
    },
    {
      name: "Polyspectral MES Beam",
      cost: 2000000,
      damage: "2d4",
      power: 5,
      mass: 1,
      hardpoints: 1,
      hullClass: 0,
      TL: 5,
      qualities: [
        "AP 25",
      ],
    },
    {
      name: "Sandthrower",
      cost: 50000,
      damage: "2d4",
      power: 3,
      mass: 1,
      hardpoints: 1,
      hullClass: 0,
      TL: 4,
      qualities: [
        "Flak",
      ],
    },
    {
      name: "Flak Emitter Battery",
      cost: 500000,
      damage: "2d6",
      power: 5,
      mass: 3,
      hardpoints: 1,
      hullClass: 1,
      TL: 4,
      qualities: [
        "AP 10",
        "Flak",
      ],
    },
    {
      name: "Torpedo Launcher",
      cost: 500000,
      damage: "3d8",
      power: 10,
      mass: 3,
      hardpoints: 1,
      hullClass: 1,
      TL: 4,
      qualities: [
        "AP 20",
        "Ammo 4",
      ],
    },
    {
      name: "Charged Particle Caster",
      cost: 800000,
      damage: "3d6",
      power: 10,
      mass: 1,
      hardpoints: 2,
      hullClass: 1,
      TL: 4,
      qualities: [
        "AP 15",
        "Clumsy",
      ],
    },
    {
      name: "Plasma Beam",
      cost: 700000,
      damage: "3d6",
      power: 5,
      mass: 2,
      hardpoints: 2,
      hullClass: 1,
      TL: 4,
      qualities: [
        "AP 10",
      ],
    },
    {
      name: "Mag Spike Array",
      cost: 1000000,
      damage: "2d6+2",
      power: 5,
      mass: 2,
      hardpoints: 2,
      hullClass: 0,
      TL: 4,
      qualities: [
        "AP 10",
        "Flak",
        "Ammo 5",
      ],
    },
    {
      name: "Nuclear Missiles",
      cost: 50000,
      damage: "Special",
      power: 5,
      mass: 1,
      hardpoints: 2,
      hullClass: 0,
      TL: 4,
      qualities: [
        "Ammo 5",
      ],
    },
    {
      name: "Spinal Beam Cannon",
      cost: 1500000,
      damage: "3d10",
      power: 10,
      mass: 5,
      hardpoints: 3,
      hullClass: 2,
      TL: 4,
      qualities: [
        "AP 15",
        "Clumsy",
      ],
    },
    {
      name: "Smart Cloud",
      cost: 2000000,
      damage: "3d10",
      power: 10,
      mass: 5,
      hardpoints: 2,
      hullClass: 2,
      TL: 4,
      qualities: [
        "Cloud",
        "Clumsy",
      ],
    },
    {
      name: "Gravcannon",
      cost: 2000000,
      damage: "4d6",
      power: 15,
      mass: 4,
      hardpoints: 3,
      hullClass: 2,
      TL: 4,
      qualities: [
        "AP 20",
      ],
    },
    {
      name: "Spike Inversion Projector",
      cost: 2500000,
      damage: "3d8",
      power: 10,
      mass: 3,
      hardpoints: 3,
      hullClass: 2,
      TL: 4,
      qualities: [
        "AP 15",
      ],
    },
    {
      name: "Vortex Tunnel Inductor",
      cost: 5000000,
      damage: "3d20",
      power: 20,
      mass: 10,
      hardpoints: 4,
      hullClass: 3,
      TL: 4,
      qualities: [
        "AP 20",
        "Clumsy",
      ],
    },
    {
      name: "Mass Cannon",
      cost: 5000000,
      damage: "2d20",
      power: 10,
      mass: 5,
      hardpoints: 4,
      hullClass: 3,
      TL: 4,
      qualities: [
        "AP 20",
        "Ammo 4",
      ],
    },
    {
      name: "Lightning Charge Mantle",
      cost: 4000000,
      damage: "1d20",
      power: 15,
      mass: 5,
      hardpoints: 2,
      hullClass: 3,
      TL: 4,
      qualities: [
        "AP 5",
        "Cloud",
      ],
    },
    {
      name: "Singularity Gun",
      cost: 20000000,
      damage: "5d20",
      power: 25,
      mass: 10,
      hardpoints: 5,
      hullClass: 3,
      TL: 5,
      qualities: [
        "AP 25",
      ],
    },
  ];
}

function randomManufacturerName() {
  let nameTypes = [
    {
      generate: function() {
        let prefix = iarnd.item([
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

        let suffix = iarnd.item([
          "Corporation",
          "Limited",
          "Technologies",
          "Fleet Systems",
        ]);

        return prefix + " " + suffix;
      }
    },
    {
      generate: function() {
        let pre1 = iarnd.item([
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

        let pre2 = iarnd.item([
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

        let suffix = iarnd.item([
          "dyne",
          "tech",
          "tronics",
          "flux",
        ]);

        return pre1 + pre2 + suffix;
      }
    }
  ];

  let nameType = iarnd.item(nameTypes);

  return nameType.generate();
}

function removeFittingFromList(fitting, fittings) {
  let options = [];

  for (let i=0;i<fittings.length;i++) {
    if (fittings[i].name != fitting.name) {
      options.push(fittings[i]);
    }
  }

  return options;
}

export function formatAsText(starship) {
  let description = Text.header(starship.name);

  description += "Owner Type: " + starship.ownerType.name + "\n";
  description += "Manufacturer: " + starship.manufacturer + "\n";
  description += "Model: " + starship.className + "\n";
  description += "Hull Type: " + starship.hullType.name + "\n";
  description += "Hull Class: " + starship.hullType.hullClassName + "\n";
  description += "Drive: " + starship.drive + "\n";
  description += "Maximum Mass: " + starship.hullType.mass + "\n";
  description += "Mass Used: " + starship.usedMass + "\n";
  description += "Maximum Power: " + starship.hullType.power + "\n";
  description += "Power Used: " + starship.usedPower + "\n";
  description += "AC: " + starship.hullType.AC + "\n";
  description += "HP: " + starship.hullType.HP + "\n";
  description += "Minimum Crew: " + starship.hullType.crewMinimum + "\n";
  description += "Maximum Crew: " + starship.hullType.crewMaximum + "\n";
  description += "Current Crew: " + starship.currentCrew + "\n";
  description += "Total Ship Value: " + new Intl.NumberFormat('en-US').format(starship.totalCost) + " credits\n";
  description += "Total Crew Cost: " + new Intl.NumberFormat('en-US').format(starship.currentCrew * 43800) + " credits per year\n";
  description += "Crew Skill: " + starship.hullType.crewSkill + "\n";
  description += "Cargo Space: " + starship.tonsOfCargo + " tons\n";

  let fittings = [];

  for (let i=0;i<starship.fittings.length;i++) {
    let fitting = starship.fittings[i].name + ": " + starship.fittings[i].effect;
    fittings.push(fitting);
  }

  description += Text.header("Fittings");

  description += Text.list(fittings);

  let weapons = [];

  for (let i=0;i<starship.weapons.length;i++) {
    let weapon = starship.weapons[i].name + ": " + starship.weapons[i].damage + " damage, " + starship.weapons[i].qualities.join(', ');
    weapons.push(weapon);
  }

  description += Text.header("Weapons");

  description += Text.list(weapons);

  let defenses = [];

  for (let i=0;i<starship.defenses.length;i++) {
    let defense = starship.defenses[i].name + ": " + starship.defenses[i].effect;
    defenses.push(defense);
  }

  description += Text.header("Defenses");

  description += Text.list(defenses);

  return description;
}
