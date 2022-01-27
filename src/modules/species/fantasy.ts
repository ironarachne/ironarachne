"use strict";

import Dragonborn from "./dragonborn";
import Dwarf from "./dwarf";
import Elf from "./elf";
import Gnome from "./gnome";
import HalfElf from "./half-elf";
import Halfling from "./halfling";
import HalfOrc from "./half-orc";
import Human from "./human";
import Species from "./species";
import * as RND from "../random";
import Tiefling from "./tiefling";

export function all(): Species[] {
  return [
    new Dragonborn(),
    new Dwarf(),
    new Elf(),
    new Gnome(),
    new HalfElf(),
    new Halfling(),
    new HalfOrc(),
    new Human(),
    new Tiefling(),
  ];
}

export function randomWeighted(): Species {
  const options = all();

  return RND.weighted(options);
}
