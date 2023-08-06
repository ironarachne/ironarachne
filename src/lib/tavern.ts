"use strict";

import * as RND from "@ironarachne/rng";
import * as Drink from "./cuisine/drink.js";
import * as Food from "./cuisine/food.js";
import * as Currency from "./currency.js";
import * as Dice from "./dice.js";
import * as TavernName from "./names/taverns.js";

import random from "random";

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
  const tavern = new Tavern(TavernName.generate(), randomFood(), randomDrinks());

  tavern.description = randomDescription(tavern);

  return tavern;
}

function randomDescription(tavern: Tavern) {
  let description = RND.item([tavern.name, "This tavern", "This establishment"]);

  const quality = RND.item([
    "has seen better days",
    "looks newly painted",
    "is well kept",
    "has an air of wealth about it",
  ]);

  description += " " + quality + ". ";

  const patrons = RND.item([
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
  const drinks = [];

  const numberOfItems = random.int(2, 4);

  for (let i = 0; i < numberOfItems; i++) {
    const drink = Drink.generateDrink();

    const cost = Currency.convertCopper(drink.cost, false, false);

    const drinkDescription = drink.description + " (cost: " + cost + ")";

    drinks.push(drinkDescription);
  }

  return drinks;
}

function randomFood() {
  const food = [];

  const numberOfItems = random.int(2, 4);

  for (let i = 0; i < numberOfItems; i++) {
    const quality = Dice.roll("2d6");

    const dish = Food.generateDish();
    const cost = Currency.convertCopper(quality, false, false);

    const foodDescription = dish + " (cost: " + cost + ")";

    food.push(foodDescription);
  }

  return food;
}
