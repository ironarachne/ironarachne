import type BiomeGeneratorConfig from "./biomes/generator_config";
import type ClimateGeneratorConfig from "./climates/generator_config";
import type EcosystemConfig from "./ecosystems/ecosystem_config";
import type TerrainGeneratorConfig from "./terrain/generator_config";
import type WaterSystemConfig from "./water_systems/water_system_config";

export default interface EnvironmentGeneratorConfig {
    biomeConfig: BiomeGeneratorConfig;
    climateConfig: ClimateGeneratorConfig;
    current: number[];
    ecosystemConfig: EcosystemConfig;
    elevation: number;
    erosionIterations: number;
    erosionStrength: number;
    latitude: number;
    reliefEnergy: number;
    terrainConfig: TerrainGeneratorConfig;
    terrainVector: number[];
    waterDirection: number[];
    waterSystemConfig: WaterSystemConfig;
}