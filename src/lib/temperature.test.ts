import { test, expect, describe } from "vitest";
import {
  celsiusToFahrenheit,
  celsiusToKelvin,
  fahrenheitToCelsius,
  getDescription,
  getComparativeString,
} from "./temperature";

describe("celsiusToFahrenheit", () => {
  test("converts Celsius to Fahrenheit", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });
});

describe("celsiusToKelvin", () => {
  test("converts Celsius to Kelvin", () => {
    expect(celsiusToKelvin(0)).toBeCloseTo(273.15);
    expect(celsiusToKelvin(100)).toBeCloseTo(373.15);
    expect(celsiusToKelvin(-273.15)).toBeCloseTo(0);
  });
});

describe("fahrenheitToCelsius", () => {
  test("converts Fahrenheit to Celsius", () => {
    expect(fahrenheitToCelsius(32)).toBeCloseTo(0);
    expect(fahrenheitToCelsius(212)).toBeCloseTo(100);
    expect(fahrenheitToCelsius(-40)).toBeCloseTo(-40);
  });
});

describe("getDescription", () => {
  test("returns correct description for Fahrenheit", () => {
    expect(getDescription(-10, "fahrenheit")).toBe("freezing");
    expect(getDescription(30, "fahrenheit")).toBe("cold");
    expect(getDescription(50, "fahrenheit")).toBe("cool");
    expect(getDescription(70, "fahrenheit")).toBe("warm");
    expect(getDescription(90, "fahrenheit")).toBe("hot");
    expect(getDescription(120, "fahrenheit")).toBe("scorching");
  });

  test("returns correct description for Celsius", () => {
    expect(getDescription(-20, "celsius")).toBe("freezing"); // -20C = -4F
    expect(getDescription(0, "celsius")).toBe("cold"); // 0C = 32F
    expect(getDescription(10, "celsius")).toBe("cool"); // 10C = 50F
    expect(getDescription(20, "celsius")).toBe("warm"); // 20C = 68F
    expect(getDescription(30, "celsius")).toBe("hot"); // 30C = 86F
    expect(getDescription(50, "celsius")).toBe("scorching"); // 50C = 122F
  });
});

describe("getComparativeString", () => {
  test("returns correct string for Fahrenheit input", () => {
    expect(getComparativeString(32, "fahrenheit")).toBe("0°C (32°F)");
    expect(getComparativeString(212, "fahrenheit")).toBe("100°C (212°F)");
  });

  test("returns correct string for Celsius input", () => {
    expect(getComparativeString(0, "celsius")).toBe("0°C (32°F)");
    expect(getComparativeString(100, "celsius")).toBe("100°C (212°F)");
  });
});
