import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { all, byName, getRandomWeatherEvents } from './precipitationtypes';

describe('all', () => {
  it('lists precipitation types with unique names', () => {
    const names = all().map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every type events at all three strengths', () => {
    for (const type of all()) {
      expect(type.mildEvents.length).toBeGreaterThan(0);
      expect(type.moderateEvents.length).toBeGreaterThan(0);
      expect(type.strongEvents.length).toBeGreaterThan(0);
    }
  });
});

describe('byName', () => {
  it('finds a type by its name', () => {
    expect(byName('rain').name).toBe('rain');
    expect(byName('snow').name).toBe('snow');
  });

  it('throws when no type carries the name', () => {
    expect(() => byName('sleet')).toThrow('Invalid precipitation type name.');
  });
});

describe('getRandomWeatherEvents', () => {
  const rain = byName('rain');

  it('draws from the mild events below strength 3', () => {
    for (const strength of [0, 1, 2]) {
      expect(rain.mildEvents).toContain(getRandomWeatherEvents(rain, strength, new RNG('mild')));
    }
  });

  it('draws from the moderate events from strength 3 up to 7', () => {
    for (const strength of [3, 4, 5, 6]) {
      expect(rain.moderateEvents).toContain(
        getRandomWeatherEvents(rain, strength, new RNG('moderate')),
      );
    }
  });

  it('draws from the strong events at strength 7 and above', () => {
    for (const strength of [7, 8, 10]) {
      expect(rain.strongEvents).toContain(
        getRandomWeatherEvents(rain, strength, new RNG('strong')),
      );
    }
  });

  it('is deterministic for a given seed', () => {
    expect(getRandomWeatherEvents(rain, 5, new RNG('seed'))).toBe(
      getRandomWeatherEvents(rain, 5, new RNG('seed')),
    );
  });
});
