"use strict";

import * as RND from "@ironarachne/rng";
import * as Skeleton from "./modifiers/skeleton.js";
import * as Vampire from "./modifiers/vampire.js";
import * as Zombie from "./modifiers/zombie.js";
import type Species from "./species.js";

export function byAnyTag(tags: string[], options: Species[]): Species[] {
  let result = [];

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

export function byEnvironment(environment: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].environments.includes(environment) || options[i].environments.length == 0) {
      result.push(options[i]);
    }
  }

  return result;
}

export function byTag(tag: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }

  return result;
}

export function getModifiedVariants(options: Species[]): Species[] {
  let result: Species[] = [];

  result = result.concat(getSkeletonVariants(options));
  result = result.concat(getVampireVariants(options));
  result = result.concat(getZombieVariants(options));

  return result;
}

export function getSkeletonVariants(options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    let skeleton = Skeleton.modify(options[i]);
    result.push(skeleton);
  }

  return result;
}

export function getVampireVariants(options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    let vampire = Vampire.modify(options[i]);
    result.push(vampire);
  }

  return result;
}

export function getZombieVariants(options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    let zombie = Zombie.modify(options[i]);
    result.push(zombie);
  }

  return result;
}

export function randomUniqueSet(options: Species[], count: number): Species[] {
  let result: Species[] = [];

  options = RND.shuffle(options);

  if (options.length >= count) {
    for (let i = 0; i < count; i++) {
      let item: Species | undefined = options.pop();
      if (item !== undefined) {
        result.push(item);
      }
    }
  } else {
    throw new Error("Not enough options to choose from.");
  }

  return result;
}

export function randomWeighted(options: Species[]): Species {
  return RND.weighted(options);
}

export function withCreatureType(creatureType: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].creatureTypes.includes(creatureType)) {
      result.push(options[i]);
    }
  }

  return result;
}

export function withoutTag(tag: string, options: Species[]): Species[] {
  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (!options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }

  return result;
}
