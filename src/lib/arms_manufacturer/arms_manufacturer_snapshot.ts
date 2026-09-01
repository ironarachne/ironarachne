/**
 * Writing an arms manufacturer, and reading one back.
 *
 * **This is the one snapshot in the readiness pass that is genuinely the identity function**, and
 * docs/readiness-factions.md says so rather than inventing a conversion to look thorough. An
 * `ArmsManufacturer` is a name, a description and a list of `Weapon`s, and a `Weapon` from
 * `$lib/weapons` is six plain fields — two of them string lists. There is no closure to strip, no
 * table row to resolve by name, and no imagery. The conversion is a copy, and this module exists
 * for the contract rather than for the work.
 *
 * The copy is a deep one all the same: the snapshot must not share its `models` list, or the
 * `cosmetics` and `effects` lists inside each model, with the value it was made from, or an edit
 * to one would silently show up in the other.
 */

import type { RNG } from '@ironarachne/rng';
import type { Weapon } from '$lib/weapons';

import type { ArmsManufacturer } from './arms_manufacturer.js';

/** An arms manufacturer as it is stored: the type as it stands. */
export type ArmsManufacturerSnapshot = ArmsManufacturer;

function copyWeapon(weapon: Weapon): Weapon {
  return { ...weapon, cosmetics: [...weapon.cosmetics], effects: [...weapon.effects] };
}

function copyManufacturer(manufacturer: ArmsManufacturer): ArmsManufacturer {
  return {
    name: manufacturer.name,
    description: manufacturer.description,
    models: manufacturer.models.map(copyWeapon),
  };
}

export function toArmsManufacturerSnapshot(
  manufacturer: ArmsManufacturer,
): ArmsManufacturerSnapshot {
  return copyManufacturer(manufacturer);
}

/**
 * A stored manufacturer back into the value the library works with.
 *
 * Nothing is recomputed and nothing is re-rolled: the description and every model come back
 * exactly as they were stored, which is requirement 4.2 — a user who has rewritten what their
 * favourite gunsmith is known for has made a decision no read may overrule.
 */
export function armsManufacturerFromSnapshot(snapshot: ArmsManufacturerSnapshot): ArmsManufacturer {
  return copyManufacturer(snapshot);
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a manufacturer is finished when it is stored, and drawing anything from a seed
 * on the way back would be regenerating over the user's edits.
 */
export function armsManufacturerFromSnapshotWithRng(
  snapshot: ArmsManufacturerSnapshot,
  _rng: RNG,
): ArmsManufacturer {
  return armsManufacturerFromSnapshot(snapshot);
}
