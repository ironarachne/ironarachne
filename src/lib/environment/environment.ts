import type Biome from "./biomes/biome.js";
import type Climate from "./climates/climate.js";
import type Ecosystem from "./ecosystems/ecosystem.js";
import type Terrain from "./terrain/terrain.js";

export default interface Environment {
  biome: Biome;
  climate: Climate;
  terrain: Terrain;
  dominantEcosystem: Ecosystem;
  ecosystems: Ecosystem[];
  description: string;
}
