"use strict";

import dragonborn from "./dragonborn";
import dwarf from "./dwarf";
import elf from "./elf";
import gnome from "./gnome";
import halfelf from "./half-elf";
import halfling from "./halfling";
import halforc from "./half-orc";
import human from "./human";
import Species from "./species";
import * as RND from "../random";

export function all(): Species[] {
  return [
    dragonborn,
    dwarf,
    elf,
    gnome,
    halfelf,
    halfling,
    halforc,
    human,
  ];
}

export function randomWeighted(): Species {
  const options = all();

  return RND.weighted(options);
}
