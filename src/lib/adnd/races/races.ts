"use strict";

import ADNDRace from "../adndrace.js";
import dwarf from "./dwarf.js";
import elf from "./elf.js";
import gnome from "./gnome.js";
import halfelf from "./halfelf.js";
import halfling from "./halfling.js";
import human from "./human.js";

export function getAll(): ADNDRace[] {
  return [dwarf, elf, gnome, halfelf, halfling, human];
}
