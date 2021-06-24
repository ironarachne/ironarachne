"use strict";

import * as TavernName from "./names/taverns";
import * as Food from "./cuisine/food";
import * as Drink from "./cuisine/drink";
import * as RND from "./random";
import * as Dice from "./dice";
import * as Currency from "./currency";

const random = require("random");

export class Tavern {
  name: string;
  description: string;
  food: string[];
  drinks: string[];

  constructor(name: string, food: string[], drinks: string[]) {
    this.name = name;
    this.food = food;
    this.drinks = drinks;
    this.description = "";
  }
}

export function generate() {
  let tavern = new Tavern(TavernName.generate(), randomFood(), randomDrinks());

  tavern.description = randomDescription(tavern);

  return tavern;
}

function randomDescription(tavern: Tavern) {
  let description = RND.item([
    tavern.name,
    "This tavern",
    "This establishment",
  ]);

  let quality = RND.item([
    "has seen better days",
    "looks newly painted",
    "is well kept",
    "has an air of wealth about it",
  ]);

  description += " " + quality + ". ";

  let patrons = RND.item([
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
