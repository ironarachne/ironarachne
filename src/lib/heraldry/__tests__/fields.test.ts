import { describe, it, expect } from "vitest";
import { all } from "../fields";

describe("fields", () => {
  it("all() returns an array of Field objects", () => {
    const fields = all();
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      expect(field).toHaveProperty("name");
      expect(field).toHaveProperty("blazon");
      expect(field).toHaveProperty("variationCount");
      expect(field).toHaveProperty("pattern");
      expect(field).toHaveProperty("commonality");
      expect(field).toHaveProperty("variations");
      expect(Array.isArray(field.variations)).toBe(true);
    }
  });

  it("each field has a valid variationCount", () => {
    for (const field of all()) {
      expect(typeof field.variationCount).toBe("number");
      expect(field.variationCount).toBeGreaterThan(0);
    }
  });
});
