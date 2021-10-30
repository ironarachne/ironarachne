"use strict";

import * as RND from "../random";
import * as words from "../words";

import random from "random";

export function generateDish() {
  let dish = randomCookingMethod() + " ";

  dish += randomMainComponent();

  const vegetableChance = random.int(1, 100);

  if (vegetableChance > 50) {
    const combiningWord = RND.item(["and", "on", "with"]);
    dish += " " + combiningWord + " " + randomVegetable();
  }

  const seasoning = randomSeasoning();

  const seasoningPhrase = RND.item([
    "seasoned with",
    "flavored with",
    "spiced with",
  ]);

  dish += ", " + seasoningPhrase + " " + seasoning;

  return dish;
}

function randomCookingMethod() {
  const items = ["roasted", "fried", "baked", "broiled", "seared", "charbroiled"];

  return RND.item(items);
}

function randomFocus() {
  const items = [
    {
      name: "vegetable",
      options: [
        "summer squash",
        "butternut squash",
        "eggplant",
        "pumpkin",
        "potatoes",
        "sweet potato",
        "turnips",
        "beets",
        "fennel",
        "carrots",
        "celeriac",
      ],
    },
    {
      name: "fish",
      options: [
        "trout",
        "bass",
        "salmon",
        "tuna",
        "rainbow trout",
        "cod",
        "red snapper",
        "halibut",
        "catfish",
        "tilapia",
      ],
    },
    {
      name: "poultry",
      options: [
        "chicken",
        "quail",
        "turkey",
        "duck",
        "pheasant",
        "goose",
        "squab",
        "guineafowl",
      ],
    },
    {
      name: "livestock",
      options: [
        "beef",
        "pork",
        "lamb",
        "goat",
      ],
    },
    {
      name: "game",
      options: [
        "bison",
        "caribou",
        "elk",
        "pronghorn",
        "rabbit",
        "squirrel",
        "venison",
        "wild boar",
      ],
    },
  ];

  const focus = RND.item(items);

  return RND.item(focus.options);
}

function randomMainComponent() {
  let mainComponent = randomFocus();

  const modifierChance = random.int(1, 100);
  if (modifierChance > 80) {
    mainComponent += " " + RND.item(["sausage", "stew"]);
  }

  return mainComponent;
}

function randomSeasoning() {
  const seasoningCount = randomSeasoningCount();
  const components: string[] = [];

  let options = spices();
  options = options.concat(herbs());

  for (let i = 0; i < seasoningCount; i++) {
    const component = RND.item(options);
    if (!components.includes(component)) {
      components.push(component);
    } else {
      i--;
    }
  }

  return words.arrayToPhrase(components);
}

function randomSeasoningCount() {
  const weights = [
    {
      item: 1,
      commonality: 50,
    },
    {
      item: 2,
      commonality: 20,
    },
    {
      item: 3,
      commonality: 5,
    },
  ];

  const result = RND.weighted(weights);

  return result.item;
}

function randomVegetable() {
  const items = [
    "broccoli",
    "spinach",
    "lettuce",
    "cabbage",
    "carrots",
    "black beans",
    "green beans",
    "peas",
    "celery",
    "white onions",
    "yellow onions",
    "kidney beans",
    "kale",
    "mushrooms",
  ];

  return RND.item(items);
}

function spices() {
  return [
    "ginger",
    "saffron",
    "salt",
    "pepper",
    "cinnamon",
    "cumin",
    "cardamom",
    "anise",
    "ground mustard",
    "cayenne",
    "chili powder",
    "fenugreek",
    "fennel",
    "lemongrass",
    "turmeric",
    "allspice",
  ];
}

function herbs() {
  return [
    "basil",
    "parsley",
    "cilantro",
    "chives",
    "dill",
    "oregano",
    "rosemary",
    "sage",
    "thyme",
    "tarragon",
  ];
}
