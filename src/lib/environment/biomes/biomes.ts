import * as RND from "@ironarachne/rng";
import type Biome from "./biome.js";
import ConiferousForest from "./coniferousforest.js";
import DeciduousForest from "./deciduousforest.js";
import Desert from "./desert.js";
import Grassland from "./grassland.js";
import Mountain from "./mountain.js";
import Rainforest from "./rainforest.js";
import Tundra from "./tundra.js";

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
