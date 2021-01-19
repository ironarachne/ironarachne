import * as iarnd from "../random.js";
import * as words from "../words.js";
const random = require("random");

export function generateDish() {
  let dish = randomCookingMethod() + " ";

  dish += randomMainComponent();

  let vegetableChance = random.int(1, 100);

  if (vegetableChance > 50) {
    let combiningWord = iarnd.item(["and", "on", "with"]);
    dish += " " + combiningWord + " " + randomVegetable();
  }

  let seasoning = randomSeasoning();

  let seasoningPhrase = iarnd.item([
    "seasoned with",
    "flavored with",
    "spiced with",
  ]);

  dish += ", " + seasoningPhrase + " " + seasoning;

  return dish;
}

function randomCookingMethod() {
  let items = ["roasted", "fried", "baked", "broiled", "seared", "charbroiled"];

  return iarnd.item(items);
}

function randomFocus() {
  let items = [
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

  let focus = iarnd.item(items);

  return iarnd.item(focus.options);
}

function randomMainComponent() {
  let mainComponent = randomFocus();

  let modifierChance = random.int(1, 100);
  if (modifierChance > 80) {
    mainComponent += " " + iarnd.item(["sausage", "stew"]);
  }

  return mainComponent;
}

function randomSeasoning() {
  let seasoningCount = randomSeasoningCount();
  let components = [];

  let options = spices();
  options = options.concat(herbs());

  for (let i = 0; i < seasoningCount; i++) {
    let component = iarnd.item(options);
    if (!components.includes(component)) {
      components.push(component);
    } else {
      i--;
    }
  }

  let seasoning = words.arrayToPhrase(components);

  return seasoning;
}

function randomSeasoningCount() {
  let weights = [
    {
      item: 1,
      weight: 50,
    },
    {
      item: 2,
      weight: 20,
    },
    {
      item: 3,
      weight: 5,
    },
  ];

  let result = iarnd.weighted(weights);

  return result.item;
}

function randomVegetable() {
  let items = [
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

  return iarnd.item(items);
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
