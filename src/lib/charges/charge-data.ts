import { animalCharges } from './charges-animals.js';
import { monsterCharges } from './charges-monsters.js';
import { objectCharges } from './charges-objects.js';
import { plantCharges } from './charges-plants.js';
import { humanCharges } from './charges-humans.js';
import { symbolCharges } from './charges-symbols.js';
import type { ChargeGlyph } from './charge-types.js';

export function getAllChargeGlyphs(): ChargeGlyph[] {
  return [
    ...animalCharges,
    ...monsterCharges,
    ...objectCharges,
    ...plantCharges,
    ...humanCharges,
    ...symbolCharges,
  ];
}

export function getChargeGlyphByName(name: string): ChargeGlyph | undefined {
  const all = getAllChargeGlyphs();
  for (let i = 0; i < all.length; i++) {
    if (all[i].name === name) {
      return all[i];
    }
  }
  return undefined;
}
