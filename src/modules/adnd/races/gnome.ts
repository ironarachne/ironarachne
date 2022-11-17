'use strict';

import ADNDCharacter from '../adndcharacter';
import ADNDRace from '../adndrace';

export default new ADNDRace(
  'gnome',
  'gnomish',
  function (character: ADNDCharacter): ADNDCharacter {
    character.intelligence += 1;
    character.wisdom -= 1;
    // TODO: address saving throws
    character.abilities.push(
      '20% chance of magical item malfunction, except weapons, armor, shields, and illusionist items (and, if the gnome is a thief, items that duplicate thieving abilities)',
    );
    character.abilities.push('+1 to hit kobolds or goblins');
    character.abilities.push(
      'When gnolls, bugbears, ogres, trolls, ogre magi, giants, or titans attack gnomes, subtract -4 from their attack rolls',
    );
    character.abilities.push("Infravision (60')");
    character.abilities.push("Within 10', detect grade or slope in passages with 1-5 on 1d6");
    character.abilities.push(
      "Within 10', detect unsafe walls, ceiling, and floors with 1-7 on 1d10",
    );
    character.abilities.push('Determine approximate depth underground with 1-4 on 1d6');
    character.abilities.push(
      "Within 10', determine approximate direction underground with 1-3 on 1d6",
    );
    return character;
  },
  6,
  18,
  3,
  18,
  8,
  18,
  6,
  18,
  3,
  18,
  3,
  18,
  38,
  36,
  72,
  68,
  '1d6',
  '5d4',
  60,
  6,
  '3d12',
  ['common', 'gnome', 'dwarf', 'halfling', 'goblin', 'kobold', 'burrowing mammal'],
  ['cleric', 'fighter', 'illusionist', 'thief'],
);
