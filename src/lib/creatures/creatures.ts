"use strict";

import Creature from "./creature.js";

export function hasAllTagsIn(tags: string[], creatures: Creature[]): Creature[] {
  let result = [];

  for (let i = 0; i < creatures.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (!creatures[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(creatures[i]);
    }
  }

  return result;
}

export function hasAnyTagIn(tags: string[], creatures: Creature[]): Creature[] {
  let result = [];

  for (let i = 0; i < creatures.length; i++) {
    let valid = false;
    for (let t = 0; t < tags.length; t++) {
      if (creatures[i].tags.includes(tags[t])) {
        valid = true;
        break;
      }
    }
    if (valid === true) {
      result.push(creatures[i]);
    }
  }

  return result;
}

export function hasNoTagIn(tags: string[], creatures: Creature[]): Creature[] {
  let result = [];

  for (let i = 0; i < creatures.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (creatures[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(creatures[i]);
    }
  }

  return result;
}
