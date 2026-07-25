import type { Item } from '$lib/equipment/equipment_types';
import type { ArtObject } from './art_objects/art_object_types';
import type { Gem } from './gems/gem_types';
import type { PileOfCoins } from './coins/coin_types';

/**
 * Narrowing helpers for the heterogeneous item arrays a treasure hoard returns.
 *
 * Each generator stamps `itemMinorType` alongside its own extra fields, so the discriminator is
 * checked here rather than duck-typing on those fields at every call site.
 */

export function isGem(item: Item): item is Gem {
  return item.itemMinorType === 'gem';
}

export function isArtObject(item: Item): item is ArtObject {
  return item.itemMinorType === 'art object';
}

export function isPileOfCoins(item: Item): item is PileOfCoins {
  return item.itemMinorType === 'coins';
}

export function isPotion(item: Item): boolean {
  return item.itemMajorType === 'potion';
}
