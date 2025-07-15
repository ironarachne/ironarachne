import { test, expect, describe } from "vitest";
import { clamp, linearMap } from "./math_translation";

describe("clamp", () => {
  test("returns x when within range", () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  test("returns min when x is below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test("returns max when x is above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("linearMap", () => {
  test("maps x from original range to target range", () => {
    expect(linearMap(5, 0, 10, 0, 100)).toBe(50);
    expect(linearMap(0, 0, 10, 0, 100)).toBe(0);
    expect(linearMap(10, 0, 10, 0, 100)).toBe(100);
  });

  test("handles negative ranges", () => {
    expect(linearMap(-5, -10, 0, 0, 100)).toBe(50);
  });

  test("handles reversed target ranges", () => {
    expect(linearMap(0, 0, 10, 100, 0)).toBe(100);
    expect(linearMap(10, 0, 10, 100, 0)).toBe(0);
  });
});
