import type { Item } from './equipment_types';

/**
 * Generates a composite description for an item based on its components.
 *
 * @param item The item to generate a description for
 * @returns A string containing the full description
 */
export function generateDescription(item: Item): string {
  const parts: string[] = [];

  // Start with the base description
  // "A [name]. [Description]"
  // But item.name is already "Flaming Sharp Iron Longsword"
  // And item.description is "A long blade..."

  // Let's try to make it flow.
  // "This is a [name]. [Base Description]"
  parts.push(`This is a ${item.name.toLowerCase()}.`);
  if (item.description) {
    parts.push(item.description);
  }

  if (item.refinement && item.refinement.description) {
    parts.push(item.refinement.description);
  }

  if (item.decoration && item.decoration.description) {
    parts.push(item.decoration.description);
  }

  if (item.enchantment && item.enchantment.description) {
    parts.push(item.enchantment.description);
  }

  return parts.join(' ');
}

