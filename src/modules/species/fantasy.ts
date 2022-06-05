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
import * as RND from '../random';
import * as Skeleton from './modifiers/skeleton';
import * as Vampire from './modifiers/vampire';
import * as Zombie from './modifiers/zombie';
import Tiefling from './tiefling';
import Troll from './troll';

export function all(): Species[] {
  let result = [];

  result = result.concat(greenskins());
  result = result.concat(pc());
  result = result.concat(undead());

  return result;
}

export function greenskins(): Species[] {
  let result = [new Goblin(), new Orc(), new Troll()];

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
