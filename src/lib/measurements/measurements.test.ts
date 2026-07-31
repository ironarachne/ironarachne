import * as Measurements from './index';
import { expect, test } from 'vitest';

test('converting 10 cm to inches should be 3.937 inches', () => {
  const inches = Measurements.cmToInches(10);
  expect(inches).toBe(3.937);
});

test('converting 24 inches to cm should be 60.96 cm', () => {
  const cm = Measurements.inchesToCM(24);
  expect(cm).toBe(60.96);
});

test('converting 10 kg to pounds should be 22.046 pounds', () => {
  const pounds = Measurements.kgToPounds(10);
  expect(pounds).toBe(22.046);
});

test('converting 220 pounds to kg should be 99.792 kg', () => {
  const kg = Measurements.poundsToKG(220);
  expect(kg).toBe(99.792);
});

test('converting 74 inches to feet expression should be 6\'2"', () => {
  const feetExpression = Measurements.inchesToFeetExpression(74);
  expect(feetExpression).toBe('6\'2"');
});

test('kilometers round-trip to miles', () => {
  const km = 100;
  const mi = Measurements.kilometersToMiles(km);
  const back = Measurements.milesToKilometers(mi);
  expect(back).toBeCloseTo(km, 5);
});

test('converting 10 feet to meters should be 3.048 meters', () => {
  const meters = Measurements.feetToMeters(10);
  expect(meters).toBeCloseTo(3.048, 6);
});

test('converting 100 meters to feet should be 328.08 feet', () => {
  const feet = Measurements.metersToFeet(100);
  expect(feet).toBeCloseTo(328.08, 6);
});

test('feet round-trip to meters', () => {
  const feet = 6;
  const back = Measurements.metersToFeet(Measurements.feetToMeters(feet));
  expect(back).toBeCloseTo(feet, 3);
});

test('water freezes at 0 C, 32 F and 273.15 K', () => {
  expect(Measurements.cToF(0)).toBe(32);
  expect(Measurements.cToK(0)).toBe(273.15);
  expect(Measurements.fToC(32)).toBe(0);
  expect(Measurements.fToK(32)).toBe(273.15);
  expect(Measurements.kToC(273.15)).toBe(0);
  expect(Measurements.kToF(273.15)).toBe(32);
});

test('water boils at 100 C, 212 F and 373.15 K', () => {
  expect(Measurements.cToF(100)).toBe(212);
  expect(Measurements.cToK(100)).toBe(373.15);
  expect(Measurements.fToC(212)).toBeCloseTo(100, 10);
  expect(Measurements.fToK(212)).toBeCloseTo(373.15, 10);
  expect(Measurements.kToC(373.15)).toBeCloseTo(100, 10);
  expect(Measurements.kToF(373.15)).toBeCloseTo(212, 10);
});

test('-40 is the same in Celsius and Fahrenheit', () => {
  expect(Measurements.cToF(-40)).toBe(-40);
  expect(Measurements.fToC(-40)).toBe(-40);
});

test('absolute zero is -273.15 C and 0 K', () => {
  expect(Measurements.cToK(-273.15)).toBeCloseTo(0, 10);
  expect(Measurements.kToC(0)).toBe(-273.15);
});

test('temperature conversions round-trip', () => {
  for (const c of [-100, -40, 0, 21.5, 100, 1000]) {
    expect(Measurements.fToC(Measurements.cToF(c))).toBeCloseTo(c, 6);
    expect(Measurements.kToC(Measurements.cToK(c))).toBeCloseTo(c, 6);
  }

  for (const f of [-40, 0, 98.6, 212]) {
    expect(Measurements.kToF(Measurements.fToK(f))).toBeCloseTo(f, 6);
  }
});
