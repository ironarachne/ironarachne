import type Mob from "./mob.js";

export function hasAllTagsIn(tags: string[], mobs: Mob[]): Mob[] {
  let result = [];

  for (let i = 0; i < mobs.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (!mobs[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(mobs[i]);
    }
  }

  return result;
}

export function hasAnyTagIn(tags: string[], mobs: Mob[]): Mob[] {
  let result = [];

  for (let i = 0; i < mobs.length; i++) {
    let valid = false;
    for (let t = 0; t < tags.length; t++) {
      if (mobs[i].tags.includes(tags[t])) {
        valid = true;
        break;
      }
    }
    if (valid === true) {
      result.push(mobs[i]);
    }
  }

  return result;
}

export function hasCreatureType(creatureType: string, mobs: Mob[]): Mob[] {
  let result = [];

  for (let i = 0; i < mobs.length; i++) {
    if (mobs[i].creatureTypes.includes(creatureType)) {
      result.push(mobs[i]);
    }
  }

  return result;
}

export function hasEnvironment(environment: string, mobs: Mob[]): Mob[] {
  let result = [];

  for (let i = 0; i < mobs.length; i++) {
    if (mobs[i].environments.includes(environment)) {
      result.push(mobs[i]);
    }
  }

  return result;
}

export function hasNoTagIn(tags: string[], mobs: Mob[]): Mob[] {
  let result = [];

  for (let i = 0; i < mobs.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (mobs[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(mobs[i]);
    }
  }

  return result;
}
