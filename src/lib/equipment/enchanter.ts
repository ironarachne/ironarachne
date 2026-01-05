import * as RNG from '@ironarachne/rng';
import type { Armor, Item, Enchantment, Weapon } from './equipment_types';
import { ENCHANTMENTS } from './enchantments';

/**
 * Applies an enchantment to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param enchantment The enchantment to apply
 * @returns The modified item
 */
export function applyEnchantment(item: Item, enchantment: Enchantment): Item {
  const newItem = structuredClone(item);

  // Update name
  newItem.name = `${enchantment.name} ${newItem.name}`;

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
    if (newItem.itemMajorType === 'weapon') {
      const weapon = newItem as Weapon;
      if (enchantment.statOffsets.damage) {
        const bonus = enchantment.statOffsets.damage;
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
        }
      }
    } else if (newItem.itemMajorType === 'armor') {
      const armor = newItem as Armor;
      if (enchantment.statOffsets.defense) {
        const defenseBonus = Number(enchantment.statOffsets.defense);
        if (!isNaN(defenseBonus)) {
          armor.defense += defenseBonus;
        }
      }
    }
  }

  return newItem;
}

/**
 * Selects a random enchantment suitable for the given item.
 *
 * @param item The item to select an enchantment for
 * @param rng The RNG instance to use
 * @returns A random enchantment or null
 */
export function getRandomEnchantment(item: Item, rng: RNG.RNG): Enchantment | null {
  const suitableEnchantments = Object.values(ENCHANTMENTS).filter((enchantment) => {
    // Check required tags
    if (enchantment.tagsRequired) {
      const hasAllRequired = enchantment.tagsRequired.every(tag => {
          if (tag === 'weapon') return item.itemMajorType === 'weapon';
          if (tag === 'armor') return item.itemMajorType === 'armor';

          if (item.properties && item.properties.includes(tag)) return true;

          if (item.itemMajorType === 'weapon') {
              const weapon = item as Weapon;
              if (weapon.damageType === tag) return true;
          }

          if (item.itemMajorType === 'armor') {
              const armor = item as Armor;
              if (armor.armorType === tag) return true;
          }

          return false;
      });
      if (!hasAllRequired) return false;
    }

    // Check excluded tags
    if (enchantment.tagsExcluded) {
       const hasExcluded = enchantment.tagsExcluded.some(tag => {
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
