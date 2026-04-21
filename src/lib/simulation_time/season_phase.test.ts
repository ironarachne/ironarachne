import { describe, expect, it } from 'vitest';
import { buildFictionalCalendarFromMonthLengths } from '$lib/calendar';
import { defaultOrbitalSeasonParams, seasonPhase01 } from './season_phase';

describe('seasonPhase01', () => {
  it('returns value in [0,1) for a 400-day year', () => {
    const cal = buildFictionalCalendarFromMonthLengths({
      dayLengthInHours: 24,
      daysInWeek: 5,
      monthNames: ['M1', 'M2'],
      monthLengths: [200, 200],
      weekdayNames: ['a', 'b', 'c', 'd', 'e'],
    });
    const params = defaultOrbitalSeasonParams(cal);
    const p = seasonPhase01(cal, { yearIndex: 0, dayOfYear: 1, hourOfDay: 0 }, params);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(1);
  });
});
