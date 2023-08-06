"use strict";

import Creature from "../creature.js";

export function all(): Creature[] {
  let behaviors = ["immobile", "inert", "guarding", "watching", "wandering"];

  let creatures = [
    new Creature(
      "amber golem",
      "amber golems",
      "",
      ["resistant to magic", "cannot be polymorphed"],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "golem"],
      5,
    ),
    new Creature(
      "clay golem",
      "clay golems",
      "",
      ["immune to acid", "cannot be polymorphed"],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "golem"],
      3,
    ),
    new Creature(
      "stone golem",
      "stone golems",
      "",
      ["resistant to fire", "cannot be polymorphed"],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "golem"],
      3,
    ),
    new Creature(
      "iron golem",
      "iron golems",
      "",
      ["resistant to fire", "cannot be polymorphed"],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "golem"],
      3,
    ),
    new Creature(
      "wood golem",
      "wood golems",
      "",
      ["cannot be polymorphed"],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "golem"],
      2,
    ),
    new Creature(
      "enchanted suit of armor",
      "enchanted suits of armor",
      "",
      [],
      [],
      behaviors,
      ["construct"],
      ["enchanted"],
      2,
    ),
    new Creature(
      "enchanted book",
      "enchanted books",
      "",
      ["cast a single minor spell"],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "flying"],
      1,
    ),
    new Creature(
      "flying sword",
      "flying swords",
      "",
      [],
      [],
      behaviors,
      ["construct"],
      ["enchanted", "flying"],
      1,
    ),
    new Creature(
      "lesser gargoyle",
      "lesser gargoyles",
      "",
      ["turn to stone at will"],
      [],
      behaviors,
      ["monstrosity"],
      ["enchanted", "gargoyle"],
      2,
    ),
    new Creature(
      "mimic",
      "mimics",
      "",
      ["resemble a chest or other large container at will"],
      [],
      behaviors,
      ["monstrosity"],
      ["enchanted"],
      2,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push("magic");
  }

  return creatures;
}
