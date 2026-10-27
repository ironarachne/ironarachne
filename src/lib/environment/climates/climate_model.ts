import type { Season } from './climate_types';

/**
 * The one coarse temperature model shared by `$lib/environment` and `$lib/map`.
 *
 * It is deliberately simple: one equator baseline, one latitude gradient, one elevation lapse,
 * one seasonal amplitude and one bounded local term. It is not a weather simulator, and it does
 * not claim to reproduce Earth's climate. The fixtures in this library pin these constants; tune
 * them there, never against a particular seed.
 */

/** Normalized elevation at sea level. Map nodes and environment terrain share this scale. */
export const SEA_LEVEL_ELEVATION = -0.1;

/** The elevation at which `mapHeight` reaches 1. Map peaks may exceed it and are clamped. */
export const MAX_GROUND_ELEVATION = 2.0;

/** Sea-level annual mean on the equator, in Celsius. */
export const EQUATOR_ANNUAL_MEAN_C = 30;

/** Total sea-level cooling from the equator to a pole, in Celsius. */
export const LATITUDE_LAPSE_C = 40;

/** Ground height that `mapHeight` maps to 1. */
export const MAX_TERRAIN_HEIGHT_KM = 3.0;

/** Temperature lost per kilometre of normalized ground height. */
export const LAPSE_RATE_C_PER_KM = 6.5;

/** Minimum seasonal half-range at the equator, in Celsius. */
export const SEASONAL_AMPLITUDE_BASE_C = 1;

/** Additional seasonal half-range from the equator to a pole, in Celsius. */
export const SEASONAL_AMPLITUDE_RANGE_C = 17;

/** Bound on the map's seeded local temperature term, in Celsius. */
export const LOCAL_VARIATION_C = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** A local annual mean for a signed latitude and a normalized ground height in `[0, 1]`. */
export function annualMeanAt(latitude: number, height: number): number {
  const degrees = Math.abs(clamp(latitude, -90, 90));
  return (
    EQUATOR_ANNUAL_MEAN_C -
    LATITUDE_LAPSE_C * (degrees / 90) -
    LAPSE_RATE_C_PER_KM * MAX_TERRAIN_HEIGHT_KM * clamp(height, 0, 1)
  );
}

/** The seasonal half-range at a signed latitude: the coldest and warmest month sit this far out. */
export function seasonalAmplitudeAt(latitude: number): number {
  return (
    SEASONAL_AMPLITUDE_BASE_C +
    SEASONAL_AMPLITUDE_RANGE_C * (Math.abs(clamp(latitude, -90, 90)) / 90)
  );
}

/**
 * Convert either generator's elevation band to normalized ground height.
 *
 * The map's elevation scale is the same `0…1` band as the environment's, but it can go higher
 * (up to 2.0 for a high mountain range). Above `MAX_GROUND_ELEVATION` the height is clamped.
 */
export function mapHeight(elevation: number): number {
  return clamp(
    (elevation - SEA_LEVEL_ELEVATION) / (MAX_GROUND_ELEVATION - SEA_LEVEL_ELEVATION),
    0,
    1,
  );
}

function shiftDay(day: number): number {
  return ((day - 1 + 182) % 365) + 1;
}

function season(
  name: string,
  startDay: number,
  endDay: number,
  temperatureAdjustment: number,
  humidityAdjustment: number,
  southern: boolean,
): Season {
  return {
    name,
    startDay: southern ? shiftDay(startDay) : startDay,
    endDay: southern ? shiftDay(endDay) : endDay,
    temperatureAdjustment,
    humidityAdjustment,
  };
}

/**
 * The season calendar for a signed latitude. Adjustments are Celsius departures from the annual
 * mean; their extremes are the climate half-range (`seasonExtremeAmplitude`).
 *
 * Southern latitudes receive the same names with their day ranges shifted half a year. The
 * calendar is 365 days and does not model leap years.
 */
export function seasonCalendar(latitude: number): Season[] {
  const amplitude = seasonalAmplitudeAt(latitude);
  const southern = latitude < 0;

  if (Math.abs(latitude) < 23.5) {
    return [
      season('dry', 200, 50, amplitude / 2, 0, southern),
      season('wet', 51, 199, -amplitude / 2, 0.2, southern),
    ];
  }

  return [
    season('spring', 91, 181, 0, 0.1, southern),
    season('summer', 182, 272, amplitude, 0.1, southern),
    season('autumn', 273, 363, 0, 0, southern),
    season('winter', 364, 90, -amplitude, -0.1, southern),
  ];
}

/**
 * The half-range actually used by the season calendar at a latitude.
 *
 * Four-season climates use the full `seasonalAmplitudeAt`; tropical two-season climates use half
 * of it in each direction. The regional summary and the standalone climate use this value so
 * their min/max always match the extreme season departures.
 */
export function seasonExtremeAmplitude(latitude: number): number {
  return Math.max(
    ...seasonCalendar(latitude).map((season) => Math.abs(season.temperatureAdjustment)),
  );
}
