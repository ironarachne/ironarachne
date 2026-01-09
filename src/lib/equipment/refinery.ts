import * as RNG from '@ironarachne/rng';
import type { Armor, Item, Refinement, Weapon } from './equipment_types';
import { REFINEMENTS } from './refinements';
import { applyStatOffsets } from './items';

/**
 * Applies a refinement to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param refinement The refinement to apply
 * @returns The modified item
 */
export function applyRefinement(item: Item, refinement: Refinement): Item {
  let newItem = structuredClone(item);

  // Update name
  newItem.name = `${refinement.name} ${newItem.name}`;
  newItem.refinement = refinement;

  // Update weight
  if (refinement.weightMultiplier) {
    newItem.weight *= refinement.weightMultiplier;
  }

  // Update value
  if (refinement.valueMultiplier) {
    newItem.value = Math.floor(newItem.value * refinement.valueMultiplier);
  }

  // Add tags
  if (refinement.tagsAdded) {
    newItem.properties = [...(newItem.properties || []), ...refinement.tagsAdded];
  }

  // Apply stat offsets
  if (refinement.statOffsets) {
    newItem = applyStatOffsets(refinement.statOffsets, newItem);
  }

  return newItem;
}

export function filterRefinementsByTags(tags: string[], refinements?: Record<string, Refinement>): Refinement[] {
  if (!refinements) {
    refinements = REFINEMENTS;
  }

  return Object.values(refinements).filter((refinement) => {
    if (refinement.tagsAdded) {
      return tags.every((tag) => refinement.tagsAdded!.includes(tag));
    }

    return false;
  });
}

/**
 * Selects a random refinement suitable for the given item.
 *
 * @param item The item to select a refinement for
 * @param rng The RNG instance to use
 * @returns A random refinement or null
 */
export function getRandomRefinement(item: Item, rng: RNG.RNG, refinements?: Refinement[]): Refinement | null {
  if (!refinements) {
    refinements = Object.values(REFINEMENTS);
  }

  const suitableRefinements = refinements.filter((refinement) => {
    // Check required tags
    if (refinement.tagsRequired) {
      const hasAllRequired = refinement.tagsRequired.every((tag) => {
        if (tag === 'weapon') return item.itemMajorType === 'weapon';
        if (tag === 'armor') return item.itemMajorType === 'armor';

        if (item.properties && item.properties.includes(tag)) return true;

        if (item.itemMajorType === 'weapon') {
          const weapon = item as Weapon;
          if (weapon.weaponType.baseActions[0].damageType === tag) return true;
        }

        return false;
      });
      if (!hasAllRequired) return false;
    }

    // Check excluded tags
    if (refinement.tagsExcluded) {
      const hasExcluded = refinement.tagsExcluded.some((tag) => {
        if (item.properties && item.properties.includes(tag)) return true;
        return false;
      });
      if (hasExcluded) return false;
    }

    return true;
  });

  if (suitableRefinements.length === 0) {
    return null;
  }

  return rng.item(suitableRefinements);
}
