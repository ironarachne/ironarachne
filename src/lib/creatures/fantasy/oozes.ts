"use strict";

import Creature from "../creature.js";

export function all(): Creature[] {
  let behaviors = ["waiting", "hunting", "wandering", "clinging to the ceiling"];

  let creatures = [
    new Creature(
      "black pudding",
      "black puddings",
      "",
      ["dissolve nonmagical metal things", "amorphous", "climb walls and ceilings"],
      ["forest", "grassland", "hill", "underdark"],
      behaviors,
      ["ooze"],
      [],
      2,
    ),
    new Creature(
      "blue jelly",
      "blue jellies",
      "",
      ["amorphous", "climb walls and ceilings"],
      ["forest", "grassland", "hill"],
      behaviors,
      ["ooze"],
      [],
      1,
    ),
    new Creature(
      "blue slime",
      "blue slimes",
      "",
      ["amorphous", "climb walls and ceilings"],
      ["coastal", "forest", "grassland", "hill"],
      behaviors,
      ["ooze"],
      [],
      1,
    ),
    new Creature(
      "brown pudding",
      "brown puddings",
      "",
      ["amorphous", "climb walls and ceilings"],
      ["forest", "grassland", "hill"],
      behaviors,
      ["ooze"],
      [],
      2,
    ),
    new Creature(
      "gelatinous cube",
      "gelatinous cubes",
      "",
      ["dissolve nonmetal things"],
      ["forest", "grassland", "hill"],
      ["waiting", "wandering"],
      ["ooze"],
      [],
      3,
    ),
    new Creature(
      "gray ooze",
      "gray oozes",
      "",
      ["amorphous", "corrode metal", "imitate oily pool", "climb walls and ceilings"],
      ["underdark"],
      behaviors,
      ["ooze"],
      [],
      2,
    ),
    new Creature(
      "green slime",
      "green slimes",
      "",
      ["amorphous", "climb walls and ceilings"],
      ["forest", "grassland", "hill"],
      behaviors,
      ["ooze"],
      [],
      1,
    ),
    new Creature(
      "ochre jelly",
      "ochre jellies",
      "",
      ["amorphous", "climb walls and ceilings", "split in half when hit with lightning"],
      ["forest", "grassland", "hill"],
      ["ooze"],
      behaviors,
      [],
      3,
    ),
  ];

  for (let i = 0; i < creatures.length; i++) {
    creatures[i].tags.push(creatures[i].name);
    creatures[i].tags.push("ooze");
  }

  return creatures;
}
