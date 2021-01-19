import * as iarnd from "../random.js";
import * as Words from "../words.js";
const random = require("random");

export function generateDrink() {
  let drink = {
    name: "",
    description: "",
    appearance: "",
    quality: 0,
    strength: 0,
    cost: "",
    type: {},
  }

  drink.type = randomType();
  drink.appearance = iarnd.item(drink.type.appearances);
  drink.strength = random.int(drink.type.strengthMin, drink.type.strengthMax);
  drink.quality = random.int(0, 6);
  drink.cost = randomCost(drink);
  drink.name = drink.type.name;

  drink.description = describe(drink);

  return drink;
}

function describe(drink) {
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

  let description = Words.arrayToPhrase(adjectives) + " " + drink.type.name;

  return description;
}

function describeStrength(strength) {
  if (strength == 0) {
    return "very weak";
  } else if (strength == 1) {
    return "weak";
  } else if (strength == 2) {
    return "moderately strong";
  } else if (strength == 3) {
    return "potent";
  } else if (strength == 4) {
    return "very strong";
  }

  return "incredibly strong";
}

function describeQuality(quality) {
  if (quality == 0) {
    return "nasty";
  } else if (quality == 1) {
    return "awful";
  } else if (quality == 2) {
    return "acceptable";
  } else if (quality == 3) {
    return "decent";
  } else if (quality == 4) {
    return "good";
  } else if (quality == 5) {
    return "excellent";
  }

  return "wonderful";
}

function randomCost(drink) {
  let cost = random.int(drink.type.costMin, drink.type.costMax);

  cost += drink.quality;
  cost += Math.floor(drink.strength/2);

  return cost;
}

function randomType() {
  return iarnd.item([
    {
      name: "ale",
      strengthMin: 0,
      strengthMax: 3,
      costMin: 0,
      costMax: 2,
      appearances: [
        "yellow",
        "tan",
        "dark brown",
        "brown",
      ],
    },
    {
      name: "beer",
      strengthMin: 0,
      strengthMax: 3,
      costMin: 0,
      costMax: 2,
      appearances: [
        "yellow",
        "tan",
        "dark brown",
        "brown",
      ],
    },
    {
      name: "lager",
      strengthMin: 0,
      strengthMax: 3,
      costMin: 0,
      costMax: 2,
      appearances: [
        "yellow",
        "tan",
        "light brown",
        "brown",
      ],
    },
    {
      name: "cider",
      strengthMin: 0,
      strengthMax: 3,
      costMin: 0,
      costMax: 3,
      appearances: [
        "yellow",
        "tan",
        "dark brown",
        "brown",
        "red",
        "dull orange",
        "pale",
      ],
    },
    {
      name: "wine",
      strengthMin: 0,
      strengthMax: 3,
      costMin: 0,
      costMax: 10,
      appearances: [
        "red",
        "white",
        "dark red",
        "pale",
        "burgundy",
      ],
    },
    {
      name: "whiskey",
      strengthMin: 1,
      strengthMax: 5,
      costMin: 0,
      costMax: 15,
      appearances: [
        "yellow",
        "dark brown",
        "brown",
        "clear",
        "caramel-colored",
      ],
    },
    {
      name: "brandy",
      strengthMin: 1,
      strengthMax: 5,
      costMin: 0,
      costMax: 10,
      appearances: [
        "cloudy",
        "red",
        "golden",
        "caramel-colored",
      ],
    },
    {
      name: "bourbon",
      strengthMin: 1,
      strengthMax: 5,
      costMin: 0,
      costMax: 15,
      appearances: [
        "yellow",
        "dark brown",
        "brown",
        "clear",
        "caramel-colored",
      ],
    },
    {
      name: "gin",
      strengthMin: 1,
      strengthMax: 5,
      costMin: 0,
      costMax: 10,
      appearances: [
        "clear",
        "cloudy",
        "white",
      ],
    },
  ]);
}
