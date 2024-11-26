import type BiomeType from "./biome_type";

export function getAll(): BiomeType[] {
    return [
        {
            name: "deciduous forest",
            altitudeMax: 0.6,
            altitudeMin: 0.1,
            humidityMax: 0.8,
            humidityMin: 0.4,
            temperatureMax: 30,
            temperatureMin: 10,
            faunaTypes: ["deer", "rabbit", "squirrel", "fox", "raccoon", "skunk"],
            faunaDensity: 0.5,
            vegetationTypes: ["oak tree", "maple tree", "birch tree", "elm tree", "hickory tree"],
            vegetationDensity: 0.7,
            waterFeatures: ["river", "stream", "pond"],
            waterFeatureDensity: 0.3,
            isAquatic: false
        },
        {
            name: "coniferous forest",
            altitudeMax: 0.9,
            altitudeMin: 0.1,
            humidityMax: 0.6,
            humidityMin: 0.2,
            temperatureMax: 25,
            temperatureMin: 0,
            faunaTypes: ["bear", "wolf", "moose", "lynx"],
            faunaDensity: 0.3,
            vegetationTypes: ["pine tree", "fir tree", "spruce tree", "cedar tree"],
            vegetationDensity: 0.8,
            waterFeatures: ["lake", "river", "stream"],
            waterFeatureDensity: 0.5,
            isAquatic: false
        },
        {
            name: "rainforest",
            altitudeMax: 0.7,
            altitudeMin: 0,
            humidityMax: 1,
            humidityMin: 0.8,
            temperatureMax: 30,
            temperatureMin: 20,
            faunaTypes: ["jaguar", "parrot"],
            faunaDensity: 0.8,
            vegetationTypes: ["palm", "bamboo"],
            vegetationDensity: 1,
            waterFeatures: ["river", "lake"],
            waterFeatureDensity: 0.7,
            isAquatic: false
        },
        {
            name: "desert",
            altitudeMax: 0.3,
            altitudeMin: 0,
            humidityMax: 0.3,
            humidityMin: 0.1,
            temperatureMax: 40,
            temperatureMin: 20,
            faunaTypes: ["camel", "scorpion", "vulture", "coyote"],
            faunaDensity: 0.2,
            vegetationTypes: ["cactus", "acacia tree"],
            vegetationDensity: 0.1,
            waterFeatures: ["oasis"],
            waterFeatureDensity: 0.1,
            isAquatic: false
        },
        {
            name: "grassland",
            altitudeMax: 0.6,
            altitudeMin: 0.1,
            humidityMax: 0.6,
            humidityMin: 0.2,
            temperatureMax: 30,
            temperatureMin: 15,
            faunaTypes: ["buffalo", "prairie dog", "antelope"],
            faunaDensity: 0.4,
            vegetationTypes: ["grass", "wildflower", "sagebrush", "yucca plant"],
            vegetationDensity: 0.6,
            waterFeatures: ["river"],
            waterFeatureDensity: 0.3,
            isAquatic: false
        },
        {
            name: "taiga",
            altitudeMax: 0.9,
            altitudeMin: 0.1,
            humidityMax: 0.6,
            humidityMin: 0.2,
            temperatureMax: 20,
            temperatureMin: -20,
            faunaTypes: ["moose", "bear", "wolf", "lynx"],
            faunaDensity: 0.3,
            vegetationTypes: ["spruce tree", "fir tree", "pine tree"],
            vegetationDensity: 0.7,
            waterFeatures: ["lake", "river", "stream"],
            waterFeatureDensity: 0.5,
            isAquatic: false
        },
        {
            name: "tundra",
            altitudeMax: 0.6,
            altitudeMin: 0,
            humidityMax: 0.6,
            humidityMin: 0,
            temperatureMax: 10,
            temperatureMin: -20,
            faunaTypes: ["polar bear", "arctic fox", "lemming"],
            faunaDensity: 0.2,
            vegetationTypes: ["moss", "lichens"],
            vegetationDensity: 0.3,
            waterFeatures: ["lake"],
            waterFeatureDensity: 0.5,
            isAquatic: false
        }
    ];
}

export function getByName(name: string): BiomeType {
    for (let type of getAll()) {
        if (type.name === name) {
            return type;
        }
    }

    throw new Error(`Biome type ${name} not found`);
}