import { test, expect, describe, vi } from "vitest";
import { getMonthAbbr, getMonthName, getNiceDate } from "./dates";
import * as Words from "@ironarachne/words";

describe("getMonthAbbr", () => {
  test("returns correct abbreviation for each month", () => {
    expect(getMonthAbbr(0)).toBe("Jan.");
    expect(getMonthAbbr(1)).toBe("Feb.");
    expect(getMonthAbbr(2)).toBe("Mar.");
    expect(getMonthAbbr(3)).toBe("Apr.");
    expect(getMonthAbbr(4)).toBe("May");
    expect(getMonthAbbr(5)).toBe("Jun.");
    expect(getMonthAbbr(6)).toBe("Jul.");
    expect(getMonthAbbr(7)).toBe("Aug.");
    expect(getMonthAbbr(8)).toBe("Sep.");
    expect(getMonthAbbr(9)).toBe("Oct.");
    expect(getMonthAbbr(10)).toBe("Nov.");
    expect(getMonthAbbr(11)).toBe("Dec.");
  });
});

describe("getMonthName", () => {
  test("returns correct name for each month", () => {
    expect(getMonthName(0)).toBe("January");
    expect(getMonthName(1)).toBe("February");
    expect(getMonthName(2)).toBe("March");
    expect(getMonthName(3)).toBe("April");
    expect(getMonthName(4)).toBe("May");
    expect(getMonthName(5)).toBe("June");
    expect(getMonthName(6)).toBe("July");
    expect(getMonthName(7)).toBe("August");
    expect(getMonthName(8)).toBe("September");
    expect(getMonthName(9)).toBe("October");
    expect(getMonthName(10)).toBe("November");
    expect(getMonthName(11)).toBe("December");
  });
});

describe("getNiceDate", () => {
  test("returns formatted date string with ordinal and month abbreviation", () => {
    // Mock Words.getOrdinal
    vi.spyOn(Words, "getOrdinal").mockImplementation((n) => `${n}th`);
    expect(getNiceDate("2025-07-15")).toBe("Jul. 15<sup>15th</sup>, 2025");
    expect(getNiceDate("2025-01-01")).toBe("Jan. 1<sup>1th</sup>, 2025");
    expect(getNiceDate("2025-12-31")).toBe("Dec. 31<sup>31th</sup>, 2025");
  });

  test("calls Words.getOrdinal with correct day", () => {
    const spy = vi.spyOn(Words, "getOrdinal");
    getNiceDate("2025-07-15");
    expect(spy).toHaveBeenCalledWith(15);
  });
});
