"use strict";

import Character from "./characters/character";
import * as FantasyCharacter from "./characters/fantasy";
import { Item } from "./equipment/item";
import * as StockList from "./equipment/stocklist";
import random from "random";
import * as Words from "./words";
import * as RND from "./random";

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
  let character = FantasyCharacter.generateByAgeGroup("adult");
  let description = RND.item([
    `${character.firstName} ${character.lastName} is ${Words.article(itemCategory)} ${itemCategory} merchant.`,
    `${character.firstName} ${character.lastName}, ${Words.article(character.species.name)} ${character.species.name} ${Words.genderNoun(character.gender, character.ageGroupName)}, is ${Words.article(itemCategory)} ${itemCategory} merchant.`,
  ]);
  let wares = StockList.getList(itemCategory, 10, valueThreshold);
  let priceVariance = random.float(0.8, 1.2);
  if (priceVariance > 1.0) {
    description += ' ' + Words.capitalize(Words.pronoun(character.gender, 'subjective')) + ' charges more than others.';
  } else if (priceVariance < 1.0) {
    description += ' ' + Words.capitalize(Words.pronoun(character.gender, 'subjective')) + ' charges less than others.';
  }

  return new Merchant(character, description, wares, priceVariance);
}
