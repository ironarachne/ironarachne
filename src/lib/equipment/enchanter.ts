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

          if (newItem.combatProfile) {
            newItem.combatProfile.power += bonus * 10;
          }
        }
      }
    } else if (newItem.itemMajorType === 'armor') {
      const armor = newItem as Armor;
      if (enchantment.statOffsets.defense) {
        const defenseBonus = Number(enchantment.statOffsets.defense);
        if (!isNaN(defenseBonus)) {
          armor.defense += defenseBonus;
          if (newItem.combatProfile) {
            newItem.combatProfile.defense += defenseBonus * 3;
          }
        }
      }
    }
  }

  // Apply additional damage
  if (
    newItem.itemMajorType === 'weapon' &&
    enchantment.additionalDamage &&
    enchantment.additionalDamageType
  ) {
    const weapon = newItem as Weapon;
    if (!weapon.additionalDamage) {
      weapon.additionalDamage = [];
    }
    weapon.additionalDamage.push({
      damage: enchantment.additionalDamage,
      type: enchantment.additionalDamageType,
    });

    // Update combat profile power
    // Estimate power from dice: 1d6 (3.5) ~= 17 power
    // 1d4 (2.5) ~= 12
    // 1d8 (4.5) ~= 22
    // Let's use a rough estimator
    if (newItem.combatProfile) {
      let addedPower = 10;
      if (enchantment.additionalDamage.includes('d4')) addedPower = 12;
      if (enchantment.additionalDamage.includes('d6')) addedPower = 17;
      if (enchantment.additionalDamage.includes('d8')) addedPower = 22;
      if (enchantment.additionalDamage.includes('d10')) addedPower = 27;
      if (enchantment.additionalDamage.includes('d12')) addedPower = 32;

      // Handle multipliers like 2d6
      const match = enchantment.additionalDamage.match(/^(\d+)d/);
      if (match && match[1]) {
        const count = parseInt(match[1], 10);
        if (count > 1) addedPower *= count;
      }

      newItem.combatProfile.power += addedPower;
    }
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
