import { animalCharges } from './charges-animals.js';
import { monsterCharges } from './charges-monsters.js';
import { objectCharges } from './charges-objects.js';
import { plantCharges } from './charges-plants.js';
import { humanCharges } from './charges-humans.js';
import { symbolCharges } from './charges-symbols.js';
import type { Charge } from './charge-types.js';

export function getAllCharges(): Charge[] {
  return [
    ...animalCharges,
    ...monsterCharges,
    ...objectCharges,
    ...plantCharges,
    ...humanCharges,
    ...symbolCharges,
  ];
}
