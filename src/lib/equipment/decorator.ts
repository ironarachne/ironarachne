import * as RNG from '@ironarachne/rng';
import type { Decoration, Item } from './equipment_types';
import { DECORATIONS } from './decorations';

/**
 * Applies a decoration to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param decoration The decoration to apply
 * @returns The modified item
 */
export function applyDecoration(item: Item, decoration: Decoration): Item {
  const newItem = structuredClone(item);

  // Update name - decorations usually go before the name, but after refinements/materials?
  // Let's just prepend for now. "Jeweled Iron Sword"
  newItem.name = `${decoration.name} ${newItem.name}`;
  newItem.decoration = decoration;

  // Update value
  if (decoration.valueMultiplier) {
    newItem.value = Math.floor(newItem.value * decoration.valueMultiplier);
  }

  // Add tags
  if (decoration.tagsAdded) {
    newItem.properties = [...(newItem.properties || []), ...decoration.tagsAdded];
  }

  return newItem;
}

/**
 * Selects a random decoration suitable for the given item.
 *
 * @param item The item to select a decoration for
 * @param rng The RNG instance to use
 * @returns A random decoration or null
 */
export function getRandomDecoration(item: Item, rng: RNG.RNG): Decoration | null {
  const suitableDecorations = Object.values(DECORATIONS).filter((decoration) => {
    // Check required tags
    if (decoration.tagsRequired) {
      const hasAllRequired = decoration.tagsRequired.every(tag => {
          if (item.properties && item.properties.includes(tag)) return true;
          // Also check material tags if we had them accessible, but properties should cover it if applied correctly
          // Check item type tags
           if (tag === 'weapon') return item.itemMajorType === 'weapon';
           if (tag === 'armor') return item.itemMajorType === 'armor';
          return false;
      });
      if (!hasAllRequired) return false;
    }

    // Check excluded tags
    if (decoration.tagsExcluded) {
       const hasExcluded = decoration.tagsExcluded.some(tag => {
           if (item.properties && item.properties.includes(tag)) return true;
           return false;
       });
       if (hasExcluded) return false;
    }

    return true;
  });

  if (suitableDecorations.length === 0) {
    return null;
  }

  return rng.item(suitableDecorations);
}
