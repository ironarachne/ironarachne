import type { Calendar, CalendarDate } from '$lib/calendar';
import { getDayOfWeek, getMonthForDay } from '$lib/calendar';

/** A point in fictional calendar time: year, day, and time-of-day in hours. */
export type SimulationInstant = {
  /** Zero-based year index from an arbitrary epoch. */
  yearIndex: number;
  /** 1-based day of year, aligned with {@link Calendar.yearLengthInDays}. */
  dayOfYear: number;
  /** Hours elapsed since the start of {@link dayOfYear}, in `[0, calendar.dayLengthInHours)`. */
  hourOfDay: number;
};

function assertCalendarSane(calendar: Calendar): void {
  if (calendar.yearLengthInDays < 1 || !Number.isInteger(calendar.yearLengthInDays)) {
    throw new Error('Calendar yearLengthInDays must be a positive integer.');
  }
  if (calendar.dayLengthInHours <= 0 || !Number.isFinite(calendar.dayLengthInHours)) {
    throw new Error('Calendar dayLengthInHours must be finite and positive.');
  }
}

/**
 * Total hours in one calendar year for this calendar (dayLengthInHours × year length).
 */
export function hoursPerCalendarYear(calendar: Calendar): number {
  return calendar.yearLengthInDays * calendar.dayLengthInHours;
}

/**
 * Convert instant to total hours from (yearIndex=0, day=1, hour=0).
 */
export function simulationInstantToHoursSinceEra(
  calendar: Calendar,
  instant: SimulationInstant,
): number {
  assertCalendarSane(calendar);
  const { yearIndex, dayOfYear, hourOfDay } = instant;
  if (!Number.isFinite(yearIndex) || yearIndex < 0) {
    throw new Error('yearIndex must be a non-negative finite number.');
  }
  const y = hoursPerCalendarYear(calendar);
  return yearIndex * y + (dayOfYear - 1) * calendar.dayLengthInHours + hourOfDay;
}

/**
 * Build an instant from non-negative hours since era start (day 1 hour 0 of year 0).
 */
export function simulationInstantFromHoursSinceEra(
  calendar: Calendar,
  hoursSinceEra: number,
): SimulationInstant {
  assertCalendarSane(calendar);
  if (!Number.isFinite(hoursSinceEra) || hoursSinceEra < 0) {
    throw new Error('hoursSinceEra must be finite and non-negative.');
  }
  const y = hoursPerCalendarYear(calendar);
  const yearIndex = Math.floor(hoursSinceEra / y);
  const remainder = hoursSinceEra - yearIndex * y;
  const wholeDays = Math.floor(remainder / calendar.dayLengthInHours);
  const hourOfDay = remainder - wholeDays * calendar.dayLengthInHours;
  const dayOfYear = wholeDays + 1;
  return {
    yearIndex,
    dayOfYear,
    hourOfDay,
  };
}

/**
 * Clamp and carry hour/day/year overflow so fields stay within calendar bounds.
 */
export function normalizeSimulationInstant(
  calendar: Calendar,
  instant: SimulationInstant,
): SimulationInstant {
  assertCalendarSane(calendar);
  return simulationInstantFromHoursSinceEra(
    calendar,
    simulationInstantToHoursSinceEra(calendar, instant),
  );
}

export function compareSimulationInstants(a: SimulationInstant, b: SimulationInstant): number {
  const ak = a.yearIndex;
  const bk = b.yearIndex;
  if (ak !== bk) return ak < bk ? -1 : 1;
  if (a.dayOfYear !== b.dayOfYear) return a.dayOfYear < b.dayOfYear ? -1 : 1;
  if (a.hourOfDay !== b.hourOfDay) return a.hourOfDay < b.hourOfDay ? -1 : 1;
  return 0;
}

export function addHoursToSimulationInstant(
  calendar: Calendar,
  instant: SimulationInstant,
  hours: number,
): SimulationInstant {
  assertCalendarSane(calendar);
  if (!Number.isFinite(hours)) throw new Error('hours must be finite.');
  const base = simulationInstantToHoursSinceEra(calendar, instant);
  const next = base + hours;
  if (next < 0) {
    throw new Error('addHoursToSimulationInstant: result before era start.');
  }
  return simulationInstantFromHoursSinceEra(calendar, next);
}

/**
 * Fraction of the current calendar year in `[0, 1)`: wraps at year boundary.
 */
export function fractionOfYear(calendar: Calendar, instant: SimulationInstant): number {
  assertCalendarSane(calendar);
  const h = hoursPerCalendarYear(calendar);
  const t = simulationInstantToHoursSinceEra(
    calendar,
    normalizeSimulationInstant(calendar, instant),
  );
  const mod = t % h;
  return mod / h;
}

/**
 * Map to {@link CalendarDate} (same `year` field as `yearIndex` for simulation).
 */
export function simulationInstantToCalendarDate(
  calendar: Calendar,
  instant: SimulationInstant,
): CalendarDate {
  assertCalendarSane(calendar);
  const instantNorm = normalizeSimulationInstant(calendar, instant);
  const { yearIndex, dayOfYear } = instantNorm;
  if (dayOfYear < 1 || dayOfYear > calendar.yearLengthInDays || !Number.isInteger(dayOfYear)) {
    throw new Error(`dayOfYear ${dayOfYear} out of range for calendar.`);
  }
  const month = getMonthForDay(calendar, dayOfYear);
  const dayOfMonth = dayOfYear - month.startDay + 1;
  return {
    year: yearIndex,
    month,
    dayOfMonth,
    dayOfYear,
    dayOfWeek: getDayOfWeek(calendar, dayOfYear),
  };
}

/**
 * Build a simulation instant from an existing calendar date and hour of day.
 */
export function calendarDateHourToSimulationInstant(
  calendar: Calendar,
  date: CalendarDate,
  hourOfDay: number,
): SimulationInstant {
  assertCalendarSane(calendar);
  if (
    date.dayOfYear < 1 ||
    date.dayOfYear > calendar.yearLengthInDays ||
    !Number.isInteger(date.dayOfYear)
  ) {
    throw new Error('CalendarDate dayOfYear is out of range.');
  }
  if (hourOfDay < 0 || hourOfDay >= calendar.dayLengthInHours) {
    throw new Error(`hourOfDay must be in [0, ${calendar.dayLengthInHours}), got ${hourOfDay}`);
  }
  return normalizeSimulationInstant(calendar, {
    yearIndex: date.year,
    dayOfYear: date.dayOfYear,
    hourOfDay,
  });
}
