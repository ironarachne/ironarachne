import DCCCharacter from "./character.js";
import DCCLuckyRoll from "./luckyroll.js";

export function all(): DCCLuckyRoll[] {
  return [
    new DCCLuckyRoll("", "", function() {}), // we're using index for rolls, so this makes the list start at 1
    new DCCLuckyRoll("Harsh winter", "All attack rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      character.attackModifier += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("The bull", "Melee attack rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Fortunate date", "Missile fire attack rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Raised by wolves", "Unarmed attack rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Conceived on horseback", "Mounted attack rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Born on the battlefield", "Damage rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Path of the bear", "Melee damage rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Hawkeye", "Missile fire damage rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll(
      "Pack hunter",
      "Attack and damage rolls for 0-level starting weapons",
      function(character: DCCCharacter): DCCCharacter {
        let rule = `${this.description}: `;
        if (this.modifier > -1) {
          rule += "+";
        }
        rule += `${this.modifier}`;
        character.specialRules.push(rule);
        return character;
      },
    ),
    new DCCLuckyRoll("Born under the loom", "Skill checks (including thief skills)", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Fox's cunning", "Find/disable traps", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Four-leafed clover", "Find secret doors", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Seventh son", "Spell checks", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("The raging storm", "Spell damage", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Righteous heart", "Turn unholy checks", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Survived the plague", "Magical healing", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Lucky sign", "Saving throws", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.baseSave += this.modifier;
      character.fortitudeSave += this.modifier;
      character.reflexSave += this.modifier;
      character.willpowerSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Guardian angel", "Saving throws to escape traps", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Survived a spider bite", "Saving throws against poison", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Struck by lightning", "Reflex saving throws", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.reflexSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Lived through famine", "Fortitude saving throws", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.fortitudeSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Resisted temptation", "Willpower saving throws", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.willpowerSave += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Charmed house", "Armor Class", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.armorClass += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Speed of the cobra", "Initiative", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Bountiful harvest", "Hit points (applies at each level)", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.hp += this.modifier;
      return character;
    }),
    new DCCLuckyRoll("Warrior's arm", "Critical hit tables", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Unholy house", "Corruption rolls", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("The Broken Star", "Fumbles", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier}`;
      character.specialRules.push(rule);
      return character;
    }),
    new DCCLuckyRoll("Birdsong", "Number of languages", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.numberOfLanguages += this.modifier;
      if (character.numberOfLanguages < 0) {
        character.numberOfLanguages = 0;
      }
      return character;
    }),
    new DCCLuckyRoll("Wild child", "Speed (each +1/-1 = +5'/-5' speed)", function(
      character: DCCCharacter,
    ): DCCCharacter {
      let rule = `${this.description}: `;
      if (this.modifier > -1) {
        rule += "+";
      }
      rule += `${this.modifier} (taken into account)`;
      character.specialRules.push(rule);
      character.speed += this.modifier * 5;
      return character;
    }),
  ];
}
