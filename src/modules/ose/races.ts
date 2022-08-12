'use strict';

import OSEAbility from './ability';
import OSEAttributeRequirement from './attributerequirement';
import OSECharacter from './character';
import ClassRestriction from './classrestriction';
import OSERace from './race';

export function all(): OSERace[] {
  return [drow(), duergar(), human()];
}

function duergar(): OSERace {
  let race = new OSERace();
  race.name = 'Duergar';

  race.requirements = [
    new OSEAttributeRequirement('constitution', 9),
    new OSEAttributeRequirement('intelligence', 9),
  ];

  race.apply = (character: OSECharacter) => {
    character.charisma -= 1;
    character.constitution += 1;
    character.languages = [
      character.alignment,
      'Common',
      'Deepcommon',
      'Dwarvish',
      'Gnomish',
      'Goblin',
      'Kobold',
    ];
    character.abilities.push(
      new OSEAbility(
        'Detect Construction Tricks',
        'As expert miners, duergar have a 2-in-6 chance of being able to detect new construction, sliding walls, or sloping passages when searching.',
      ),
    );
    character.abilities.push(
      new OSEAbility(
        'Detect Room Traps',
        'Due to their expertise with construction, duergar have a 2-in-6 chance of detecting non-magical room traps when searching.',
      ),
    );
    character.abilities.push(new OSEAbility('Infravision', "Duergar have infravision out to 90'."));
    character.abilities.push(
      new OSEAbility(
        'Light Sensitivity',
        'When in bright light (daylight, *continual light*), duergar suffer a -2 penalty to attack rolls and a -1 penalty to Armor Class.',
      ),
    );
    character.abilities.push(
      new OSEAbility('Listening at Doors', 'Duergar have a 2-in-6 chance of hearing noises.'),
    );
    character.abilities.push(
      new OSEAbility(
        'Resilience',
        "Duergar's natural constitution and resistance to magic grants them a bonus to saving throws versus paralysis, poison, spells, and magic wands, rods, and staves. This bonus depends on a duergar's CON score, as follows:\n\n * **6 or lower:** No bonus\n * **7-10:** +2\n * **11-14:** +3\n * **15-17:** +4\n * **18:** +5",
      ),
    );
    character.abilities.push(
      new OSEAbility('Stealth', 'Underground, duergar have a 3-in-6 chance of moving silently.'),
    );
  };

  return race;
}

function drow(): OSERace {
  let race = new OSERace();
  race.name = 'Drow';

  race.requirements = [new OSEAttributeRequirement('intelligence', 9)];

  race.apply = (character: OSECharacter) => {
    character.constitution -= 1;
    character.dexterity += 1;
    character.languages = [character.alignment, 'Common', 'Deepcommon', 'Elvish', 'Gnomish'];
    character.abilities.push(
      new OSEAbility(
        'Detect Secret Doors',
        'Drow have keen eyes that allow them, when actively searching, to detect hidden or secret doors with a 2-in-6 chance.',
      ),
    );
    character.abilities.push(
      new OSEAbility(
        'Immunity to Ghoul Paralysis',
        'Drow are completely unaffected by the paralysis ghouls can inflict.',
      ),
    );
    character.abilities.push(new OSEAbility('Infravision', "Drow have infravision out to 90'."));
    character.abilities.push(
      new OSEAbility(
        'Innate Magic',
        'At 2nd level, a drow is able to cast the *darkness* spell (the reverse of *light*) oncer per day, and at 4th level, *detect magic* once per day.',
      ),
    );
    character.abilities.push(
      new OSEAbility(
        'Light Sensitivity',
        'When in bright light (daylight, *continual light*), drow suffer a -2 penalty to attack rolls and a -1 penalty to Armor Class.',
      ),
    );
    character.abilities.push(
      new OSEAbility('Listening at Doors', 'Drow have a 2-in-6 chance of hearing noises.'),
    );
  };

  race.classRestrictions = [
    new ClassRestriction('Acrobat', 10),
    new ClassRestriction('Assassin', 10),
    new ClassRestriction('Cleric', 11),
    new ClassRestriction('Fighter', 7),
    new ClassRestriction('Knight', 9),
    new ClassRestriction('Magic-user', 9),
    new ClassRestriction('Ranger', 9),
    new ClassRestriction('Thief', 11),
  ];

  return race;
}

function human(): OSERace {
  let race = new OSERace();
  race.name = 'Human';

  race.apply = (character: OSECharacter) => {
    character.languages = [character.alignment, 'Common'];
  };

  return race;
}
