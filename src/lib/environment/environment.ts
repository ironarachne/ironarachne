import type Biome from "./biomes/biome.js";
import type Climate from "./climates/climate.js";

export default interface Environment {
  biome: Biome;
  climate: Climate;
  description: string;
}
