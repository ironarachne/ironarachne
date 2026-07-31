import { describe, expect, it } from 'vitest';
import {
  assertValidCalendar,
  buildCalendarFromMonthLengths,
  buildFictionalCalendarFromMonthLengths,
  getGregorianCalendar,
  validateCalendar,
} from '../index';
import type { Calendar } from '../index';

/** A minimal valid calendar: two months of five days, a two-day week. */
function makeCalendar(overrides: Partial<Calendar> = {}): Calendar {
  return {
    gregorianBaseDate: null,
    yearLengthInDays: 10,
    dayLengthInHours: 24,
    daysInWeek: 2,
    daysOfWeek: [
      { name: 'first', dayOfWeek: 0 },
      { name: 'second', dayOfWeek: 1 },
    ],
    monthsInYear: 2,
    months: [
      { name: 'early', startDay: 1, length: 5 },
      { name: 'late', startDay: 6, length: 5 },
    ],
    events: [],
    ...overrides,
  };
}

describe('validateCalendar', () => {
  it('accepts default Gregorian factory', () => {
    expect(validateCalendar(getGregorianCalendar())).toEqual([]);
  });

  it('accepts the minimal fixture', () => {
    expect(validateCalendar(makeCalendar())).toEqual([]);
  });

  it('reports gap in month chain', () => {
    const cal = getGregorianCalendar();
    const broken = {
      ...cal,
      months: cal.months.map((m, i) => (i === 0 ? { ...m, length: 30 } : m)),
    };
    const issues = validateCalendar(broken);
    expect(issues.some((i) => i.path.includes('months[1]'))).toBe(true);
  });

  it.each([
    ['yearLengthInDays', { yearLengthInDays: 0 }],
    ['yearLengthInDays', { yearLengthInDays: 1.5 }],
    ['dayLengthInHours', { dayLengthInHours: 0 }],
    ['dayLengthInHours', { dayLengthInHours: Number.POSITIVE_INFINITY }],
    ['daysInWeek', { daysInWeek: 0 }],
    ['monthsInYear', { monthsInYear: 0 }],
  ])('rejects a bad %s', (path, override) => {
    const issues = validateCalendar(makeCalendar(override as Partial<Calendar>));

    expect(issues.some((issue) => issue.path === path)).toBe(true);
  });

  it('rejects a weekday list that disagrees with daysInWeek', () => {
    const issues = validateCalendar(makeCalendar({ daysInWeek: 3 }));

    expect(issues.some((issue) => issue.path === 'daysOfWeek')).toBe(true);
  });

  it('rejects a month list that disagrees with monthsInYear', () => {
    const issues = validateCalendar(makeCalendar({ monthsInYear: 5 }));

    expect(issues.some((issue) => issue.path === 'months')).toBe(true);
  });

  it('rejects a first month that does not start on day 1', () => {
    const calendar = makeCalendar();
    calendar.months = [
      { name: 'early', startDay: 2, length: 5 },
      { name: 'late', startDay: 7, length: 5 },
    ];

    const issues = validateCalendar(calendar);

    expect(issues.some((issue) => issue.path === 'months[0].startDay')).toBe(true);
  });

  it('rejects a non-positive month startDay', () => {
    const calendar = makeCalendar();
    calendar.months = [
      { name: 'early', startDay: 1, length: 5 },
      { name: 'late', startDay: 0, length: 5 },
    ];

    const issues = validateCalendar(calendar);

    expect(issues.some((issue) => issue.path === 'months[1].startDay')).toBe(true);
  });

  it('rejects a non-positive month length', () => {
    const calendar = makeCalendar();
    calendar.months = [
      { name: 'early', startDay: 1, length: 0 },
      { name: 'late', startDay: 6, length: 5 },
    ];

    const issues = validateCalendar(calendar);

    expect(issues.some((issue) => issue.path === 'months[0].length')).toBe(true);
  });

  it('rejects months that do not cover the year length', () => {
    const issues = validateCalendar(makeCalendar({ yearLengthInDays: 99 }));

    expect(
      issues.some(
        (issue) => issue.path === 'months' && issue.message.includes('Months cover 10 days'),
      ),
    ).toBe(true);
  });

  it('skips the month checks entirely when there are no months', () => {
    const issues = validateCalendar(makeCalendar({ months: [], monthsInYear: 0 }));

    expect(issues.every((issue) => !issue.path.startsWith('months['))).toBe(true);
  });

  it('rejects an event starting outside the year', () => {
    const issues = validateCalendar(
      makeCalendar({ events: [{ name: 'x', description: '', startDay: 0, endDay: 1 }] }),
    );

    expect(issues.some((issue) => issue.path === 'events[0].startDay')).toBe(true);
  });

  it('rejects an event ending outside the year', () => {
    const issues = validateCalendar(
      makeCalendar({ events: [{ name: 'x', description: '', startDay: 1, endDay: 99 }] }),
    );

    expect(issues.some((issue) => issue.path === 'events[0].endDay')).toBe(true);
  });

  it('rejects an event that ends before it starts', () => {
    const issues = validateCalendar(
      makeCalendar({ events: [{ name: 'x', description: '', startDay: 5, endDay: 3 }] }),
    );

    expect(issues.some((issue) => issue.path === 'events[0]')).toBe(true);
  });

  it('accepts a single-day event inside the year', () => {
    expect(
      validateCalendar(
        makeCalendar({ events: [{ name: 'x', description: '', startDay: 3, endDay: 3 }] }),
      ),
    ).toEqual([]);
  });

  it('collects several issues at once', () => {
    const issues = validateCalendar(makeCalendar({ daysInWeek: 0, monthsInYear: 0 }));

    expect(issues.length).toBeGreaterThan(1);
  });
});

