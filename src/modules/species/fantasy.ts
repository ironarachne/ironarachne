'use strict';

import Dragonborn from './dragonborn';
import Dwarf from './dwarf';
import Elf from './elf';
import Gnome from './gnome';
import HalfElf from './half-elf';
import Halfling from './halfling';
import HalfOrc from './half-orc';
import Human from './human';
import type Species from './species';
import * as RND from '../random';
import * as Skeleton from './modifiers/skeleton';
import * as Vampire from './modifiers/vampire';
import * as Zombie from './modifiers/zombie';
import Tiefling from './tiefling';

export function all(): Species[] {
  let result = [];
  let normal = pc();

  for (let i = 0; i < normal.length; i++) {
    result.push(normal[i]);
    let skeleton = Skeleton.modify(normal[i]);
    let vampire = Vampire.modify(normal[i]);
    let zombie = Zombie.modify(normal[i]);
    result.push(skeleton);
    result.push(vampire);
    result.push(zombie);
  }

  return result;
}

export function byAnyTag(tags: string[]): Species[] {
  let result = [];

  let options = all();
  let unique = true;

  for (let i = 0; i < options.length; i++) {
    unique = true;
    for (let j = 0; j < tags.length; j++) {
      if (options[i].tags.includes(tags[j]) && unique) {
        result.push(options[i]);
        unique = false;
      }
    }
  }

  return result;
}

export function byTag(tag: string): Species[] {
  let result = [];

  let options = all();

  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
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

export function randomWeighted(): Species {
  const options = all();

  return RND.weighted(options);
}
