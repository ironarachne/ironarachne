"use strict";

import * as _ from "lodash";
import type Species from "../species.js";

export function modify(species: Species): Species {
  let result = _.cloneDeep(species);

  let modifierName = "vampire";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push("drain blood to gain life");
  result.abilities.push("transform into a bat");
  result.abilities.push("transform into a wolf");
  result.abilities.push("transform into mist");
  result.abilities.push("see in the dark");
  result.abilities.push("can only be killed by a stake through the heart or by direct sunlight");
  result.tags.push("vampire");
  result.tags.push("undead");
  result.threatLevel += 5;

  return result;
}
