import type { RNG } from '@ironarachne/rng';
import type { ChargeGlyph } from './charge-types.js';
import { getAllChargeGlyphs } from './charge-data.js';

export function all(): ChargeGlyph[] {
  return getAllChargeGlyphs();
}

export function allChargeTags(): string[] {
  const charges = getAllChargeGlyphs();
  const tagSet: Set<string> = new Set();
  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      tagSet.add(charges[i].tags[j]);
    }
  }
  return Array.from(tagSet);
}

export function random(charges: ChargeGlyph[], rng: RNG): ChargeGlyph {
  return rng.item(charges);
}

export function randomWithTag(tag: string, charges: ChargeGlyph[], rng: RNG): ChargeGlyph {
  const matching = matchingTag(tag, charges);
  return random(matching, rng);
}

export function matchingTag(tag: string, charges: ChargeGlyph[]): ChargeGlyph[] {
  const result: ChargeGlyph[] = [];
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

export function matchingAnyTags(tags: string[], charges: ChargeGlyph[]): ChargeGlyph[] {
  const result: ChargeGlyph[] = [];
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
