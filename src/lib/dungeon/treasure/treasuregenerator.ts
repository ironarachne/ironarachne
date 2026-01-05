import type Item from '$lib/equipment/item.js';

export default interface TreasureGenerator {
  generate: () => Item[];
}
