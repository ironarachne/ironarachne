import { describe, expect, it } from 'vitest';
import { getGregorianCalendar } from '$lib/calendar';
import {
  addHoursToSimulationInstant,
  calendarDateHourToSimulationInstant,
  compareSimulationInstants,
  fractionOfYear,
  simulationInstantFromHoursSinceEra,
  simulationInstantToCalendarDate,
  simulationInstantToHoursSinceEra,
} from './simulation_instant';

describe('simulation_instant', () => {
  const cal = getGregorianCalendar();

  it('round-trips hours since era', () => {
    const inst = {
      yearIndex: 2,
      dayOfYear: 100,
      hourOfDay: 12,
    };
    const h = simulationInstantToHoursSinceEra(cal, inst);
    const back = simulationInstantFromHoursSinceEra(cal, h);
    expect(back).toEqual(inst);
  });

  it('addHours rolls across year boundary', () => {
    const start = { yearIndex: 0, dayOfYear: 365, hourOfDay: 12 };
    const next = addHoursToSimulationInstant(cal, start, 24);
    expect(next).toEqual({ yearIndex: 1, dayOfYear: 1, hourOfDay: 12 });
  });

  it('compareSimulationInstants orders time', () => {
    const a = { yearIndex: 0, dayOfYear: 1, hourOfDay: 0 };
    const b = { yearIndex: 0, dayOfYear: 1, hourOfDay: 1 };
    expect(compareSimulationInstants(a, b)).toBe(-1);
    expect(compareSimulationInstants(b, a)).toBe(1);
    expect(compareSimulationInstants(a, a)).toBe(0);
  });

  it('maps to CalendarDate', () => {
    const inst = { yearIndex: 0, dayOfYear: 32, hourOfDay: 0 };
    const d = simulationInstantToCalendarDate(cal, inst);
    expect(d.month.name).toBe('February');
    expect(d.dayOfMonth).toBe(1);
  });

  it('calendarDateHourToSimulationInstant matches', () => {
    const inst0 = { yearIndex: 5, dayOfYear: 60, hourOfDay: 6 };
    const d = simulationInstantToCalendarDate(cal, inst0);
    const back = calendarDateHourToSimulationInstant(cal, d, 6);
    expect(back).toEqual(inst0);
  });

  it('fractionOfYear is 0 at new year and approaches 1 at end', () => {
    const start = { yearIndex: 0, dayOfYear: 1, hourOfDay: 0 };
    expect(fractionOfYear(cal, start)).toBe(0);
    const almostEnd = addHoursToSimulationInstant(
      cal,
      { yearIndex: 0, dayOfYear: 365, hourOfDay: 0 },
      cal.dayLengthInHours - 1,
    );
    expect(fractionOfYear(cal, almostEnd)).toBeGreaterThan(0.99);
  });
});
