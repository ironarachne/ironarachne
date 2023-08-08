"use strict";

import type Creature from "../creature.js";

export function modify(creature: Creature): Creature {
  let result: Creature = JSON.parse(JSON.stringify(creature));

  let modifierName = "skeletal";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.abilities.push("unharmed by piercing damage");
  result.tags.push("skeleton");
  result.tags.push("undead");
  result.threatLevel += 1;

  return result;
}
