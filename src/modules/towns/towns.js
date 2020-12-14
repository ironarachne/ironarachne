import * as iarnd from "../random.js";
const random = require("random");

export function generate(size, possibleNames) {
  let town = {
    name: "",
    description: "",
  };

  town.name = iarnd.item(possibleNames);

  let townSize = {};

  if (size == "random") {
    townSize = randomSize();
  } else if (size == "small") {
    townSize = randomSizeSmall();
  } else if (size == "medium") {
    townSize = randomSizeMedium();
  } else if (size == "large") {
    townSize = randomSizeLarge();
  }

  let population = townSize.randomPopulation();

  let description = randomDescription();

  description = description.replace("{size}", townSize.name);
  description = description.replace("{population}", population);
  description = description.replace("{name}", town.name);
  description += " " + townSize.randomDescription();

  town.description = description;

  return town;
}

function allSizes() {
  return [
    {
      name: "hamlet",
      sizeClass: "small",
      randomPopulation: function () {
        return random.int(10, 49);
      },
      randomDescription: function () {
        return iarnd.item([
          "This sleepy community only has a few families working together to survive.",
          "Though small, the inhabitants seem full of life, ready to take on any challenge.",
          "This place has fallen on hard times.",
        ]);
      },
    },
    {
      name: "village",
      sizeClass: "small",
      randomPopulation: function () {
        return random.int(50, 499);
      },
      randomDescription: function () {
        return iarnd.item([
          "The inhabitants congregate at the lone inn in town every evening.",
          "The village head runs a tight ship here, and everyone knows their part.",
          "Sometimes villages are prosperous and lively. This one isn't.",
        ]);
      },
    },
    {
      name: "town",
      sizeClass: "medium",
      randomPopulation: function () {
        return random.int(500, 9999);
      },
      randomDescription: function () {
        return iarnd.item([
          "It's a bustling place with multiple inns and taverns.",
          "The people here are a little coarse but friendly.",
          "The people here avoid strangers, and even the merchants are tight-lipped.",
          "Prosperity comes easy to this particular community.",
          "Wealth is something that this town probably hasn't seen in some time.",
        ]);
      },
    },
    {
      name: "borough",
      sizeClass: "medium",
      randomPopulation: function () {
        return random.int(10000, 19999);
      },
      randomDescription: function () {
        return iarnd.item([
          "Multiple industries make their home here. This community is on the rise.",
          "Trade flourishes here, and the people seem safe and happy.",
          "Though it would be a stretch to call this place prosperous, the people are friendly and open.",
          "This place smells a lot worse than it looks.",
        ]);
      },
    },
    {
      name: "city",
      sizeClass: "large",
      randomPopulation: function () {
        return random.int(20000, 49999);
      },
      randomDescription: function () {
        return iarnd.item([
          "The sprawling buildings of this city resemble nothing so much as a sea of wood and stone.",
          "The walls of this city create a formidable barrier between it and the rest of the world.",
          "Though marred by soot and the signs of industry run rampant, this city has a liveliness to it that's infectious.",
          "Buildings in the wealth districts here are beautiful and ornate. Closer to the city walls, however, are large slums filled with human detritus.",
        ]);
      },
    },
    {
      name: "metropolis",
      sizeClass: "large",
      randomPopulation: function () {
        return random.int(50000, 3000000);
      },
      randomDescription: function () {
        return iarnd.item([
          "This metropolis is vast and sprawling, with many different districts of varying prosperity and character.",
          "The outer districts of this metropolis are filled with inns and taverns of all descriptions and traders are constantly arriving.",
          "Despite the vast size of this metropolis, it's comprised of many smaller, tight-knit communities that each have their own character and customs.",
        ]);
      },
    },
  ];
}

function randomDescription() {
  return iarnd.item(["{name} is a {size} of {population} people."]);
}

function randomSize() {
  return iarnd.item(allSizes());
}

function randomSizeLarge() {
  let sizes = sizesByClass("large");

  return iarnd.item(sizes);
}

function randomSizeMedium() {
  let sizes = sizesByClass("medium");

  return iarnd.item(sizes);
}

function randomSizeSmall() {
  let sizes = sizesByClass("small");

  return iarnd.item(sizes);
}

function sizesByClass(sizeClass) {
  let all = allSizes();

  let sizes = [];

  all.forEach(function (element) {
    if (element.sizeClass == sizeClass) {
      sizes.push(element);
    }
  });

  return sizes;
}
