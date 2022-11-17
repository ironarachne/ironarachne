'use strict';

import ADNDCharacter from '../adndcharacter';
import ADNDRace from '../adndrace';
import * as RND from '../../random';

export default new ADNDRace(
  'halfling',
  'halfling',
  function (character: ADNDCharacter): ADNDCharacter {
    character.dexterity += 1;
    character.strength -= 1;
    character.exceptionalStrength = -1;
    // TODO: address saving throws
    let halflingType = RND.item(['Hairfeet', 'Tallfellow', 'Stout']);
    character.race.name = `${halflingType} halfling`;
    if (halflingType == 'Stout') {
      if (RND.chance(100) <= 15) {
        character.abilities.push("Normal Infravision (60')");
      }
      character.abilities.push('Know if a passage has up or down grade on 1,2,3 on 1d4');
      character.abilities.push('Determine direction on 1,2,3 on 1d6');
    } else {
      if (RND.chance(100) <= 25) {
        character.abilities.push("Limited Infravision (30')");
      }
    }
    character.abilities.push('+1 to attack rolls with thrown weapons and slings');
    character.abilities.push(
      'When not wearing metal armor, and either alone or with other halflings/elves not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the halfling has to open a door or screen to attack.',
    );
    return character;
  },
  7,
  18,
  7,
  18,
  10,
  18,
  6,
  18,
  3,
  17,
  3,
  18,
  32,
  30,
  52,
  48,
  '2d8',
  '5d4',
  20,
  6,
  '3d4',
  ['common', 'halfling', 'dwarf', 'elf', 'gnome', 'goblin', 'orc'],
  ['cleric', 'fighter', 'thief'],
);
