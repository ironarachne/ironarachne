import * as RNG from '@ironarachne/rng';
import type { Armor, Item, Material, Weapon } from './equipment_types';
import { MATERIALS } from './materials';

/**
 * Applies a material to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param material The material to apply
 * @returns The modified item
 */
export function applyMaterial(item: Item, material: Material): Item {
  const newItem = structuredClone(item);

  newItem.name = `${material.name} ${item.name}`;
  newItem.weight = item.weight * material.weightMultiplier;
  newItem.value = Math.floor(item.value * material.valueMultiplier);
  newItem.densityCategory = material.densityCategory;

  if (material.tagsAdded) {
    newItem.properties = [...newItem.properties, ...material.tagsAdded];
  }

  if (material.statOffsets) {
    if (newItem.itemMajorType === 'weapon') {
      const weapon = newItem as Weapon;
      if (material.statOffsets.damage) {
        // Handle damage offset
        // For now, we'll just append the bonus if it's a number and positive
        // This is a simplification and might need a proper dice parser later
        const bonus = material.statOffsets.damage;
        if (typeof bonus === 'number' && bonus > 0) {
          if (weapon.damage.includes('+')) {
            const parts = weapon.damage.split('+');
            const currentBonus = parseInt(parts[1], 10);
            weapon.damage = `${parts[0]}+${currentBonus + bonus}`;
          } else if (weapon.damage.includes('-')) {
            // Handle negative modifiers if necessary, but for now assume simple case
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
      if (material.statOffsets.ac) {
        const acBonus = Number(material.statOffsets.ac);
        if (!isNaN(acBonus)) {
          armor.defense += acBonus;
          if (newItem.combatProfile) {
            newItem.combatProfile.defense += acBonus * 3;
          }
        }
      }
    }
  }

  return newItem;
}

/**
 * Selects a random material suitable for the given item type.
 *
 * @param item The item to select a material for
 * @param rng The RNG instance to use
 * @returns A random material
 */
export function getRandomMaterialForItem(item: Item, rng: RNG.RNG): Material {
  // Filter materials based on item type
  const suitableMaterials = Object.values(MATERIALS).filter((material) => {
    if (item.itemMajorType === 'weapon') {
      // Weapons are typically metal or wood
      // Some weapons might be stone or bone, but let's stick to common ones for now
      // Or maybe we should check the weapon definition for allowed materials?
      // For now, let's assume weapons can be metal or wood.
      return material.majorType === 'metal' || material.majorType === 'wood';
    } else if (item.itemMajorType === 'armor') {
      const armor = item as Armor;
      if (armor.armorType === 'light') {
        return material.majorType === 'leather' || material.majorType === 'cloth';
      } else if (armor.armorType === 'medium') {
        return (
          material.majorType === 'metal' ||
          material.majorType === 'leather' ||
          material.majorType === 'hide'
        );
      } else if (armor.armorType === 'heavy') {
        return material.majorType === 'metal';
      }
    }
    return false;
  });

  if (suitableMaterials.length === 0) {
    // Fallback to iron or wood if no suitable material found
    return MATERIALS['iron'] || MATERIALS['oak'];
  }

  return rng.item(suitableMaterials);
}
