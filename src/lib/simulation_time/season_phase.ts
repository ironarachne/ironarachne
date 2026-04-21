import type { Calendar } from '$lib/calendar';
import type { SimulationInstant } from './simulation_instant';
import { fractionOfYear, normalizeSimulationInstant } from './simulation_instant';

/**
 * Orbital parameters that influence how "season" varies over the year.
 * Values are Earth-inspired but year length comes from {@link Calendar.yearLengthInDays}.
 */
export type OrbitalSeasonParams = {
  /** Degrees; retained for future insolation models (no effect on basic phase). */
  axialTiltDegrees: number;
  /** `[0, 1)` — circular orbit at 0; adds a small thermal-season offset vs astronomical phase. */
  orbitalEccentricity: number;
  /** Day of year `[1, yearLength]` for perihelion (closest approach to the sun). */
  perihelionDayOfYear: number;
};

export function defaultOrbitalSeasonParams(calendar: Calendar): OrbitalSeasonParams {
  return {
    axialTiltDegrees: 23.44,
    orbitalEccentricity: 0.0167,
    perihelionDayOfYear: Math.min(3, calendar.yearLengthInDays),
  };
}

/**
 * Map perihelion day to a fractional position in `[0, 1)` on the calendar year.
 */
function perihelionPhase01(calendar: Calendar, params: OrbitalSeasonParams): number {
  const n = calendar.yearLengthInDays;
  const p = Math.max(1, Math.min(n, Math.floor(params.perihelionDayOfYear)));
  return (p - 1) / n;
}

/**
 * Season phase in `[0, 1)` — primarily the fractional year. With eccentricity, applies a tiny
 * offset so thermal season is not identical to astronomical mean longitude (optional hook).
 */
export function seasonPhase01(
  calendar: Calendar,
  instant: SimulationInstant,
  params: OrbitalSeasonParams,
): number {
  const inst = normalizeSimulationInstant(calendar, instant);
  const base = fractionOfYear(calendar, inst);
  const e = Math.max(0, Math.min(0.99, params.orbitalEccentricity));
  const peri = perihelionPhase01(calendar, params);
  // Simple: shift phase slightly toward perihelion "hotter" — scaled so max offset ~0.03
  const offset = e * 0.15 * Math.sin(2 * Math.PI * ((base - peri + 1) % 1));
  return (base + offset + 1) % 1;
}
