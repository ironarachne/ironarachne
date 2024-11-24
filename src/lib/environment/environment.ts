import type Biome from "./biomes/biome.js";
import type Climate from "./climates/climate.js";
import type Ecosystem from "./ecosystems/ecosystem.js";
import type Terrain from "./terrain/terrain.js";
import type WaterSystem from "./water_systems/water_system.js";

export default interface Environment {
  biome: Biome;
  climate: Climate;
  terrain: Terrain;
  waterSystem: WaterSystem;
  dominantEcosystem: Ecosystem;
  ecosystems: Ecosystem[];
  description: string;
}
