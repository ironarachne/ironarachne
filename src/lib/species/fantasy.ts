"use strict";

import Aarakocra from "./aarakocra.js";
import Aasimar from "./aasimar.js";
import Bugbear from "./bugbear.js";
import Centaur from "./centaur.js";
import DarkElf from "./darkelf.js";
import DeepGnome from "./deepgnome.js";
import Dragonborn from "./dragonborn.js";
import Duergar from "./duergar.js";
import Dwarf from "./dwarf.js";
import Elf from "./elf.js";
import Firbolg from "./firbolg.js";
import Gnome from "./gnome.js";
import Goblin from "./goblin.js";
import HalfElf from "./half-elf.js";
import HalfOrc from "./half-orc.js";
import Halfling from "./halfling.js";
import HighElf from "./highelf.js";
import Hobgoblin from "./hobgoblin.js";
import Human from "./human.js";
import * as Skeleton from "./modifiers/skeleton.js";
import * as Vampire from "./modifiers/vampire.js";
import * as Zombie from "./modifiers/zombie.js";
import Orc from "./orc.js";
import type Species from "./species.js";
import Tiefling from "./tiefling.js";
import Troll from "./troll.js";

export function all(): Species[] {
  let result: Species[] = [];

  result = result.concat(goblinoids());
  result = result.concat(fantastical());
  result = result.concat(pc());

  return result;
}

export function goblinoids(): Species[] {
  let result = [new Bugbear(), new Goblin(), new Hobgoblin(), new Orc(), new Troll()];

  return result;
}

export function fantastical(): Species[] {
  let result = [
    new Aarakocra(),
    new Aasimar(),
    new Centaur(),
    new DarkElf(),
    new DeepGnome(),
    new Duergar(),
    new Firbolg(),
    new HighElf(),
  ];

  return result;
}

export function undead(): Species[] {
  let result = [];
  let normal = pc();

  for (let i = 0; i < normal.length; i++) {
    let skeleton = Skeleton.modify(normal[i]);
    let vampire = Vampire.modify(normal[i]);
    let zombie = Zombie.modify(normal[i]);
    result.push(skeleton);
    result.push(vampire);
    result.push(zombie);
  }

  return result;
}

export function pc(): Species[] {
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
