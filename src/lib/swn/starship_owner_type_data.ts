import * as MUN from '@ironarachne/made-up-names';
import * as RNG from '@ironarachne/rng';

import type { OwnerType } from './starship';

/**
 * Who a starship belongs to, which decides its hull, its armament, and how it is named.
 *
 * The name pools are shared deliberately: a pirate flies the same civilian hulls as a free
 * trader, so it draws its class names from the same list. Each `getRandom*Name` helper is a
 * function rather than a plain list because several owners compose a name from more than one
 * draw, and the order of those draws is what a seed reproduces.
 */

/** Civilian hulls sold to traders, pirates, and smugglers alike. */
const CIVILIAN_CLASS_NAMES = [
  'Coventry',
  'Hermes',
  'Laurel',
  'Mermaid',
  'Star Runner',
  'Venus',
  'Amazon',
  'Hermione',
  'Cerce',
  'Triton',
  'Wizard',
  'Minerva',
  'Pallas',
  'Antioch',
  'Cerberus',
  'Diana',
  'Dryad',
  'Phoebe',
  'Emerald',
  'Ruby',
  'Diamond',
  'Seahorse',
  'Stag',
  'Hydra',
  'Boadicea',
  'Galatea',
  'Shannon',
];

const MINING_CLASS_NAMES = [
  'Behemoth',
  'Leviathan',
  'Hermes',
  'Workhorse',
  'Odyssey',
  'Sojourner',
  'Prospect',
  'Procurer',
  'Retriever',
  'Covetor',
  'Venture',
  'Endurance',
  'Orca',
  'Hulk',
];

const LAW_ENFORCEMENT_CLASS_NAMES = [
  'Shrike',
  'Shooting Star',
  'Vindicator',
  'Centurion',
  'Sentinel',
  'Guardian',
  'Defender',
  'Patroller',
  'Sherriff',
  'Constable',
  'Cavalry',
  'Marshal',
  'Badge',
];

const LINE_OF_BATTLE_CLASS_NAMES = [
  'Vindicator',
  'Imperator',
  'Executor',
  'Dreadnought',
  'Invictus',
  'Leviathan',
  'Balwark',
  'Sun Crusher',
  'Brutality',
  'Victory',
  'Guardian',
  'Dominator',
  'Annihilator',
  'Titan',
  'Sovereign',
  'Juggernaut',
];

const PATROLLER_CLASS_NAMES = [
  'Vanguard',
  'Shrike',
  'Avenger',
  'Cutter',
  'Ghost',
  'Specter',
  'Centipede',
  'Wasp',
  'Hornet',
  'Dart',
  'Talon',
  'Bandit',
  'Lancer',
  'Angel',
  'Paladin',
];

/** The workaday names a trader, miner, or smuggler paints on the hull. */
const TRAMP_SHIP_NAMES = [
  'Mistral',
  'Dictator',
  'Alceste',
  'Kilmersdon',
  'Goldfinch',
  'Century Hawk',
  'Brazen Mistress',
  'Norman',
  'Badger',
  'Nox',
  'Dredger',
  'Mimosa',
  'Scotch',
  'Bad Wine',
  'Lady Luck',
  'Powerful',
  'Glasgow',
  'Errant',
  'Pouncer',
  'Ayrshire',
  'Rocinante',
  'Mercy',
  'Princess',
  'Aphrodite',
  'Athena',
  'Hera',
  'Deidre',
  'Naomi',
  'Alice',
  'Denali',
  'Roberta',
  'Darlin',
  'Marlin',
  'Swordfish',
  'Borderstar',
  'Bad Habit',
  'Escolano',
  'Simplicity',
  'Good Fortune',
  'Fortune',
  'Alistair',
];

const LINE_OF_BATTLE_SHIP_NAMES = [
  'Righteousness',
  'Hammer of God',
  'Apollo',
  'Alexander',
  'Atalanta',
  'Baroness',
  'Baron',
  'Oberon',
  'Wrath',
  'Honor',
  'Gladius',
  'Harlegand',
  'Hittite',
  'Karnack',
  'Helios',
  'Andromeda',
  'Liberator',
  'Nirvana',
  'Khan',
  'Adogan',
  'Chimera',
  'Warlock',
  'Warlord',
  'Centipede',
  'Manticore',
  'Gryphon',
];

