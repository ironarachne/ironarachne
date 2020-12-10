import * as iarnd from "../random.js";
const random = require("random");

export function generateDrink() {
  let drink = randomType();

  let adjectiveChance = random.int(1, 100);
  if (adjectiveChance > 30) {
    drink = randomAdjective() + " " + drink;
  }

  let strengthChance = random.int(1, 100);
  if (strengthChance > 70) {
    drink = randomStrength() + " " + drink;
  }

  return drink;
}

function randomAdjective() {
  return iarnd.item([
    "cloudy",
    "yellow",
    "brown",
    "caramel-colored",
    "sour",
    "bitter",
    "sweet",
    "rich",
    "tangy",
    "spiced",
    "spicy",
    "cheap",
    "nasty",
  ]);
}

function randomType() {
  return iarnd.item([
    "ale",
    "beer",
    "lager",
    "cider",
    "wine",
    "whiskey",
    "brandy",
    "bourbon",
    "gin",
  ]);
}

function randomStrength() {
  return iarnd.item([
    "weak",
    "very weak",
    "strong",
    "curiously strong",
    "incredibly strong",
  ]);
}
