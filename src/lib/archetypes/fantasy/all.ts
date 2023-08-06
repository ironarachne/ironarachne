"use strict";

import Archetype from "../archetype.js";
import * as Cleric from "./cleric.js";
import * as Cult from "./cult.js";
import * as Mage from "./mage.js";
import * as Martial from "./martial.js";
import * as Undead from "./undead.js";

export function all(): Archetype[] {
  let result: Archetype[] = [];

  result = result.concat(Cleric.all());
  result = result.concat(Cult.all());
  result = result.concat(Mage.all());
  result = result.concat(Martial.all());
  result = result.concat(Undead.all());

  return result;
}
