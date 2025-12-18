export type CalendarEvent = {
  name: string;
  description: string;
  startDay: number;
  endDay: number;
};

export type CalendarMonth = {
  name: string;
  startDay: number;
  length: number;
};

export type CalendarYear = {
  months: CalendarMonth[];
  lengthInDays: number;
};

export type CalendarDay = {
  name: string;
  dayOfWeek: number;
};

export type CalendarDate = {
  year: number;
  month: CalendarMonth;
  dayOfMonth: number;
  dayOfYear: number;
  dayOfWeek: CalendarDay;
};

export type Calendar = {
  gregorianBaseDate: Date | null; // The starting date of the calendar system in the Gregorian calendar
  yearLengthInDays: number;
  dayLengthInHours: number;
  daysInWeek: number;
  daysOfWeek: CalendarDay[];
  monthsInYear: number;
  months: CalendarMonth[];
  events: CalendarEvent[];
};

export function getGregorianCalendar(): Calendar {
  return {
    gregorianBaseDate: new Date(0, 0, 0),
    yearLengthInDays: 365,
    dayLengthInHours: 24,
    daysInWeek: 7,
    daysOfWeek: [
      { name: "Sunday", dayOfWeek: 0 },
      { name: "Monday", dayOfWeek: 1 },
      { name: "Tuesday", dayOfWeek: 2 },
      { name: "Wednesday", dayOfWeek: 3 },
      { name: "Thursday", dayOfWeek: 4 },
      { name: "Friday", dayOfWeek: 5 },
      { name: "Saturday", dayOfWeek: 6 },
    ],
    monthsInYear: 12,
    months: [
      { name: "January", startDay: 1, length: 31 },
      { name: "February", startDay: 32, length: 28 },
      { name: "March", startDay: 60, length: 31 },
      { name: "April", startDay: 91, length: 30 },
      { name: "May", startDay: 121, length: 31 },
      { name: "June", startDay: 152, length: 30 },
      { name: "July", startDay: 182, length: 31 },
      { name: "August", startDay: 213, length: 31 },
      { name: "September", startDay: 244, length: 30 },
      { name: "October", startDay: 274, length: 31 },
      { name: "November", startDay: 305, length: 30 },
      { name: "December", startDay: 335, length: 31 },
    ],
    events: [],
  };
}

export function getDayOfWeek(
  calendar: Calendar,
  dayOfYear: number,
): CalendarDay {
  const dayIndex = (dayOfYear - 1) % calendar.daysOfWeek.length;
  return calendar.daysOfWeek[dayIndex];
}

export function getMonthForDay(
  calendar: Calendar,
  dayOfYear: number,
): CalendarMonth {
  if (dayOfYear < 1 || dayOfYear > calendar.yearLengthInDays) {
    throw new Error(
      `Day of year ${dayOfYear} is out of range for calendar year length ${calendar.yearLengthInDays}`,
    );
  }

  for (const month of calendar.months) {
    if (
      dayOfYear >= month.startDay &&
      dayOfYear < month.startDay + month.length
    ) {
      return month;
    }
  }

  throw new Error("Month not found");
}

export function getEventsForDay(
  calendar: Calendar,
  dayOfYear: number,
): CalendarEvent[] {
  return calendar.events.filter(
    (event) => dayOfYear >= event.startDay && dayOfYear <= event.endDay,
  );
}

export function convertGregorianDateToCalendarDate(
  gregorianDate: Date,
  calendar: Calendar,
): CalendarDate {
  if (calendar.gregorianBaseDate === null) {
    throw new Error("Calendar does not have a Gregorian base date set.");
  }

  const timeDiff =
    gregorianDate.getTime() - calendar.gregorianBaseDate.getTime();
  const daysSinceBase = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const dayOfYear = (daysSinceBase % calendar.yearLengthInDays) + 1;

  const month = getMonthForDay(calendar, dayOfYear);
  const dayOfMonth = dayOfYear - month.startDay + 1;
  const dayOfWeek = getDayOfWeek(calendar, dayOfYear);

  return {
    year: Math.floor(daysSinceBase / calendar.yearLengthInDays),
    month: month,
    dayOfMonth: dayOfMonth,
    dayOfYear: dayOfYear,
    dayOfWeek: dayOfWeek,
  };
}
