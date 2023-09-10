import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import type Character from "./characters/character.js";
import * as Characters from "./characters/characters.js";
import type Item from "./equipment/item.js";
import * as StockList from "./equipment/stocklist.js";

export class Merchant {
  character: Character;
  description: string;
  wares: Item[];
  priceVariance: number;

  constructor(character: Character, description: string, wares: Item[], priceVariance: number) {
    this.character = character;
    this.description = description;
    this.wares = wares;
    this.priceVariance = priceVariance;
  }
}

export function generate(itemCategory: string, valueThreshold: number): Merchant {
  let charGenConfig = Characters.getDefaultCharacterGeneratorConfig();
  charGenConfig.ageCategoryNames = ["adult"];

  let character = Characters.generate(charGenConfig);
  let description = RND.item([
    `${character.firstName} ${character.lastName} is ${
      Words.article(
        itemCategory,
      )
    } ${itemCategory} merchant.`,
    `${character.firstName} ${character.lastName}, ${
      Words.article(character.species.name)
    } ${character.species.name} ${character.ageCategory.noun}, is ${
      Words.article(itemCategory)
    } ${itemCategory} merchant.`,
  ]);
  let wares = StockList.getList(itemCategory, 10, valueThreshold);
  let priceVariance = random.float(0.8, 1.2);
  if (priceVariance > 1.0) {
    description += " " + Words.capitalize(character.gender.pronouns.subjective) + " charges more than others.";
  } else if (priceVariance < 1.0) {
    description += " " + Words.capitalize(character.gender.pronouns.subjective) + " charges less than others.";
  }

  return new Merchant(character, description, wares, priceVariance);
}
