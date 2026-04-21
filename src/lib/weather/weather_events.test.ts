import { describe, expect, it } from 'vitest';
import { getGregorianCalendar } from '$lib/calendar';
import { RNG } from '@ironarachne/rng';
import {
  fillTimelineWithSequentialWeatherEvents,
  getActiveWeatherEventsAt,
} from './weather_events';

describe('weather_events', () => {
  const cal = getGregorianCalendar();

  it('fills sequential events until range end start', () => {
    const rng = new RNG('wx-events-1');
    const events = fillTimelineWithSequentialWeatherEvents({
      calendar: cal,
      rangeStart: { yearIndex: 0, dayOfYear: 1, hourOfDay: 0 },
      rangeEnd: { yearIndex: 0, dayOfYear: 3, hourOfDay: 0 },
      rng,
      minEventHours: 2,
      maxEventHours: 8,
      sampleEventKind: (r) => ['clear', 'cloudy', 'rain'][r.int(0, 2)] ?? 'clear',
      baselineTemperatureC: 12,
    });
    expect(events.length).toBeGreaterThan(0);
    let t = events[0].start;
    for (const e of events) {
      expect(e.start).toEqual(t);
      t = e.end;
    }
  });

  it('getActiveWeatherEventsAt finds covering event', () => {
    const rng = new RNG('wx-events-2');
    const events = fillTimelineWithSequentialWeatherEvents({
      calendar: cal,
      rangeStart: { yearIndex: 0, dayOfYear: 1, hourOfDay: 0 },
      rangeEnd: { yearIndex: 0, dayOfYear: 2, hourOfDay: 0 },
      rng,
      minEventHours: 10,
      maxEventHours: 20,
      sampleEventKind: () => 'clear',
      baselineTemperatureC: 5,
    });
    const mid = events[0]
      ? {
          yearIndex: 0,
          dayOfYear: 1,
          hourOfDay: 5,
        }
      : { yearIndex: 0, dayOfYear: 1, hourOfDay: 0 };
    const active = getActiveWeatherEventsAt(cal, events, mid);
    expect(active.length).toBeGreaterThanOrEqual(1);
  });
});
