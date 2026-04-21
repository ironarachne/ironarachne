import { describe, expect, it } from 'vitest';
import { buildCalendarFromMonthLengths, getGregorianCalendar, validateCalendar } from '../index';

describe('validateCalendar', () => {
  it('accepts default Gregorian factory', () => {
    expect(validateCalendar(getGregorianCalendar())).toEqual([]);
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
});