const PATROLLER_SHIP_NAMES = [
  'Gibraltar',
  'Biddeford',
  'Seaford',
  'Pandora',
  'Siren',
  'Champion',
  'Daphne',
  'Unicorn',
  'Perseus',
  'Sphinx',
  'Gryphon',
  'Wight',
  'Spectre',
  'Dragon',
  'Wyvern',
  'Hyena',
  'Wolf',
  'Dagger',
  'Falchion',
  'Warhammer',
  'Conway',
  'Conqueror',
  'Hind',
];

const PIRATE_SHIP_NAMES = [
  'Revenge',
  'Blood',
  'Bloodletter',
  'Pearl',
  'Broken Soul',
  'Lost Soul',
  'Reaver',
  'Raider',
  'Corsair',
  'Vengeance',
  'Freedom',
  'Free Will',
  'Serpent',
  'Burning Rose',
  'Black Rose',
  'Black Star',
  'Crimson Star',
  'Crimson',
  'Maelstrom',
  'Runner',
  'Old James',
  'Dog of War',
  'Solar Tide',
];

const NAVAL_DESIGNATORS = ['HMS', 'USS', 'ISS'];

const POLICE_DESIGNATORS = [
  'PS',
  'SPS',
  'SP',
  'Star Police Cruiser',
  'Solar Police',
  'Star Police',
  'LES',
];

/** Fitting types a peaceful hauler can carry; the armed owners narrow or extend this. */
const CIVILIAN_FITTING_TYPES = [
  'cargo',
  'colony',
  'computer',
  'crew',
  'fuel',
  'landing',
  'medical',
  'navigation',
  'passenger',
  'science',
  'sensors',
  'shuttle',
  'support',
];

const MERCHANT_FITTING_TYPES = [
  'cargo',
  'colony',
  'computer',
  'crew',
  'factory',
  'fuel',
  'landing',
  'medical',
  'navigation',
  'passenger',
  'science',
  'sensors',
  'shuttle',
  'support',
];

const LAW_ENFORCEMENT_FITTING_TYPES = [
  'cargo',
  'computer',
  'crew',
  'fuel',
  'landing',
  'navigation',
  'science',
  'sensors',
  'shuttle',
  'support',
  'weapons',
];

const LINE_OF_BATTLE_FITTING_TYPES = [
  'cargo',
  'computer',
  'crew',
  'fuel',
  'landing',
  'medical',
  'navigation',
  'passenger',
  'psychic',
  'science',
  'sensors',
  'shuttle',
  'stealth',
  'support',
  'troops',
  'weapons',
];

const PATROLLER_FITTING_TYPES = [
  'cargo',
  'computer',
  'crew',
  'fuel',
  'landing',
  'medical',
  'navigation',
  'passenger',
  'psychic',
  'science',
  'sensors',
  'shuttle',
  'stealth',
  'support',
  'weapons',
];

const PIRATE_FITTING_TYPES = [
  'cargo',
  'computer',
  'crew',
  'fuel',
  'landing',
  'medical',
  'navigation',
  'sensors',
  'shuttle',
  'stealth',
  'support',
  'troops',
  'weapons',
];

const SMUGGLER_FITTING_TYPES = [
  'cargo',
  'computer',
  'crew',
  'fuel',
  'landing',
  'medical',
  'navigation',
  'passenger',
  'sensors',
  'shuttle',
  'smuggling',
  'stealth',
  'support',
];

/** A civilian yard stamps a model number ahead of the class name. */
function modelNumberedClassName(classNames: string[], rng: RNG.RNG): string {
  const modelNumber = MUN.getModelNumberNameGenerator(rng).generate(1)[0];

  return `${modelNumber} ${rng.item(classNames)}`;
}

/** A navy names the class after the lead ship, with no model number. */
function leadShipClassName(classNames: string[], rng: RNG.RNG): string {
  return `${rng.item(classNames)}-class`;
}

/** A naval prefix in front of the ship's own name. */
function navalShipName(shipNames: string[], rng: RNG.RNG): string {
  const designator = rng.item(NAVAL_DESIGNATORS);

  return `${designator} ${rng.item(shipNames)}`;
}

