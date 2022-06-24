'use strict';

import Dragonborn from './dragonborn';
import Dwarf from './dwarf';
import Elf from './elf';
import Gnome from './gnome';
import Goblin from './goblin';
import HalfElf from './half-elf';
import Halfling from './halfling';
import HalfOrc from './half-orc';
import Human from './human';
import Orc from './orc';
import type Species from './species';
import * as Skeleton from './modifiers/skeleton';
import * as Vampire from './modifiers/vampire';
import * as Zombie from './modifiers/zombie';
import Tiefling from './tiefling';
import Troll from './troll';
import Hobgoblin from './hobgoblin';
import Bugbear from './bugbear';
import Aarakocra from './aarakocra';
import Aasimar from './aasimar';
import Centaur from './centaur';
import DarkElf from './darkelf';
import DeepGnome from './deepgnome';
import Duergar from './duergar';
import Firbolg from './firbolg';
import HighElf from './highelf';

export function all(): Species[] {
  let result = [];

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
