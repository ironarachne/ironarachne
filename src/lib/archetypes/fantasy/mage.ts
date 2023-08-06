"use strict";

import * as ItemGenerators from "../../equipment/generators.js";
import Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    new Archetype("apprentice mage", ["casts minor spells"], ["magic user"], 1, [
      ItemGenerators.getItemGenerator("staff", 1),
      ItemGenerators.getItemGenerator("robe", 0),
    ]),
    new Archetype("archmage", ["casts spells"], ["magic user"], 4, [
      ItemGenerators.getItemGenerator("staff", 3),
      ItemGenerators.getItemGenerator("robe", 3),
    ]),
    new Archetype("druid", ["casts nature spells"], ["magic user"], 2, [
      ItemGenerators.getItemGenerator("staff", 1),
      ItemGenerators.getItemGenerator("robe", 0),
    ]),
    new Archetype("mage", ["casts spells"], ["magic user"], 2, [
      ItemGenerators.getItemGenerator("staff", 1),
      ItemGenerators.getItemGenerator("robe", 0),
    ]),
    new Archetype("necromancer", ["casts necromantic spells"], ["magic user"], 4, [
      ItemGenerators.getItemGenerator("staff", 3),
      ItemGenerators.getItemGenerator("robe", 3),
    ]),
    new Archetype("sorcerer", ["casts innate spells"], ["magic user"], 2, []),
    new Archetype("warlock", ["casts demonic spells"], ["magic user"], 2, []),
    new Archetype("witch", ["casts curses", "casts charms"], ["magic user"], 2, []),
    new Archetype("wizard", ["casts spells"], ["magic user"], 2, [
      ItemGenerators.getItemGenerator("staff", 1),
      ItemGenerators.getItemGenerator("robe", 1),
    ]),
  ];
}
