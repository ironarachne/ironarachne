import type Climate from "./climate.js";
import ContinentalClimate from "./continental.js";
import DryClimate from "./dry.js";
import PolarClimate from "./polar.js";
import TemperateClimate from "./temperate.js";
import TropicalClimate from "./tropical.js";

export function all(): Climate[] {
  return [
    TropicalClimate,
    DryClimate,
    TemperateClimate,
    ContinentalClimate,
    PolarClimate,
  ];
}

export function describe(climate: Climate): string {
  let description = `The climate here is ${climate.name}, with ${climate.seasons.length} seasons.`;

  return description;
}
