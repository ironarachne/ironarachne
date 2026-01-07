import * as RNG from '@ironarachne/rng';
import type { Armor, Item, Refinement, Weapon } from './equipment_types';
import { REFINEMENTS } from './refinements';

/**
 * Applies a refinement to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param refinement The refinement to apply
 * @returns The modified item
 */
export function applyRefinement(item: Item, refinement: Refinement): Item {
  const newItem = structuredClone(item);

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
    if (newItem.itemMajorType === 'weapon') {
      const weapon = newItem as Weapon;
      if (refinement.statOffsets.damage) {
        const bonus = refinement.statOffsets.damage;
        if (typeof bonus === 'number' && bonus > 0) {
          if (weapon.damage.includes('+')) {
            const parts = weapon.damage.split('+');
            const currentBonus = parseInt(parts[1], 10);
            weapon.damage = `${parts[0]}+${currentBonus + bonus}`;
          } else if (weapon.damage.includes('-')) {
            weapon.damage = `${weapon.damage}+${bonus}`;
          } else {
            weapon.damage = `${weapon.damage}+${bonus}`;
          }

          if (newItem.combatProfile) {
            newItem.combatProfile.power += bonus * 10;
          }
        }
      }
    } else if (newItem.itemMajorType === 'armor') {
      const armor = newItem as Armor;
      if (refinement.statOffsets.defense) {
        const defenseBonus = Number(refinement.statOffsets.defense);
        if (!isNaN(defenseBonus)) {
          armor.defense += defenseBonus;
          if (newItem.combatProfile) {
            newItem.combatProfile.defense += defenseBonus * 3;
          }
        }
      }
    }
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
          if (weapon.damageType === tag) return true;
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
