import type { Calendar, CalendarDay, CalendarEvent } from './index';
import { assertValidCalendar } from './validate_calendar';

export type BuildCalendarFromMonthLengthsConfig = {
  /** If set, must equal the sum of month lengths. */
  yearLengthInDays?: number;
  dayLengthInHours: number;
  daysInWeek: number;
  /** Names in calendar order; length must match `monthLengths`. */
  monthNames: string[];
  monthLengths: number[];
  /** Names in week order (one full cycle). */
  weekdayNames: string[];
  gregorianBaseDate: Date | null;
  events?: CalendarEvent[];
};

/**
 * Construct a valid {@link Calendar} from parallel month names and lengths (no hand-edited startDay).
 */
export function buildCalendarFromMonthLengths(
  config: BuildCalendarFromMonthLengthsConfig,
): Calendar {
  const {
    dayLengthInHours,
    daysInWeek,
    monthNames,
    monthLengths,
    weekdayNames,
    gregorianBaseDate,
    events = [],
  } = config;

  if (monthNames.length !== monthLengths.length) {
    throw new Error('monthNames and monthLengths must have the same length.');
  }
  if (monthNames.length < 1) {
    throw new Error('At least one month is required.');
  }
  if (weekdayNames.length !== daysInWeek) {
    throw new Error('weekdayNames length must equal daysInWeek.');
  }

  let startDay = 1;
  const months = monthNames.map((name, i) => {
    const length = monthLengths[i];
    if (!Number.isInteger(length) || length < 1) {
      throw new Error(`monthLengths[${i}] must be a positive integer.`);
    }
    const month = { name, startDay, length };
    startDay += length;
    return month;
  });

  const computedYearLength = startDay - 1;
  if (config.yearLengthInDays !== undefined && config.yearLengthInDays !== computedYearLength) {
    throw new Error(
      `yearLengthInDays ${config.yearLengthInDays} does not match sum of months (${computedYearLength}).`,
    );
  }

  const daysOfWeek: CalendarDay[] = weekdayNames.map((name, dayOfWeek) => ({
    name,
    dayOfWeek,
  }));

  const calendar: Calendar = {
    gregorianBaseDate,
    yearLengthInDays: computedYearLength,
    dayLengthInHours,
    daysInWeek,
    daysOfWeek,
    monthsInYear: months.length,
    months,
    events,
  };

  assertValidCalendar(calendar);
  return calendar;
}

/**
 * Calendar with no real-world anchor — useful for purely fictional timelines.
 */
export function buildFictionalCalendarFromMonthLengths(
  config: Omit<BuildCalendarFromMonthLengthsConfig, 'gregorianBaseDate'>,
): Calendar {
  return buildCalendarFromMonthLengths({ ...config, gregorianBaseDate: null });
}
