import * as TavernName from "./names/taverns.js";
import * as TavernMap from "./maps/tavern.js";
import * as Food from "./cuisine/food.js";
import * as Drink from "./cuisine/drink.js";
import * as iarnd from "./random.js";
import * as Dice from "./dice.js";
import * as Currency from "./currency.js";

const random = require("random");

export function generate() {
  let tavern = {
    description: "",
    name: "",
    map: {},
    food: [],
    drinks: [],
  };

  tavern.name = TavernName.generate();
  tavern.map = TavernMap.generate();
  tavern.food = randomFood();
  tavern.drinks = randomDrinks();
  tavern.description = randomDescription(tavern);

  return tavern;
}

function randomDescription(tavern) {
  let description = iarnd.item([
    tavern.name,
    "This tavern",
    "This establishment",
  ]);

  let quality = iarnd.item([
    "has seen better days",
    "looks newly painted",
    "is well kept",
    "has an air of wealth about it",
  ]);

  description += " " + quality + ". ";

  let patrons = iarnd.item([
    "It caters to a diverse crowd.",
    "Some of its patrons are less savory types.",
    "It has a welcoming atmosphere.",
    "The crowd is friendly and boisterous.",
    "The patrons all keep to themselves and talk quietly.",
    "There's a rough crowd here.",
  ]);

  description += patrons;

  return description;
}

function randomDrinks() {
  let drinks = [];

  let numberOfItems = random.int(2, 4);

  for (let i = 0; i < numberOfItems; i++) {
    let drink = Drink.generateDrink();

    let cost = Currency.convertCopper(drink.cost);

    let drinkDescription = drink.description + " (cost: " + cost + ")";

    drinks.push(drinkDescription);
  }

  return drinks;
}

function randomFood() {
  let food = [];

  let numberOfItems = random.int(2, 4);

  for (let i = 0; i < numberOfItems; i++) {
    let quality = Dice.roll("2d6");

    let dish = Food.generateDish();
    let cost = Currency.convertCopper(quality);

    let foodDescription = dish + " (cost: " + cost + ")";

    food.push(foodDescription);
  }

  return food;
}
