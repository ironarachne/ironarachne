import { describe, expect, it } from 'vitest';
import { buildFictionalCalendarFromMonthLengths } from '$lib/calendar';
import type { ClimateWeatherProfile } from './climate_profile';
import {
  seasonPhaseBinIndex,
  validateClimateWeatherProfile,
  phenomenonWeightsAtInstant,
} from './climate_profile';
import { defaultOrbitalSeasonParams } from '$lib/simulation_time';

describe('climate_profile', () => {
  const cal = buildFictionalCalendarFromMonthLengths({
    dayLengthInHours: 24,
    daysInWeek: 7,
    monthNames: ['A', 'B'],
    monthLengths: [100, 300],
    weekdayNames: ['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'],
  });

  const profile: ClimateWeatherProfile = {
    id: 'test',
    seasonPhaseBinCount: 4,
    weightsPerBin: [
      [{ phenomenonId: 'clear', weight: 2 }],
      [{ phenomenonId: 'rain', weight: 1 }],
      [{ phenomenonId: 'storm', weight: 0.5 }],
      [{ phenomenonId: 'clear', weight: 1 }],
    ],
    orbitalParams: defaultOrbitalSeasonParams(cal),
  };

  it('validates consistent profile', () => {
    expect(validateClimateWeatherProfile(profile)).toEqual([]);
  });

  it('maps phase to bins', () => {
    expect(seasonPhaseBinIndex(profile, 0)).toBe(0);
    expect(seasonPhaseBinIndex(profile, 0.24)).toBe(0);
    expect(seasonPhaseBinIndex(profile, 0.26)).toBe(1);
  });

  it('phenomenonWeightsAtInstant returns a bin', () => {
    const w = phenomenonWeightsAtInstant(cal, profile, {
      yearIndex: 0,
      dayOfYear: 50,
      hourOfDay: 0,
    });
    expect(w.length).toBeGreaterThan(0);
  });
});
