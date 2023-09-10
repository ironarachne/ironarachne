import type Climate from "../climates/climate.js";
import type Biome from "./biome.js";

export default interface BiomeGeneratorConfig {
  availableBiomes: Biome[];
  climate: Climate;
}
