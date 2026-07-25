import * as RNG from '@ironarachne/rng';
import type { Armor, Item, Material } from './equipment_types';
import { MATERIALS } from './materials';
import { applyStatOffsets } from './items';

/**
 * Applies a material to an item, modifying its properties.
 *
 * @param item The item to modify
 * @param material The material to apply
 * @returns The modified item
 */
export function applyMaterial(item: Item, material: Material): Item {
  let newItem = structuredClone(item);

  newItem.name = `${material.name} ${item.name}`;
  newItem.material = material;
  newItem.weight = item.weight * material.weightMultiplier;
  newItem.value = Math.floor(item.value * material.valueMultiplier);
  newItem.densityCategory = material.densityCategory;

  if (material.tagsAdded) {
    newItem.properties = [...newItem.properties, ...material.tagsAdded];
  }

  if (material.statOffsets) {
    newItem = applyStatOffsets(material.statOffsets, newItem);
  }

  return newItem;
}

export function filterMaterialsByTags(tags: string[], materials?: Material[]): Material[] {
  if (!materials) {
    materials = Object.values(MATERIALS);
  }

  return materials.filter((material) => {
    // Check required tags
    if (material.tagsAdded) {
      return tags.every((tag) => material.tagsAdded!.includes(tag));
    }

    return false;
  });
}

/**
 * Selects a random material suitable for the given item type.
 *
 * @param item The item to select a material for
 * @param rng The RNG instance to use
 * @returns A random material
 */
export function getRandomMaterialForItem(
  item: Item,
  rng: RNG.RNG,
  materials?: Material[],
): Material {
  if (!materials) {
    materials = Object.values(MATERIALS);
  }

  // Filter materials based on item type
  const suitableMaterials = materials.filter((material) => {
    if (item.allowedMaterialTypes && item.allowedMaterialTypes.length > 0) {
      return item.allowedMaterialTypes.includes(material.majorType);
    }

    // If allowedMaterialTypes is not empty, check minorType as well
    if (item.allowedMaterialTypes && item.allowedMaterialTypes.length > 0 && material.minorType) {
      return item.allowedMaterialTypes.includes(material.minorType);
    }

    // Fallback logic if allowedMaterialTypes is not defined
    if (item.itemMajorType === 'weapon') {
      // Weapons are typically metal or wood
      return material.majorType === 'metal' || material.majorType === 'wood';
    } else if (item.itemMajorType === 'armor') {
      const armor = item as Armor;
      if (armor.itemMinorType === 'light') {
        return material.majorType === 'leather' || material.majorType === 'cloth';
      } else if (armor.itemMinorType === 'medium') {
        return (
          material.majorType === 'metal' ||
          material.majorType === 'leather' ||
          material.majorType === 'hide'
        );
      } else if (armor.itemMinorType === 'heavy') {
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
