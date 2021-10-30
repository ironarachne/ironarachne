"use strict";

import dwarf from "./dwarf";
import elf from "./elf";
import gnome from "./gnome";
import halfelf from "./half-elf";
import halfling from "./halfling";
import halforc from "./half-orc";
import human from "./human";
import * as Species from "./common";

export function all(): Species.Species[] {
  return [
    dwarf,
    elf,
    gnome,
    halfelf,
    halfling,
    halforc,
    human,
  ];
}
