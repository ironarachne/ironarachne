import { DENSITY_MAP, type Item } from './equipment_types';
import * as Currency from '$lib/currency';

/**
 * Given a list of items, return an array of descriptions combining identical items into groups.
 *
 * @param items the items to describe as groups
 */
export function createCombinedDescriptions(items: Item[], includeValue: boolean = false, currencySystem: Currency.CurrencySystem = Currency.COMMON_FANTASY): string[] {
  const itemCountMap: Record<string, { item: Item; count: number }> = {};

  for (const item of items) {
    if (itemCountMap[item.name]) {
      itemCountMap[item.name].count += 1;
    } else {
      itemCountMap[item.name] = { item, count: 1 };
    }
  }

  const descriptions: string[] = [];
  for (const entry of Object.values(itemCountMap)) {
    if (entry.count > 1) {
      if (includeValue) {
        descriptions.push(
          `${entry.count}x  ${entry.item.name} (Total Value: ${Currency.valueToString(entry.item.value * entry.count, currencySystem)})`,
        );
      } else {
        descriptions.push(`${entry.count}x ${entry.item.name}`);
      }
    } else {
      if (includeValue) {
        descriptions.push(`${entry.item.name} (Value: ${Currency.valueToString(entry.item.value, currencySystem)})`);
      } else {
        descriptions.push(entry.item.name);
      }
    }
  }

  return descriptions;
}

export function applyStatOffsets(offsets: Record<string, number>, item: Item): Item {
  const newItem = structuredClone(item);

  for (const [stat, offset] of Object.entries(offsets)) {
    if (newItem.combatProfile) {
      if (stat in newItem.combatProfile) {
        // @ts-ignore
        newItem.combatProfile[stat] += offset;
      }
    }
  }

  return newItem;
}

export function getVolume(item: Item): number {
  // If a manual volume is specified, use that
  if (item.manualVolume !== undefined) {
    return item.manualVolume;
  }

  return item.weight / DENSITY_MAP[item.densityCategory];
}
