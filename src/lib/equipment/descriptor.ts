import * as Words from "@ironarachne/words";
import type { Item } from './equipment_types';

/**
 * Generates a composite description for an item based on its components.
 *
 * @param item The item to generate a description for
 * @returns A string containing the full description
 */
export function generateDescription(item: Item): string {
  const parts: string[] = [];

  parts.push('This is');
  if (item.uniqueName) {
    parts.push(` ${item.uniqueName},`);
  }
  parts.push(` ${Words.article(item.name)} ${item.name.toLowerCase()}.`);
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
