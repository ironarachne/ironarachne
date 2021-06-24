"use strict";

import * as RND from "../random";
import * as Words from "../words";
import {DrinkType} from "@/modules/cuisine/drinktype";
import * as DrinkTypes from "@/modules/cuisine/drinktypes";

const random = require("random");

export class Drink {
  name: string;
  description: string;
  appearance: string;
  quality: number;
  strength: number;
  cost: number;
  drinkType: DrinkType;

  constructor() {
    this.name = "";
    this.description = "";
    this.appearance = "";
    this.quality = 0;
    this.strength = 0;
    this.cost = 0;
    this.drinkType = randomType();
  }
}

export function generateDrink() {
  let drink = new Drink();
  drink.appearance = RND.item(drink.drinkType.appearances);
  drink.strength = random.int(drink.drinkType.strengthMin, drink.drinkType.strengthMax);
  drink.quality = random.int(0, 6);
  drink.cost = randomCost(drink);
  drink.name = drink.drinkType.name;

  drink.description = describe(drink);

  return drink;
}

function describe(drink: Drink) {
  let adjectives = [];

  let adjectiveChance = random.int(1, 100);
  if (adjectiveChance > 30) {
    adjectives.push(drink.appearance);
  }

  let strengthChance = random.int(1, 100);
  if (strengthChance > 70) {
    adjectives.push(describeStrength(drink.strength));
  }

  let qualityChance = random.int(1, 100);
  if (qualityChance > 70) {
    adjectives.push(describeQuality(drink.quality));
  }

  return Words.arrayToPhrase(adjectives) + " " + drink.drinkType.name;
}

function describeStrength(strength: number) {
  if (strength === 0) {
    return "very weak";
  } else if (strength === 1) {
    return "weak";
  } else if (strength === 2) {
    return "moderately strong";
  } else if (strength === 3) {
    return "potent";
  } else if (strength === 4) {
    return "very strong";
  }

  return "incredibly strong";
}

function describeQuality(quality: number) {
  if (quality === 0) {
    return "nasty";
  } else if (quality === 1) {
    return "awful";
  } else if (quality === 2) {
    return "acceptable";
  } else if (quality === 3) {
    return "decent";
  } else if (quality === 4) {
    return "good";
  } else if (quality === 5) {
    return "excellent";
  }

  return "wonderful";
}

function randomCost(drink: Drink) {
  let cost = random.int(drink.drinkType.costMin, drink.drinkType.costMax);

  cost += drink.quality;
  cost += Math.floor(drink.strength / 2);

  return cost;
}

function randomType() {
  return RND.item(DrinkTypes.all());
}
