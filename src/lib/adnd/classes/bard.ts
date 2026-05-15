import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import ADNDClass from '../adndclass.js';
import * as ThiefSkills from '../adndthiefskills.js';

export default new ADNDClass(
  'bard',
  'rogue',
  '1d6',
  -1,
  12,
  -1,
  13,
  -1,
  15,
  ['dexterity', 'charisma'],
  ['Climb walls', 'Detect noise', 'Pick pockets', 'Read languages', 'Influence reactions'],
  ['lawful neutral', 'neutral good', 'true neutral', 'neutral evil', 'chaotic neutral'],
  false,
  [],
  [],
  ['any'],
  ['padded', 'leather', 'studded leather', 'chain mail'],
  2,
  3,
  -3,
  (
    character: ADNDCharacter,
    rng: RNG.RNG,
    options?: AdndClassApplyOptions,
  ): ADNDCharacter => {
    let skills = [
      { name: 'Pick Pockets', value: 10, points: 0 },
      { name: 'Detect Noise', value: 20, points: 0 },
      { name: 'Climb Walls', value: 50, points: 0 },
      { name: 'Read Languages', value: 5, points: 0 },
    ];
    skills = ThiefSkills.modifyForDexterity(skills, character.dexterity);
    let raceName = character.race.name;
    if (character.race.name.includes('halfling')) {
      raceName = 'halfling';
    }

    skills = ThiefSkills.modifyForRace(skills, raceName);

    if (options?.thiefSkills === 'user') {
      return character;
    }

    skills = rng.shuffle(skills);
    skills = ThiefSkills.distributePoints(skills, 20, rng);

    for (let i = 0; i < skills.length; i++) {
      character.abilities.push(`${skills[i].name}: ${skills[i].value + skills[i].points}%`);
    }

    return character;
  },
);
