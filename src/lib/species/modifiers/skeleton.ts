"use strict";

import type Species from "../species.js";

export function modify(species: Species): Species {
  let result: Species = JSON.parse(JSON.stringify(species));

  let modifierName = "skeletal";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push("unharmed by piercing damage");
  result.tags.push("skeleton");
  result.tags.push("undead");
  result.threatLevel += 1;

  return result;
}
