import * as RND from "../random";

import random from "random";

export class TownCategory {
  name: string;
  sizeClass: string;
  randomPopulation: Function;
  randomDescription: Function;

  constructor(name: string, sizeClass: string, randomPopulation: Function, randomDescription: Function) {
    this.name = name;
    this.sizeClass = sizeClass;
    this.randomPopulation = randomPopulation;
    this.randomDescription = randomDescription;
  }
}

export function all() {
  return [
    new TownCategory(
      "hamlet",
      "small",
      function () {
        return random.int(10, 49);
      },
      function () {
        return RND.item([
          "This sleepy community only has a few families working together to survive.",
          "Though small, the inhabitants seem full of life, ready to take on any challenge.",
          "This place has fallen on hard times.",
        ]);
      },
    ),
    new TownCategory(
      "village",
      "small",
      function () {
        return random.int(50, 499);
      },
      function () {
        return RND.item([
          "The inhabitants congregate at the lone inn in town every evening.",
          "The village head runs a tight ship here, and everyone knows their part.",
          "Sometimes villages are prosperous and lively. This one isn't.",
        ]);
      },
    ),
    new TownCategory(
      "town",
      "medium",
      function () {
        return random.int(500, 9999);
      },
      function () {
        return RND.item([
          "It's a bustling place with multiple inns and taverns.",
          "The people here are a little coarse but friendly.",
          "The people here avoid strangers, and even the merchants are tight-lipped.",
          "Prosperity comes easy to this particular community.",
          "Wealth is something that this town probably hasn't seen in some time.",
        ]);
      },
    ),
    new TownCategory(
      "borough",
      "medium",
      function () {
        return random.int(10000, 19999);
      },
      function () {
        return RND.item([
          "Multiple industries make their home here. This community is on the rise.",
          "Trade flourishes here, and the people seem safe and happy.",
          "Though it would be a stretch to call this place prosperous, the people are friendly and open.",
          "This place smells a lot worse than it looks.",
        ]);
      },
    ),
    new TownCategory(
      "city",
      "large",
      function () {
        return random.int(20000, 49999);
      },
      function () {
        return RND.item([
          "The sprawling buildings of this city resemble nothing so much as a sea of wood and stone.",
          "The walls of this city create a formidable barrier between it and the rest of the world.",
          "Though marred by soot and the signs of industry run rampant, this city has a liveliness to it that's infectious.",
          "Buildings in the wealthy districts here are beautiful and ornate. Closer to the city walls, however, are large slums filled with human detritus.",
        ]);
      },
    ),
    new TownCategory(
      "metropolis",
      "large",
      function () {
        return random.int(50000, 3000000);
      },
      function () {
        return RND.item([
          "This metropolis is vast and sprawling, with many different districts of varying prosperity and character.",
          "The outer districts of this metropolis are filled with inns and taverns of all descriptions and traders are constantly arriving.",
          "Despite the vast size of this metropolis, it's comprised of many smaller, tight-knit communities that each have their own character and customs.",
        ]);
      },
    ),
  ];
}