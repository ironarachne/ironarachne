import * as RNG from '@ironarachne/rng';
import type { Armor, Item, Enchantment, Weapon } from './equipment_types';
import { ENCHANTMENTS } from './enchantments';
import { applyStatOffsets } from './items';

/**
 * Applies an enchantment to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param enchantment The enchantment to apply
 * @returns The modified item
 */
export function applyEnchantment(item: Item, enchantment: Enchantment): Item {
  let newItem = structuredClone(item);

  // Update name
  newItem.name = `${enchantment.name} ${newItem.name}`;
  newItem.enchantment = enchantment;

  // Update value
  if (enchantment.valueMultiplier) {
    newItem.value = Math.floor(newItem.value * enchantment.valueMultiplier);
  }
  if (enchantment.valueAdder) {
    newItem.value += enchantment.valueAdder;
  }

  // Add tags
  if (enchantment.tagsAdded) {
    newItem.properties = [...(newItem.properties || []), ...enchantment.tagsAdded];
  }

  // Apply stat offsets
  if (enchantment.statOffsets) {
    newItem = applyStatOffsets(enchantment.statOffsets, newItem);
  }

  // Apply additional damage
  if (
    newItem.itemMajorType === 'weapon' &&
    enchantment.bonusDamage
  ) {
    const weapon = newItem as Weapon;
    weapon.actions = weapon.actions.map((action) => {
      const newAction = structuredClone(action);
      newAction.bonusDamage?.push(...enchantment.bonusDamage!);
      return newAction;
    });

    weapon.combatProfile.power += enchantment.magnitude;
  }

  return newItem;
}

export function filterEnchantmentsByTags(tags: string[], enchantments?: Record<string, Enchantment>): Enchantment[] {
  if (!enchantments) {
    enchantments = ENCHANTMENTS;
  }

  return Object.values(enchantments).filter((enchantment) => {
    if (enchantment.tagsAdded) {
      return tags.every((tag) => enchantment.tagsAdded!.includes(tag));
    }

    return false;
  });
}

/**
 * Selects a random enchantment suitable for the given item.
 *
 * @param item The item to select an enchantment for
 * @param rng The RNG instance to use
 * @returns A random enchantment or null
 */
export function getRandomEnchantment(item: Item, rng: RNG.RNG, enchantments?: Enchantment[]): Enchantment | null {
  if (!enchantments) {
    enchantments = Object.values(ENCHANTMENTS);
  }

  const suitableEnchantments = enchantments.filter((enchantment) => {
    // Check required tags
    if (enchantment.tagsRequired) {
      const hasAllRequired = enchantment.tagsRequired.every((tag) => {
        if (tag === 'weapon') return item.itemMajorType === 'weapon';
        if (tag === 'armor') return item.itemMajorType === 'armor';

        if (item.properties && item.properties.includes(tag)) return true;

        if (item.itemMajorType === 'weapon') {
          const weapon = item as Weapon;
          if (weapon.actions[0].damageType === tag) return true;
        }

        if (item.itemMajorType === 'armor') {
          const armor = item as Armor;
          if (armor.itemMinorType === tag) return true;
        }

        return false;
      });
      if (!hasAllRequired) return false;
    }

    // Check excluded tags
    if (enchantment.tagsExcluded) {
      const hasExcluded = enchantment.tagsExcluded.some((tag) => {
        if (item.properties && item.properties.includes(tag)) return true;
        return false;
      });
      if (hasExcluded) return false;
    }

    return true;
  });

  if (suitableEnchantments.length === 0) {
    return null;
  }

  return rng.item(suitableEnchantments);
}
