import type { DCCCharacter, DCCLuckyRoll } from './dcc_types';

/**
 * The DCC "lucky sign" table, indexed by a 1d30 roll. Entry 0 is an empty placeholder so the roll
 * can be used as the index directly.
 *
 * Shared and read-only. Each row carries a `modifier` that the caller fills in from the
 * character's Luck score, so `randomLuckyRoll` in `dcc_characters.ts` copies the row it draws
 * rather than writing into the table.
 */
export const LUCKY_ROLLS: DCCLuckyRoll[] = [
  {
    name: '',
    description: '',
    modifier: 0,
    apply: (character: DCCCharacter): DCCCharacter => character,
  },
  {
    name: 'Harsh winter',
    description: 'All attack rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      character.attackModifier += this.modifier;
      return character;
    },
  },
  {
    name: 'The bull',
    description: 'Melee attack rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Fortunate date',
    description: 'Missile fire attack rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Raised by wolves',
    description: 'Unarmed attack rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Conceived on horseback',
    description: 'Mounted attack rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Born on the battlefield',
    description: 'Damage rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Path of the bear',
    description: 'Melee damage rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Hawkeye',
    description: 'Missile fire damage rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Pack hunter',
    description: 'Attack and damage rolls for 0-level starting weapons',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Born under the loom',
    description: 'Skill checks (including thief skills)',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: "Fox's cunning",
    description: 'Find/disable traps',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Four-leafed clover',
    description: 'Find secret doors',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Seventh son',
    description: 'Spell checks',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'The raging storm',
    description: 'Spell damage',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Righteous heart',
    description: 'Turn unholy checks',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Survived the plague',
    description: 'Magical healing',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Lucky sign',
    description: 'Saving throws',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.baseSave += this.modifier;
      character.fortitudeSave += this.modifier;
      character.reflexSave += this.modifier;
      character.willpowerSave += this.modifier;
      return character;
    },
  },
  {
    name: 'Guardian angel',
    description: 'Saving throws to escape traps',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Survived a spider bite',
    description: 'Saving throws against poison',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Struck by lightning',
    description: 'Reflex saving throws',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.reflexSave += this.modifier;
      return character;
    },
  },
  {
    name: 'Lived through famine',
    description: 'Fortitude saving throws',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.fortitudeSave += this.modifier;
      return character;
    },
  },
  {
    name: 'Resisted temptation',
    description: 'Willpower saving throws',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.willpowerSave += this.modifier;
      return character;
    },
  },
  {
    name: 'Charmed house',
    description: 'Armor Class',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.armorClass += this.modifier;
      return character;
    },
  },
  {
    name: 'Speed of the cobra',
    description: 'Initiative',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Bountiful harvest',
    description: 'Hit points (applies at each level)',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.hp += this.modifier;
      return character;
    },
  },
  {
    name: "Warrior's arm",
    description: 'Critical hit tables',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Unholy house',
    description: 'Corruption rolls',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'The Broken Star',
    description: 'Fumbles',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    },
  },
  {
    name: 'Birdsong',
    description: 'Number of languages',
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.numberOfLanguages += this.modifier;
      if (character.numberOfLanguages < 0) {
        character.numberOfLanguages = 0;
      }
      return character;
    },
  },
  {
    name: 'Wild child',
    description: "Speed (each +1/-1 = +5'/-5' speed)",
    modifier: 0,
    apply: function (this: DCCLuckyRoll, character: DCCCharacter): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += '+';
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.speed += this.modifier * 5;
      return character;
    },
  },
];
