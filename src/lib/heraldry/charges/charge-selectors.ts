import * as RNG from '@ironarachne/rng';
import type { Charge } from './charge-types.js';
import { getAllCharges } from './charge-data.js';

export function all(): Charge[] {
  return getAllCharges();
}

export function allChargeTags(): string[] {
  const charges = getAllCharges();
  const tagSet: Set<string> = new Set();
  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      tagSet.add(charges[i].tags[j]);
    }
  }
  return Array.from(tagSet);
}

export function random(charges: Charge[]): Charge {
  return RNG.item(charges);
}

export function randomWithTag(tag: string, charges: Charge[]): Charge {
  let matching = matchingTag(tag, charges);
  return random(matching);
}

export function matchingTag(tag: string, charges: Charge[]): Charge[] {
  let result: Charge[] = [];
  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (charges[i].tags[j] === tag) {
        result.push(charges[i]);
        break;
      }
    }
  }
  return result;
}

export function matchingAnyTags(tags: string[], charges: Charge[]): Charge[] {
  let result: Charge[] = [];
  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (tags.includes(charges[i].tags[j])) {
        result.push(charges[i]);
        break;
      }
    }
  }
  return result;
}
