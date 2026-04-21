import { cToF, fToC } from '$lib/measurements';

/**
 * Canonical internal units for derived weather feel: temperature °C, distance m, speed m/s.
 * Generic unit conversions live in `$lib/measurements`.
 */

/**
 * Dew point (°C) from air temperature (°C) and relative humidity `[0, 1]` — Magnus approximation.
 */
export function dewPointCelsius(tempC: number, relativeHumidity01: number): number {
  const rh = Math.min(1, Math.max(0.0001, relativeHumidity01));
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(rh);
  return (b * alpha) / (a - alpha);
}

/**
 * NWS-style wind chill for °C and m/s (valid roughly for temps ≤ 10°C and wind ≥ 1.3 m/s).
 * Returns perceived temperature °C.
 */
export function windChillCelsius(tempC: number, windSpeedMs: number): number {
  if (tempC > 10 || windSpeedMs < 1.34) return tempC;
  const kmh = windSpeedMs * 3.6;
  const tF = cToF(tempC);
  const v = kmh;
  if (tF > 50 || v < 5) return tempC;
  const wcF = 35.74 + 0.6215 * tF - 35.75 * Math.pow(v, 0.16) + 0.4275 * tF * Math.pow(v, 0.16);
  return fToC(wcF);
}

/**
 * Heat index–style felt temperature (°C). Rough polynomial fit for warm conditions; weak outside hot/humid band.
 */
export function heatIndexCelsius(tempC: number, relativeHumidity01: number): number {
  if (tempC < 27) return tempC;
  const rh = Math.min(100, Math.max(0, relativeHumidity01 * 100));
  const tF = cToF(tempC);
  const hiF =
    -8.78469475556 +
    1.61139411 * tF +
    2.33854883889 * rh +
    -0.14611605 * tF * rh +
    -0.012308094 * tF * tF +
    -0.0164248277778 * rh * rh +
    0.002211732 * tF * tF * rh +
    0.00072546 * tF * rh * rh +
    -0.000003582 * tF * tF * rh * rh;
  return fToC(hiF);
}

/**
 * ISA-style lapse: temperature drop (°C) for dry air over `deltaAltitudeM` meters (positive upward).
 */
export function dryAdiabaticLapseDeltaC(deltaAltitudeM: number): number {
  return (-9.8 * deltaAltitudeM) / 1000;
}

/**
 * Simple visibility (km) heuristic from RH and precipitation rate (mm/h).
 */
export function visibilityKmFromHumidityAndPrecip(
  relativeHumidity01: number,
  precipMmPerHour: number,
): number {
  const rh = Math.min(1, Math.max(0, relativeHumidity01));
  const base = 15 * (1 - rh * 0.6);
  const wet = Math.max(0.2, base - precipMmPerHour * 2);
  return Math.max(0.05, wet);
}
