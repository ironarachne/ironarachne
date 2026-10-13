import { mountainRangeFixture } from './region_mountain_range_fixture';

/** Flat woodland surrounded by open ground; shared-edge graph comes from the terrain fixture. */
export function denseForestFixture(biome = 'temperate deciduous forest') {
  const map = mountainRangeFixture();
  for (const node of map.nodes) {
    const x = node.id % 20,
      y = Math.floor(node.id / 20);
    node.elevation = 0.3;
    node.moisture = 0.6;
    node.biomeId = x >= 3 && x <= 16 && y >= 3 && y <= 11 ? biome : 'temperate grassland';
  }
  return map;
}
