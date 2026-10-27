import type { RNG } from '@ironarachne/rng';

export type Season = {
  name: string;
  startDay: number; // 1-365
  endDay: number; // 1-365
  /** Celsius departure from the annual mean for this season. */
  temperatureAdjustment: number;
  humidityAdjustment: number;
};

export type ClimateType = {
  name: string;
  precipitationMax: number;
  precipitationMin: number;
  temperatureMax: number;
  temperatureMin: number;
  humidityMax: number;
  humidityMin: number;
  latitudeMin: number;
  latitudeMax: number;
};

/**
 * The regional temperature summary, derived from the realized dry-land map.
 *
 * It is generation-time data and is never written into an artifact. The persisted form is the
 * three temperature fields and the season list on `Climate`.
 */
export type RegionalTemperatureSummary = {
  /** Mean of the dry-land node annual means. */
  annualMean: number;
  /** `annualMean` minus the season extreme at `referenceLatitude`. */
  coldestMonth: number;
  /** `annualMean` plus the season extreme at `referenceLatitude`. */
  warmestMonth: number;
  referenceLatitude: number;
  /** Median normalized height of dry-land nodes. */
  referenceHeight: number;
  seasons: Season[];
};

/**
 * A local temperature sample for one map node.
 *
 * `annualMean` is the node's stored annual mean; the seasonal extremes apply the saved season
 * departures. It is derived on demand and is never persisted separately from the node and climate.
 */
export type SiteTemperature = {
  annualMean: number;
  coldestMonth: number;
  warmestMonth: number;
  coldestSeason: string;
  warmestSeason: string;
};

/** A distribution of dry-land annual means; used for spatial claims, never persisted. */
export type SpatialTemperatureEnvelope = {
  meanAnnual: number;
  coldestNodeId: number;
  coldestAnnual: number;
  warmestNodeId: number;
  warmestAnnual: number;
  p10Annual: number;
  p90Annual: number;
};

export type ClimateGeneratorConfig = {
  elevation: number; // 0…1 altitude band; -0.1 is sea level, 2 is the top of the map scale
  latitude: number; // -90-90, 0 being the equator, -90 being the south pole, 90 being the north pole
  longitude: number; // -180-180, 0 being the prime meridian, -180 being the international date line
  waterDirection: number[]; // vector representing the direction and distance to the nearest water
  current: number[]; // vector representing the direction of the water current
  terrainNormalVector: number[]; // the "tilt" of the terrain plane
  rng: RNG;
};

export type Climate = {
  name: string;
  description: string;
  cloudCover: number; // 0-1, 0 being no clouds, 1 being completely overcast
  wind: number[]; // the wind direction and strength as a 3D vector; [0, 0, 0] is no wind
  /** The annual mean temperature in celsius. */
  temperature: number;
  /** The coldest month's mean temperature in celsius. */
  temperatureMin: number;
  /** The warmest month's mean temperature in celsius. */
  temperatureMax: number;
  precipitationAmount: number; // 0-1, 0 being no precipitation, 1 being the maximum possible precipitation
  precipitationFrequency: number; // 0-1, 0 being no precipitation, 1 being constant precipitation
  humidity: number; // 0-1, 0 being no humidity, 1 being maximum humidity
  seasons: Season[];
};
