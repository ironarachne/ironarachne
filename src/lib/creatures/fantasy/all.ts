"use strict";

import Creature from "../creature.js";
import * as Skeletal from "../modifiers/skeleton.js";
import * as Vampire from "../modifiers/vampire.js";
import * as Zombie from "../modifiers/zombie.js";
import * as Animals from "./animals.js";
import * as Demonic from "./demonic.js";
import * as Elementals from "./elementals.js";
import * as Insects from "./insects.js";
import * as Magical from "./magical.js";
import * as Monstrosities from "./monstrosities.js";
import * as Oozes from "./oozes.js";
import * as Undead from "./undead.js";

export function all(): Creature[] {
  let result: Creature[] = [];

  result = result.concat(Animals.all());

  let undeadVariants: Creature[] = [];

  for (let i = 0; i < result.length; i++) {
    undeadVariants.push(Skeletal.modify(result[i]));
    undeadVariants.push(Vampire.modify(result[i]));
    undeadVariants.push(Zombie.modify(result[i]));
  }

  result = result.concat(undeadVariants);
  result = result.concat(Demonic.all());
  result = result.concat(Elementals.all());
  result = result.concat(Insects.all());
  result = result.concat(Magical.all());
  result = result.concat(Monstrosities.all());
  result = result.concat(Oozes.all());
  result = result.concat(Undead.all());

  return result;
}
