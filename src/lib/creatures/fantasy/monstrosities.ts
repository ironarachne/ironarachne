"use strict";

import Creature from "../creature.js";

export function all(): Creature[] {
  let behaviors = ["cautious", "hunting", "lethargic", "resting", "sleeping", "stalking"];

  let creatures = [
    new Creature(
      "cockatrice",
      "cockatrices",
      "",
      [],
      ["grassland"],
      behaviors,
      ["monstrosity"],
      ["cockatrice"],
      1,
    ),
    new Creature(
      "darkmantle",
      "darkmantles",
      "",
      ["disguise as stalactite"],
      ["underdark"],
      behaviors,
      ["monstrosity"],
      [],
      1,
    ),
    new Creature(
      "death dog",
      "death dogs",
      "",
      [],
      ["desert"],
      behaviors,
      ["monstrosity"],
      ["canine", "martial"],
      1,
    ),
    new Creature(
      "gryfalcon",
      "gryfalcons",
      "",
      [],
      ["grassland", "hill", "mountain"],
      behaviors,
      ["monstrosity"],
      ["flying"],
      4,
    ),
    new Creature(
      "gryphon",
      "gryphons",
      "",
      [],
      ["grassland", "hill", "mountain"],
      behaviors,
      ["monstrosity"],
      ["flying"],
      4,
    ),
    new Creature(
      "harpy",
      "harpies",
      "",
      [],
      ["coastal", "forest", "hill", "mountain"],
      behaviors,
      ["monstrosity"],
      ["flying"],
      3,
    ),
    new Creature(
      "hippogriff",
      "hippogriffs",
      "",
      [],
      ["grassland", "hill", "mountain"],
      behaviors,
      ["monstrosity"],
      ["flying"],
      4,
    ),
    new Creature("owlbear", "owlbears", "", [], ["forest"], behaviors, ["monstrosity"], [], 4),
    new Creature(
      "rust monster",
      "rust monsters",
      "",
      ["rusts nonmagical metal it touches"],
      ["underdark"],
      behaviors,
      ["monstrosity"],
      [],
      3,
    ),
    new Creature(
      "worg",
      "worgs",
      "",
      ["see in the dark"],
      ["forest", "grassland", "hill"],
      behaviors,
      ["monstrosity"],
      ["canine", "martial", "wolf"],
      3,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push("monstrosity");
  }

  return creatures;
}
