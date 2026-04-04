import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGregorianCalendar,
  getDayOfWeek,
  getMonthForDay,
  getEventsForDay,
  convertGregorianDateToCalendarDate,
} from '../index';
import type { Calendar } from '../index';

describe('Calendar utilities', () => {
  let calendar: Calendar;

  beforeEach(() => {
    calendar = getGregorianCalendar();
  });

  describe('getGregorianCalendar', () => {
    it('returns a valid Gregorian calendar object', () => {
      expect(calendar.yearLengthInDays).toBe(365);
      expect(calendar.dayLengthInHours).toBe(24);
      expect(calendar.daysOfWeek.length).toBe(7);
      expect(calendar.months.length).toBe(12);
    });
  });

  describe('getDayOfWeek', () => {
    it('returns correct day for dayOfYear', () => {
      expect(getDayOfWeek(calendar, 1).name).toBe('Sunday');
      expect(getDayOfWeek(calendar, 2).name).toBe('Monday');
      expect(getDayOfWeek(calendar, 7).name).toBe('Saturday');
      expect(getDayOfWeek(calendar, 8).name).toBe('Sunday');
    });
  });

  describe('getMonthForDay', () => {
    it('returns correct month for dayOfYear', () => {
      expect(getMonthForDay(calendar, 1).name).toBe('January');
      expect(getMonthForDay(calendar, 32).name).toBe('February');
      expect(getMonthForDay(calendar, 60).name).toBe('March');
      expect(getMonthForDay(calendar, 335).name).toBe('December');
    });
    it('throws error for out-of-range day', () => {
      expect(() => getMonthForDay(calendar, 0)).toThrow();
      expect(() => getMonthForDay(calendar, 366)).toThrow();
    });
  });

  describe('getEventsForDay', () => {
    it('returns events for a given day', () => {
      calendar.events = [
        { name: 'Test Event', description: 'desc', startDay: 10, endDay: 12 },
        { name: 'Other Event', description: 'desc', startDay: 12, endDay: 15 },
      ];
      expect(getEventsForDay(calendar, 11).length).toBe(1);
      expect(getEventsForDay(calendar, 12).length).toBe(2);
      expect(getEventsForDay(calendar, 16).length).toBe(0);
    });
  });

  describe('convertGregorianDateToCalendarDate', () => {
    it('converts a Gregorian date to calendar date', () => {
      // Gregorian base date is 0/0/0, so 1/1/1970 is 719528 days after base
      const base = new Date(0, 0, 0);
      const testDate = new Date(1970, 0, 1);
      const calDate = convertGregorianDateToCalendarDate(testDate, calendar);
      expect(calDate.dayOfYear).toBeGreaterThanOrEqual(1);
      expect(calDate.dayOfYear).toBeLessThanOrEqual(365);
      expect(calDate.month).toBeDefined();
      expect(calDate.dayOfMonth).toBeGreaterThanOrEqual(1);
      expect(calDate.dayOfWeek).toBeDefined();
    });
    it('throws if calendar has no base date', () => {
      calendar.gregorianBaseDate = null;
      expect(() => convertGregorianDateToCalendarDate(new Date(), calendar)).toThrow();
    });
  });
});
