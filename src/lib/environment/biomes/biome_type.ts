export default interface BiomeType {
    name: string;
    altitudeMax: number;
    altitudeMin: number;
    humidityMax: number;
    humidityMin: number;
    temperatureMax: number;
    temperatureMin: number;
    faunaTypes: string[]; // possible fauna types for this biome
    faunaDensity: number; // 0-1
    vegetationTypes: string[]; // possible vegetation types for this biome
    vegetationDensity: number; // 0-1
    waterFeatures: string[]; // possible water features for this biome
    waterFeatureDensity: number; // 0-1
    isAquatic: boolean;
}