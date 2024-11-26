import * as RND from "@ironarachne/rng";
import * as Drink from "./cuisine/drink.js";
import * as Food from "./cuisine/food.js";
import * as Currency from "./currency.js";
import * as Dice from "./dice.js";

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
  const tavern = new Tavern(randomName(), randomFood(), randomDrinks());

  tavern.description = randomDescription(tavern);

  return tavern;
}

function randomName(): string {
  const name = RND.item([
    "The Rusty Anchor",
    "The Drunken Dragon",
    "The Laughing Fox",
    "The Golden Goose",
    "The Dancing Bear",
    "The Merry Mermaid",
    "The Lucky Leprechaun",
    "The Jolly Jester",
    "The Silly Satyr",
    "The Singing Siren",
    "The Prancing Pony",
    "The Tipsy Turtle",
    "The Weeping Willow",
    "The Wandering Wizard",
    "The Wicked Wench",
  ]);

  return name;
}

function randomDescription(tavern: Tavern) {
  let description = RND.item([
    tavern.name,
    "This tavern",
    "This establishment",
  ]);

  const quality = RND.item([
    "has seen better days",
    "looks newly painted",
    "is well kept",
    "has an air of wealth about it",
  ]);

  description += ` ${quality}. `;

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

    const drinkDescription = `${drink.description} (cost: ${cost})`;

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

    const foodDescription = `${dish} (cost: ${cost})`;

    food.push(foodDescription);
  }

  return food;
}