describe('assertValidCalendar', () => {
  it('passes a valid calendar', () => {
    expect(() => assertValidCalendar(makeCalendar())).not.toThrow();
  });

  it('throws listing the offending paths', () => {
    expect(() => assertValidCalendar(makeCalendar({ daysInWeek: 0 }))).toThrow(
      /Invalid calendar: .*daysInWeek/,
    );
  });
});

describe('buildCalendarFromMonthLengths', () => {
  it('builds a five-day week, variable months calendar', () => {
    const cal = buildCalendarFromMonthLengths({
      dayLengthInHours: 26,
      daysInWeek: 5,
      monthNames: ['A', 'B', 'C'],
      monthLengths: [10, 20, 370],
      weekdayNames: ['one', 'two', 'three', 'four', 'five'],
      gregorianBaseDate: null,
    });
    expect(cal.yearLengthInDays).toBe(400);
    expect(cal.months[2].startDay).toBe(31);
    expect(validateCalendar(cal)).toEqual([]);
  });

  it('accepts a matching explicit year length', () => {
    const cal = buildCalendarFromMonthLengths({
      yearLengthInDays: 30,
      dayLengthInHours: 24,
      daysInWeek: 1,
      monthNames: ['A', 'B'],
      monthLengths: [10, 20],
      weekdayNames: ['only'],
      gregorianBaseDate: null,
    });

    expect(cal.yearLengthInDays).toBe(30);
  });

  it('numbers the weekdays in order', () => {
    const cal = buildCalendarFromMonthLengths({
      dayLengthInHours: 24,
      daysInWeek: 3,
      monthNames: ['A'],
      monthLengths: [9],
      weekdayNames: ['one', 'two', 'three'],
      gregorianBaseDate: null,
    });

    expect(cal.daysOfWeek).toEqual([
      { name: 'one', dayOfWeek: 0 },
      { name: 'two', dayOfWeek: 1 },
      { name: 'three', dayOfWeek: 2 },
    ]);
  });

  it('carries events through', () => {
    const events = [{ name: 'feast', description: 'a feast', startDay: 2, endDay: 3 }];
    const cal = buildCalendarFromMonthLengths({
      dayLengthInHours: 24,
      daysInWeek: 1,
      monthNames: ['A'],
      monthLengths: [10],
      weekdayNames: ['only'],
      gregorianBaseDate: null,
      events,
    });

    expect(cal.events).toEqual(events);
  });

  it('keeps a Gregorian anchor when given one', () => {
    const base = new Date('2020-01-01T00:00:00Z');
    const cal = buildCalendarFromMonthLengths({
      dayLengthInHours: 24,
      daysInWeek: 1,
      monthNames: ['A'],
      monthLengths: [10],
      weekdayNames: ['only'],
      gregorianBaseDate: base,
    });

    expect(cal.gregorianBaseDate).toBe(base);
  });

  const valid = {
    dayLengthInHours: 24,
    daysInWeek: 1,
    monthNames: ['A'],
    monthLengths: [10],
    weekdayNames: ['only'],
    gregorianBaseDate: null,
  };

  it('throws when names and lengths disagree', () => {
    expect(() =>
      buildCalendarFromMonthLengths({ ...valid, monthNames: ['A', 'B'], monthLengths: [10] }),
    ).toThrow(/same length/);
  });

  it('throws when there are no months', () => {
    expect(() =>
      buildCalendarFromMonthLengths({ ...valid, monthNames: [], monthLengths: [] }),
    ).toThrow(/At least one month/);
  });

  it('throws when the weekday names do not match daysInWeek', () => {
    expect(() => buildCalendarFromMonthLengths({ ...valid, daysInWeek: 4 })).toThrow(
      /weekdayNames length/,
    );
  });

  it.each([[0], [-1], [2.5]])('throws for a month length of %s', (length) => {
    expect(() => buildCalendarFromMonthLengths({ ...valid, monthLengths: [length] })).toThrow(
      /must be a positive integer/,
    );
  });

  it('throws when the explicit year length disagrees with the months', () => {
    expect(() => buildCalendarFromMonthLengths({ ...valid, yearLengthInDays: 99 })).toThrow(
      /does not match sum of months/,
    );
  });
});

describe('buildFictionalCalendarFromMonthLengths', () => {
  const config = {
    dayLengthInHours: 20,
    daysInWeek: 2,
    monthNames: ['first', 'second'],
    monthLengths: [6, 6],
    weekdayNames: ['a', 'b'],
  };

  it('builds a calendar with no Gregorian anchor', () => {
    const cal = buildFictionalCalendarFromMonthLengths(config);

    expect(cal.gregorianBaseDate).toBeNull();
    expect(cal.yearLengthInDays).toBe(12);
    expect(validateCalendar(cal)).toEqual([]);
  });

  it('agrees with the anchored builder given a null anchor', () => {
    expect(buildFictionalCalendarFromMonthLengths(config)).toEqual(
      buildCalendarFromMonthLengths({ ...config, gregorianBaseDate: null }),
    );
  });
});
