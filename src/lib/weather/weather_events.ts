import type { Calendar } from '$lib/calendar';
import type { SimulationInstant } from '$lib/simulation_time';
import type { RNG } from '@ironarachne/rng';
import {
  addHoursToSimulationInstant,
  compareSimulationInstants,
  normalizeSimulationInstant,
} from '$lib/simulation_time';

export type WeatherEventKind = string;

/**
 * A weather interval in simulation time. End may lie beyond a calendar day (carryover).
 */
export type WeatherEvent = {
  kind: WeatherEventKind;
  start: SimulationInstant;
  end: SimulationInstant;
  /** Wind as 3D vector; m/s scale consistent with existing climate code. */
  windMs: [number, number, number];
  /** Representative air temperature (°C) during the event. */
  temperatureC: number;
  /** Horizontal visibility (meters). */
  visibilityM: number;
  /** Optional detail for severe phenomena. */
  storm?: StormGeometry;
};

export type StormGeometry = {
  diameterKm?: number;
  groundSpeedKmh?: number;
  headingDegrees?: number;
  funnelWidthM?: number;
};

export function compareWeatherEventsByStart(
  calendar: Calendar,
  a: WeatherEvent,
  b: WeatherEvent,
): number {
  return compareSimulationInstants(
    normalizeSimulationInstant(calendar, a.start),
    normalizeSimulationInstant(calendar, b.start),
  );
}

/** Events whose interval contains `instant` (start <= instant < end). */
export function getActiveWeatherEventsAt(
  calendar: Calendar,
  events: WeatherEvent[],
  instant: SimulationInstant,
): WeatherEvent[] {
  const t = normalizeSimulationInstant(calendar, instant);
  return events.filter((e) => {
    const s = compareSimulationInstants(normalizeSimulationInstant(calendar, e.start), t);
    const eCmp = compareSimulationInstants(t, normalizeSimulationInstant(calendar, e.end));
    return s <= 0 && eCmp < 0;
  });
}

export type FillWeatherEventsConfig = {
  calendar: Calendar;
  rangeStart: SimulationInstant;
  rangeEnd: SimulationInstant;
  rng: RNG;
  /** Minimum event length; avoids zero-length intervals. */
  minEventHours: number;
  /** Maximum event length in hours. */
  maxEventHours: number;
  /** Sample next event duration in hours (positive). */
  sampleEventKind: (rng: RNG) => WeatherEventKind;
  /** Rough air temperature for the span (°C); hooks for biome-specific logic later. */
  baselineTemperatureC: number;
};

/**
 * Tile `[rangeStart, …)` with consecutive non-overlapping events until no new event may start
 * before `rangeEnd`. The last event may end after `rangeEnd` (carryover across boundary).
 */
export function fillTimelineWithSequentialWeatherEvents(
  config: FillWeatherEventsConfig,
): WeatherEvent[] {
  const {
    calendar,
    rangeStart,
    rangeEnd,
    rng,
    minEventHours,
    maxEventHours,
    sampleEventKind,
    baselineTemperatureC,
  } = config;

  if (minEventHours <= 0 || maxEventHours < minEventHours) {
    throw new Error('Invalid min/max event hours.');
  }
  if (compareSimulationInstants(rangeStart, rangeEnd) >= 0) {
    throw new Error('rangeStart must be before rangeEnd.');
  }

  const events: WeatherEvent[] = [];
  let start = normalizeSimulationInstant(calendar, rangeStart);
  const endBound = normalizeSimulationInstant(calendar, rangeEnd);

  while (compareSimulationInstants(start, endBound) < 0) {
    const span = rng.float(minEventHours, maxEventHours);
    const end = addHoursToSimulationInstant(calendar, start, span);
    const kind = sampleEventKind(rng);
    events.push({
      kind,
      start,
      end,
      windMs: [rng.float(-1, 1), rng.float(-1, 1), 0],
      temperatureC: baselineTemperatureC + rng.bellFloat(-4, 4),
      visibilityM: Math.max(50, rng.float(500, 20_000)),
    });
    start = end;
  }

  return events;
}