/** Police hulls carry a unit number rather than a name, in one of three formats. */
function policeShipName(rng: RNG.RNG): string {
  let shipName = rng.item(POLICE_DESIGNATORS);

  const unitNumber = rng.int(100, 500);
  const designationForm = rng.int(0, 100);

  if (designationForm < 30) {
    shipName += ` ${unitNumber}`;
  } else if (designationForm < 70) {
    shipName += ` ${rng.int(1, 9)}-${unitNumber}`;
  } else {
    shipName += ` Unit ${unitNumber}`;
  }

  return shipName;
}

export const OWNER_TYPES: OwnerType[] = [
  {
    name: 'civilian',
    isArmed: false,
    systemOnly: false,
    possibleHullTypes: ['shuttle', 'free merchant'],
    getRandomClassName: (rng: RNG.RNG) => modelNumberedClassName(CIVILIAN_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => rng.item(TRAMP_SHIP_NAMES),
    requiredFittingType: 'cargo',
    fillWithCargo: false,
    allowedFittingTypes: CIVILIAN_FITTING_TYPES,
  },
  {
    name: 'merchant',
    isArmed: false,
    systemOnly: false,
    possibleHullTypes: ['shuttle', 'free merchant', 'bulk freighter'],
    getRandomClassName: (rng: RNG.RNG) => modelNumberedClassName(CIVILIAN_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => rng.item(TRAMP_SHIP_NAMES),
    requiredFittingType: 'cargo',
    fillWithCargo: true,
    allowedFittingTypes: MERCHANT_FITTING_TYPES,
  },
  {
    name: 'mining ship',
    isArmed: false,
    systemOnly: false,
    possibleHullTypes: ['shuttle', 'free merchant', 'bulk freighter'],
    getRandomClassName: (rng: RNG.RNG) => modelNumberedClassName(MINING_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => rng.item(TRAMP_SHIP_NAMES),
    requiredFittingType: 'mining',
    fillWithCargo: true,
    allowedFittingTypes: MERCHANT_FITTING_TYPES,
  },
  {
    name: 'law enforcement',
    isArmed: true,
    systemOnly: true,
    possibleHullTypes: ['patrol boat'],
    getRandomClassName: (rng: RNG.RNG) => modelNumberedClassName(LAW_ENFORCEMENT_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => policeShipName(rng),
    requiredFittingType: 'weapons',
    fillWithCargo: false,
    allowedFittingTypes: LAW_ENFORCEMENT_FITTING_TYPES,
  },
  {
    name: 'military line of battle',
    isArmed: true,
    systemOnly: false,
    possibleHullTypes: ['fleet cruiser', 'battleship', 'carrier'],
    getRandomClassName: (rng: RNG.RNG) => leadShipClassName(LINE_OF_BATTLE_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => navalShipName(LINE_OF_BATTLE_SHIP_NAMES, rng),
    requiredFittingType: 'weapons',
    fillWithCargo: false,
    allowedFittingTypes: LINE_OF_BATTLE_FITTING_TYPES,
  },
  {
    name: 'military patroller',
    isArmed: true,
    systemOnly: false,
    possibleHullTypes: ['patrol boat', 'corvette', 'heavy frigate'],
    getRandomClassName: (rng: RNG.RNG) => leadShipClassName(PATROLLER_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => navalShipName(PATROLLER_SHIP_NAMES, rng),
    requiredFittingType: 'weapons',
    fillWithCargo: false,
    allowedFittingTypes: PATROLLER_FITTING_TYPES,
  },
  {
    name: 'pirate',
    isArmed: true,
    systemOnly: false,
    possibleHullTypes: ['strike fighter', 'patrol boat', 'corvette', 'heavy frigate'],
    getRandomClassName: (rng: RNG.RNG) => modelNumberedClassName(CIVILIAN_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => rng.item(PIRATE_SHIP_NAMES),
    requiredFittingType: 'weapons',
    fillWithCargo: false,
    allowedFittingTypes: PIRATE_FITTING_TYPES,
  },
  {
    name: 'smuggler',
    isArmed: true,
    systemOnly: false,
    possibleHullTypes: ['free merchant', 'patrol boat'],
    getRandomClassName: (rng: RNG.RNG) => modelNumberedClassName(CIVILIAN_CLASS_NAMES, rng),
    getRandomShipName: (rng: RNG.RNG) => rng.item(TRAMP_SHIP_NAMES),
    requiredFittingType: 'smuggling',
    fillWithCargo: true,
    allowedFittingTypes: SMUGGLER_FITTING_TYPES,
  },
];
