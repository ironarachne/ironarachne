'use strict';

import DCCCharacter from '../character';
import DCCGear from '../equipment/gear';
import DCCWeapon from '../equipment/weapon';
import DCCOccupation from '../occupation';

export function all(): DCCOccupation[] {
  return [
    new DCCOccupation(
      'halfling chicken butcher',
      new DCCWeapon('handaxe', 'handaxe', '10/20/30', '1d6', 50),
      new DCCGear('chicken meat, 5 lbs.', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
    new DCCOccupation(
      'halfling dyer',
      new DCCWeapon('staff', 'staff', 'melee', '1d4', 50),
      new DCCGear('fabric, 3 yds.', 1),
      2,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
    new DCCOccupation(
      'halfling glovemaker',
      new DCCWeapon('awl', 'dagger', '10/20/30', '1d4/1d10', 50),
      new DCCGear('gloves, 4 pairs', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
    new DCCOccupation(
      'halfling witch doctor',
      new DCCWeapon('sling', 'sling', '40/80/160', '1d4', 50),
      new DCCGear('hex doll', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
    new DCCOccupation(
      'halfling haberdasher',
      new DCCWeapon('scissors', 'dagger', '10/20/30', '1d4/1d10', 50),
      new DCCGear('fine suits, 3 sets', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
    new DCCOccupation(
      'halfling mariner',
      new DCCWeapon('knife', 'dagger', '10/20/30', '1d4/1d10', 50),
      new DCCGear('sailcloth, 2 yds.', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
    new DCCOccupation(
      'halfling moneylender',
      new DCCWeapon('short sword', 'short sword', 'melee', '1d6', 50),
      new DCCGear('loan chest', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        character.currency.cp += 200;
        character.currency.sp += 10;
        character.currency.gp += 5;
        return character;
      },
    ),
    new DCCOccupation(
      'halfling trader',
      new DCCWeapon('short sword', 'short sword', 'melee', '1d6', 50),
      new DCCGear('coin purse', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        character.currency.sp += 20;
        return character;
      },
    ),
    new DCCOccupation(
      'halfling vagrant',
      new DCCWeapon('club', 'club', 'melee', '1d4', 50),
      new DCCGear('begging bowl', 1),
      1,
      function (character: DCCCharacter): DCCCharacter {
        character.specialRules.push('Infravision');
        character.speed = 20;
        character.languages.push('Halfling');
        return character;
      },
    ),
  ];
}
