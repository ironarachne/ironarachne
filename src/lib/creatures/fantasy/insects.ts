"use strict";

import Creature from "../creature.js";

export function all(): Creature[] {
  let behaviors = ["resting", "hunting", "exploring", "wandering"];

  let creatures = [
    new Creature(
      "fire beetle",
      "fire beetles",
      "",
      ["glows with soft orange light"],
      ["forest", "underdark"],
      behaviors,
      ["beast"],
      ["beetle"],
      1,
    ),
    new Creature(
      "giant ant",
      "giant ants",
      "",
      [],
      ["forest", "grassland", "hill"],
      behaviors,
      ["beast"],
      ["ant", "swarm"],
      1,
    ),
    new Creature(
      "giant bee",
      "giant bees",
      "",
      ["venomous sting"],
      ["forest", "grassland", "hill"],
      behaviors,
      ["beast"],
      ["bee", "flying", "swarm"],
      2,
    ),
    new Creature(
      "giant beetle",
      "giant beetles",
      "",
      [],
      ["forest", "grassland", "hill", "mountain", "urban", "underdark"],
      behaviors,
      ["beast"],
      ["beetle", "swarm"],
      1,
    ),
    new Creature(
      "giant centipede",
      "giant centipedes",
      "",
      ["venomous bite"],
      ["forest", "grassland", "hill", "mountain", "underdark"],
      behaviors,
      ["beast"],
      ["centipede"],
      2,
    ),
    new Creature(
      "giant dragonfly",
      "giant dragonflies",
      "",
      [],
      ["forest", "grassland", "hill"],
      behaviors,
      ["beast"],
      ["flying"],
      1,
    ),
    new Creature(
      "giant scorpion",
      "giant scorpions",
      "",
      ["deadly venomous sting"],
      ["desert"],
      behaviors,
      ["beast"],
      ["scorpion", "arachnid"],
      3,
    ),
    new Creature(
      "giant spider",
      "giant spiders",
      "",
      ["deadly venomous bite"],
      ["coastal", "forest", "grassland", "hill", "mountain", "underdark", "urban"],
      behaviors,
      ["beast"],
      ["spider", "arachnid"],
      3,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push("insect");
  }

  return creatures;
}
