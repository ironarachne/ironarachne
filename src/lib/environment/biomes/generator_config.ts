import type { RNG } from "@ironarachne/rng";

export default interface BiomeGeneratorConfig {
  altitude: number;
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  isAquatic: boolean;
  rng: RNG;
}
