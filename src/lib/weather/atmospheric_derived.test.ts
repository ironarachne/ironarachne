import { describe, expect, it } from 'vitest';
import {
  dewPointCelsius,
  dryAdiabaticLapseDeltaC,
  heatIndexCelsius,
  visibilityKmFromHumidityAndPrecip,
  windChillCelsius,
} from './atmospheric_derived';

describe('atmospheric_derived', () => {
  it('computes dew point below temperature for RH < 1', () => {
    const dp = dewPointCelsius(20, 0.5);
    expect(dp).toBeLessThan(20);
  });

  it('wind chill is not warmer than air in cold wind', () => {
    const wc = windChillCelsius(-5, 10);
    expect(wc).toBeLessThanOrEqual(-5);
  });

  it('heat index is at least ambient when hot', () => {
    const hi = heatIndexCelsius(35, 0.5);
    expect(hi).toBeGreaterThanOrEqual(35);
  });

  it('lapse cools with altitude', () => {
    expect(dryAdiabaticLapseDeltaC(1000)).toBeLessThan(0);
  });

  it('reduces visibility with precipitation', () => {
    const clear = visibilityKmFromHumidityAndPrecip(0.5, 0);
    const wet = visibilityKmFromHumidityAndPrecip(0.5, 5);
    expect(wet).toBeLessThan(clear);
  });
});
