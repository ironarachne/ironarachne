import * as Measurements from "$lib/measurements";
import { expect, test } from "vitest";

test("converting 10 cm to inches should be 3.937 inches", () => {
  const inches = Measurements.cmToInches(10);
  expect(inches).toBe(3.937);
});

test("converting 24 inches to cm should be 60.96 cm", () => {
  const cm = Measurements.inchesToCM(24);
  expect(cm).toBe(60.96);
});

test("converting 10 kg to pounds should be 22.046 pounds", () => {
  const pounds = Measurements.kgToPounds(10);
  expect(pounds).toBe(22.046);
});

test("converting 220 pounds to kg should be 99.792 kg", () => {
  const kg = Measurements.poundsToKG(220);
  expect(kg).toBe(99.792);
});

test("converting 74 inches to feet expression should be 6'2\"", () => {
  const feetExpression = Measurements.inchesToFeetExpression(74);
  expect(feetExpression).toBe("6'2\"");
});
