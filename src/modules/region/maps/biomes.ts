'use strict';

export function getElevationFunctionForBiome(biomeName: string): (number) => number {
  if (biomeName == 'desert') {
    return (elevation: number) => { return (0.1 + (elevation * 0.6)); };
  } else if (biomeName == 'mountain') {
    return (elevation: number) => { return elevation * 1.5; };
  } else if (biomeName == 'grassland') {
    return (elevation: number) => { return (0.3 + (elevation * 0.4)); };
  }

  return (elevation: number) => { return elevation; };
}

export function getHumidityFunctionForBiome(biomeName: string): (number) => number {
  if (biomeName == 'desert') {
    return (humidity: number) => { return humidity * 0.2; };
  } else if (biomeName == 'rainforest') {
    return (humidity: number) => { return 0.2 + (humidity * 1.5); };
  } else if (biomeName == 'grassland') {
    return (humidity: number) => { return (0.2 + (humidity * 0.4)); };
  } else if (biomeName == 'deciduous forest' || biomeName == 'coniferous forest') {
    return (humidity: number) => { return (0.4 + (humidity * 0.4)); };
  }

  return (humidity: number) => { return humidity; };
}

export function getTemperatureFunctionForBiome(biomeName: string): (number) => number {
  if (biomeName == 'desert') {
    return (temperature: number) => { return temperature * 1.5; };
  } else if (biomeName == 'tundra') {
    return (temperature: number) => { return temperature * 0.2; };
  } else if (biomeName == 'rainforest') {
    return (temperature: number) => { return temperature * 1.5; };
  } else if (biomeName == 'grassland') {
    return (temperature: number) => { return (0.2 + (temperature * 0.8)); };
  }

  return (temperature: number) => { return temperature; };
}
