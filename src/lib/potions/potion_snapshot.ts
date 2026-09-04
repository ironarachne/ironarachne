/**
 * Writing a potion for storage, and reading one back.
 *
 * `Potion` is plain throughout — the container and the liquid are `Item`s, the effect is a record
 * with a duration and an optional parameters union, and the modifications are tagged objects — so
 * the codec converts nothing. What it does do is **stop storing the same thing twice**.
 *
 * `generatePotion` writes the effect, the sensory profile and the display name into the liquid *and*
 * onto the potion beside it: `liquid.effect === effect`, `liquid.sensory === sensory`, and
 * `liquid.name === displayName`. Two copies of one fact is a shape where an editor changes one and
 * the other goes stale, which is requirement 4.2's failure mode dressed as a data model. The
 * snapshot keeps the potion's copy and rebuilds the liquid's on read, so there is one place to edit
 * an effect and one answer to what it is.
 *
 * Nothing else is dropped. The container's `contents` and the liquid's `containerId` point at each
 * other, and both stay: they are two ids, they are what says which bottle this liquid is in, and a
 * reader that had to infer the pairing would be inventing it.
 */

import type { Container } from '$lib/equipment';
import { withLegacyPotionMechanics, type MechanicsSet } from '$lib/rulesets';

import type {
  Potion,
  PotionEffect,
  PotionLiquid,
  PotionModification,
  PotionSensoryProfile,
} from './potion_types.js';

/**
 * The liquid as it is stored: everything except the three fields the potion already holds.
 *
 * `name`, `effect` and `sensory` are rebuilt on read from `displayName`, `effect` and `sensory`.
 */
export type StoredPotionLiquid = Omit<PotionLiquid, 'name' | 'effect' | 'sensory' | 'mechanics'> & {
  mechanics: MechanicsSet;
};

/** A potion as it is stored. */
export type PotionSnapshot = {
  container: Container & { mechanics: MechanicsSet };
  liquid: StoredPotionLiquid;
  displayName: string;
  canonicalName?: string;
  sensory: PotionSensoryProfile;
  effect: PotionEffect;
  modifications: PotionModification[];
  mechanics: MechanicsSet;
};

function copyEffect(effect: PotionEffect): PotionEffect {
  return {
    ...effect,
    duration: { ...effect.duration },
    ...(effect.elements === undefined ? {} : { elements: [...effect.elements] }),
    ...(effect.spheres === undefined ? {} : { spheres: [...effect.spheres] }),
    ...(effect.statOffsets === undefined ? {} : { statOffsets: { ...effect.statOffsets } }),
    ...(effect.parameters === undefined ? {} : { parameters: { ...effect.parameters } }),
  };
}

function copyContainer(container: Container): Container {
  return {
    ...container,
    properties: [...container.properties],
    contents: [...container.contents],
    ...(container.lock === undefined ? {} : { lock: { ...container.lock } }),
  };
}

function copyStoredLiquid(liquid: PotionLiquid | StoredPotionLiquid): StoredPotionLiquid {
  const { ...rest } = liquid as StoredPotionLiquid & Partial<PotionLiquid>;
  delete (rest as Partial<PotionLiquid>).name;
  delete (rest as Partial<PotionLiquid>).effect;
  delete (rest as Partial<PotionLiquid>).sensory;
  return { ...rest, properties: [...liquid.properties] };
}

export function toPotionSnapshot(potion: Potion): PotionSnapshot {
  return withLegacyPotionMechanics(
    {
      container: copyContainer(potion.container),
      liquid: copyStoredLiquid(potion.liquid),
      displayName: potion.displayName,
      ...(potion.canonicalName === undefined ? {} : { canonicalName: potion.canonicalName }),
      sensory: { ...potion.sensory },
      effect: copyEffect(potion.effect),
      modifications: potion.modifications.map((modification) => ({ ...modification })),
    },
    'generated',
  ) as PotionSnapshot;
}

/**
 * Nothing is recomputed on read.
 *
 * The liquid's three derived fields are rebuilt — that is not recomputation, it is the same value
 * put back where the live type expects it. The value, the rarity and the description are the
 * potion's own, and re-deriving any of them from the catalog would overwrite what a referee
 * changed by hand.
 */
export function potionFromSnapshot(snapshot: PotionSnapshot): Potion {
  const sensory = { ...snapshot.sensory };
  const effect = copyEffect(snapshot.effect);

  return {
    container: copyContainer(snapshot.container),
    liquid: {
      ...copyStoredLiquid(snapshot.liquid),
      name: snapshot.displayName,
      effect,
      sensory,
    } as PotionLiquid,
    displayName: snapshot.displayName,
    ...(snapshot.canonicalName === undefined ? {} : { canonicalName: snapshot.canonicalName }),
    sensory,
    effect,
    modifications: snapshot.modifications.map((modification) => ({ ...modification })),
    mechanics: { variants: [...snapshot.mechanics.variants] },
  };
}

/** The codec's reading half, with the signature the registry hands it. The RNG is unused. */
export function potionFromSnapshotWithRng(snapshot: PotionSnapshot, _rng: unknown): Potion {
  return potionFromSnapshot(snapshot);
}
