import type Biome from './biome';
import * as RND from '../../random';
import Desert from './desert';
import DeciduousForest from './deciduousforest';
import ConiferousForest from './coniferousforest';
import Rainforest from './rainforest';
import Grassland from './grassland';
import Mountain from './mountain';
import Tundra from './tundra';

export function all(): Biome[] {
  return [
    new Desert(),
    new DeciduousForest(),
    new ConiferousForest(),
    new Rainforest(),
    new Grassland(),
    new Mountain(),
    new Tundra(),
  ];
}

export function random(): Biome {
  return RND.item(all());
}
