"use strict";

import Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    new Archetype("lich", ["casts necromancy spells"], ["undead"], 5, []),
    new Archetype("shambler", [], ["undead"], 1, []),
    new Archetype("sprinter", [], ["undead"], 2, []),
  ];
}
