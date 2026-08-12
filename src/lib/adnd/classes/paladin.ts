import * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from '../adnd_class_apply_options.js';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDClass from '../adndclass.js';

const paladin: ADNDClass = {
  name: 'paladin',
  group: 'warrior',
  hitDice: '1d10',
  minStrength: 12,
  minDexterity: -1,
  minConstitution: 9,
  minIntelligence: -1,
  minWisdom: 13,
  minCharisma: 17,
  primeRequisites: ['strength', 'charisma'],
  abilities: [
    "Detect the presence of evil intent within 60'",
    '+2 bonus to all saving throws',
    'Immune to all diseases',
    'Heal by laying on hands (2 HP), once per day',
    'Cure all dieases, once per week',
    "10' aura of protection: all summoned and specifically evil creatures within the radius suffer -1 to their attack rolls",
    "If wielding an unsheathed holy sword, project a 10' circle of power that dispels hostile magic up to the paladin's experience level",
    'May not possess more than 10 magical items',
    'Never retains wealth; all excess must be donated to the church or a worthy cause',
    "Must tithe 10% of all income to the paladin's institution",
    'May only employ lawful good henchmen',
  ],
  allowedAlignments: ['lawful good'],
  hasSpells: false,
  allowedSpellTypes: [],
  spellList: [],
  allowedWeapons: ['any'],
  allowedArmor: ['any'],
  initialWP: 4,
  initialNWP: 3,
  wpPenalty: -2,
  apply: function (
    this: ADNDClass,
    character: ADNDCharacter,
    _rng: RNG.RNG,
    _options?: AdndClassApplyOptions,
  ): ADNDCharacter {
    return character;
  },
};

export default paladin;
