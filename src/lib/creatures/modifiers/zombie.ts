"use strict";

import * as _ from "lodash";
import type Creature from "../creature.js";

export function modify(creature: Creature): Creature {
  let result = _.cloneDeep(creature);

  let modifierName = "zombie";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.abilities.push("can only be killed by removing the head");

  let newTags = [];

  for (let i = 0; i < result.tags.length; i++) {
    if (result.tags[i] != "sentient") {
      newTags.push(result.tags[i]);
    }
  }

  result.tags = newTags;

  result.abilities.push("can bite others to transform them into zombies");
  result.tags.push("zombie");
  result.tags.push("undead");
  result.threatLevel += 1;

  return result;
}
