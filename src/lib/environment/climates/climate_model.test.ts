import { describe, expect, it } from 'vitest';
import {
  EQUATOR_ANNUAL_MEAN_C,
  LATITUDE_LAPSE_C,
  LAPSE_RATE_C_PER_KM,
  MAX_TERRAIN_HEIGHT_KM,
  annualMeanAt,
  mapHeight,
  seasonCalendar,
  seasonExtremeAmplitude,
  seasonalAmplitudeAt,
} from './climate_model';

describe('shared temperature model', () => {
  it('uses one equator baseline and one latitude lapse', () => {
    expect(annualMeanAt(0, 0)).toBeCloseTo(EQUATOR_ANNUAL_MEAN_C, 10);
    expect(annualMeanAt(90, 0)).toBeCloseTo(EQUATOR_ANNUAL_MEAN_C - LATITUDE_LAPSE_C, 10);
    expect(annualMeanAt(-90, 0)).toBeCloseTo(EQUATOR_ANNUAL_MEAN_C - LATITUDE_LAPSE_C, 10);
  });

  it('applies one absolute lapse against normalized height', () => {
    expect(annualMeanAt(40, 0) - annualMeanAt(40, 1)).toBeCloseTo(
      LAPSE_RATE_C_PER_KM * MAX_TERRAIN_HEIGHT_KM,
      10,
    );
    expect(annualMeanAt(40, 0.5)).toBeCloseTo(
      EQUATOR_ANNUAL_MEAN_C -
        LATITUDE_LAPSE_C * (40 / 90) -
        LAPSE_RATE_C_PER_KM * MAX_TERRAIN_HEIGHT_KM * 0.5,
      10,
    );
  });

  it('clamps latitude, height and elevation input', () => {
    expect(annualMeanAt(120, 0)).toBe(annualMeanAt(90, 0));
    expect(annualMeanAt(-120, 0)).toBe(annualMeanAt(-90, 0));
    expect(annualMeanAt(0, -1)).toBe(annualMeanAt(0, 0));
    expect(annualMeanAt(0, 2)).toBe(annualMeanAt(0, 1));
    expect(mapHeight(-1)).toBe(0);
    expect(mapHeight(2)).toBe(1);
    expect(mapHeight(0.9)).toBeCloseTo((0.9 + 0.1) / 2.1, 10);
  });

  it('grows the seasonal amplitude monotonically with latitude', () => {
    expect(seasonalAmplitudeAt(0)).toBeCloseTo(1, 10);
    expect(seasonalAmplitudeAt(45)).toBeLessThan(seasonalAmplitudeAt(70));
    expect(seasonalAmplitudeAt(90)).toBeCloseTo(18, 10);
    expect(seasonalAmplitudeAt(-90)).toBeCloseTo(18, 10);
  });

  it('gives tropical latitudes two seasons and higher latitudes four', () => {
    const tropical = seasonCalendar(10);
    expect(tropical.map((season) => season.name)).toEqual(['dry', 'wet']);
    expect(tropical.map((season) => season.temperatureAdjustment)).toEqual([
      seasonalAmplitudeAt(10) / 2,
      -seasonalAmplitudeAt(10) / 2,
    ]);

    const temperate = seasonCalendar(40);
    expect(temperate.map((season) => season.name)).toEqual([
      'spring',
      'summer',
      'autumn',
      'winter',
    ]);
    expect(temperate.find((season) => season.name === 'summer')!.temperatureAdjustment).toBeCloseTo(
      seasonalAmplitudeAt(40),
      10,
    );
    expect(temperate.find((season) => season.name === 'winter')!.temperatureAdjustment).toBeCloseTo(
      -seasonalAmplitudeAt(40),
      10,
    );
  });

  it('uses the season extreme, not the raw amplitude, as the climate half-range', () => {
    expect(seasonExtremeAmplitude(40)).toBeCloseTo(seasonalAmplitudeAt(40), 10);
    expect(seasonExtremeAmplitude(10)).toBeCloseTo(seasonalAmplitudeAt(10) / 2, 10);
  });

  it('shifts season day ranges by half a year in the south', () => {
    const north = seasonCalendar(40);
    const south = seasonCalendar(-40);
    expect(south.map((season) => season.name)).toEqual(north.map((season) => season.name));
    expect(south[0].startDay).not.toBe(north[0].startDay);
    expect(south.map((season) => season.temperatureAdjustment)).toEqual(
      north.map((season) => season.temperatureAdjustment),
    );
    for (const season of south) {
      expect(season.startDay).toBeGreaterThanOrEqual(1);
      expect(season.startDay).toBeLessThanOrEqual(365);
      expect(season.endDay).toBeGreaterThanOrEqual(1);
      expect(season.endDay).toBeLessThanOrEqual(365);
    }
  });
});
