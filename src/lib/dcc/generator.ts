import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import * as Dice from "../dice.js";
import DCCAttribute from "./attribute.js";
import DCCCharacter from "./character.js";
import DCCGear from "./equipment/gear.js";
import type DCCCharacterGeneratorConfig from "./generatorconfig.js";
import DCCLanguage from "./languages/language.js";
import * as Languages from "./languages/languages.js";
import type DCCLuckyRoll from "./luckyroll.js";
import * as LuckyRolls from "./luckyrolls.js";
import type DCCOccupation from "./occupation.js";
import * as Occupations from "./occupations.js";

export default class DCCCharacterGenerator {
  config: DCCCharacterGeneratorConfig;

  constructor(config: DCCCharacterGeneratorConfig) {
    this.config = config;
  }

  generate(): DCCCharacter {
    let character = new DCCCharacter();

    character.strength = new DCCAttribute(Dice.roll("3d6"));
    character.agility = new DCCAttribute(Dice.roll("3d6"));
    character.stamina = new DCCAttribute(Dice.roll("3d6"));
    character.personality = new DCCAttribute(Dice.roll("3d6"));
    character.intelligence = new DCCAttribute(Dice.roll("3d6"));
    character.luck = new DCCAttribute(Dice.roll("3d6"));

    character.numberOfLanguages = character.intelligence.modifier > 0 ? character.intelligence.modifier : 0;

    character.luckyRoll = randomLuckyRoll(character.luck.modifier);

    character.hp = Dice.roll("1d4") + character.stamina.modifier;

    character.spellsKnown = getSpellsKnown(character.intelligence.value);
    character.wizardMaxSpellLevel = getMaxSpellLevel(character.intelligence.value);
    character.clericMaxSpellLevel = getMaxSpellLevel(character.personality.value);

    character.baseSave = 0;
    character.fortitudeSave = character.baseSave + character.stamina.modifier;
    character.willpowerSave = character.baseSave + character.personality.modifier;
    character.reflexSave = character.baseSave + character.agility.modifier;

    character.gender = RND.item(["male", "female"]);
    character.lastName = this.config.nameGeneratorFamily.generate(1)[0];
    character.firstName = this.config.nameGeneratorFemale.generate(1)[0];
    if (character.gender == "male") {
      character.firstName = this.config.nameGeneratorMale.generate(1)[0];
    }
    character.age = random.int(16, 22);
    character.xp = 0;
    character.level = 0;
    character.alignment = RND.item(["Law", "Chaos", "Neutrality"]);
    character.occupation = randomOccupation(this.config.allowedOccupations);
    character.equipment.push(character.occupation.trainedWeapon);
    character.equipment.push(character.occupation.tradeGoods);
    character.weapons.push(character.occupation.trainedWeapon);
    character.equipment.push(randomEquipment());
    character.currency.cp = Dice.roll("5d12");

    character.languages.push("Common");

    character = character.occupation.apply(character);
    character = character.luckyRoll.apply(character);

    if (character.occupation.name.includes("elven")) {
      let genSet = MUN.getSetByName("elf", MUN.allSets());
      character.lastName = genSet.family.generate(1)[0];
      if (character.gender == "male") {
        character.firstName = genSet.male.generate(1)[0];
      } else {
        character.firstName = genSet.female.generate(1)[0];
      }
    } else if (character.occupation.name.includes("dwarven")) {
      let genSet = MUN.getSetByName("dwarf", MUN.allSets());
      if (character.gender == "male") {
        character.firstName = genSet.male.generate(1)[0];
      } else {
        character.firstName = genSet.female.generate(1)[0];
      }
    } else if (character.occupation.name.includes("halfling")) {
      let genSet = MUN.getSetByName("halfling", MUN.allSets());
      if (genSet.family === null) {
        throw new Error("No family name generator found for halflings.");
      }
      character.lastName = genSet.family.generate(1)[0];
      if (genSet.female === null) {
        throw new Error("No female name generator found for halflings.");
      }
      if (genSet.male === null) {
        throw new Error("No male name generator found for halflings.");
      }
      if (character.gender == "male") {
        character.firstName = genSet.male.generate(1)[0];
      } else {
        character.firstName = genSet.female.generate(1)[0];
      }
    }

    if (character.hp < 1) {
      character.hp = 1;
    }

    character.languages = getLanguages(character);

    return character;
  }
}

function getLanguages(character: DCCCharacter): string[] {
  let languages = character.languages;
  let possibleLanguages = Languages.getHuman();

  if (character.occupation.name.includes("dwarven")) {
    possibleLanguages = Languages.getDwarf();
    possibleLanguages.push(new DCCLanguage(character.alignment, 20));
  } else if (character.occupation.name.includes("elven")) {
    possibleLanguages = Languages.getElf();
    possibleLanguages.push(new DCCLanguage(character.alignment, 20));
  } else if (character.occupation.name.includes("halfling")) {
    possibleLanguages = Languages.getHalfling();
    possibleLanguages.push(new DCCLanguage(character.alignment, 25));
  } else {
    possibleLanguages.push(new DCCLanguage(character.alignment, 20));
  }

  for (let i = 0; i < character.numberOfLanguages; i++) {
    let language = RND.weighted(possibleLanguages);

    if (!languages.includes(language.name)) {
      languages.push(language.name);
    } else {
      i++;
    }
  }

  return languages;
}

function getMaxSpellLevel(score: number): number {
  const values = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5];

  return values[score];
}

function getSpellsKnown(intScore: number): number {
  const known = [-9, -9, -9, -9, -2, -2 - 1, -1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2];

  return known[intScore];
}

function randomEquipment(): DCCGear {
  return RND.item([
    new DCCGear("backpack", 1),
    new DCCGear("candle", 1),
    new DCCGear("chain, 10'", 1),
    new DCCGear("chalk, 1 piece", 1),
    new DCCGear("chest, empty", 1),
    new DCCGear("crowbar", 1),
    new DCCGear("flask, empty", 1),
    new DCCGear("flint and steel", 1),
    new DCCGear("grappling hook", 1),
    new DCCGear("hammer, small", 1),
    new DCCGear("holy symbol", 1),
    new DCCGear("holy water, 1 vial", 1),
    new DCCGear("iron spike", 1),
    new DCCGear("lantern", 1),
    new DCCGear("mirror, hand-sized", 1),
    new DCCGear("oil, 1 flask", 1),
    new DCCGear("pole, 10-foot", 1),
    new DCCGear("rations, 1 day", 1),
    new DCCGear("rope, 50'", 1),
    new DCCGear("sack, large", 1),
    new DCCGear("sack, small", 1),
    new DCCGear("thieves' tools", 1),
    new DCCGear("torch", 1),
    new DCCGear("waterskin", 1),
  ]);
}

function randomLuckyRoll(modifier: number): DCCLuckyRoll {
  const rolls = LuckyRolls.all();

  let roll = rolls[Dice.roll("1d30")];
  roll.modifier = modifier;

  return roll;
}

function randomOccupation(allowedOccupations: string[]): DCCOccupation {
  const occupations = Occupations.get(allowedOccupations);

  let occupation = RND.weighted(occupations);

  return occupation;
}
