import { describe, it, expect } from "vitest";
import { getAllChargeArrangements } from "../charge_group_arrangements/index";

// Minimal SVG string for testing
const simpleSVG = `<svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"></svg>`;

describe("charge_group_arrangements", () => {
  it("should export an array of arrangements", () => {
    const arrangements = getAllChargeArrangements();
    expect(Array.isArray(arrangements)).toBe(true);
    expect(arrangements.length).toBeGreaterThan(0);
  });

  it("each arrangement should have required properties", () => {
    for (const arrangement of getAllChargeArrangements()) {
      expect(arrangement).toHaveProperty("name");
      expect(arrangement).toHaveProperty("numberOfCharges");
      expect(arrangement).toHaveProperty("blazonPattern");
      expect(arrangement).toHaveProperty("renderSVG");
      expect(typeof arrangement.renderSVG).toBe("function");
    }
  });

  it("renderSVG should return a string of SVG markup", () => {
    for (const arrangement of getAllChargeArrangements()) {
      const svg = arrangement.renderSVG(simpleSVG, 200, 200);
      expect(typeof svg).toBe("string");
      expect(svg).toContain("<g");
      expect(svg).toContain("</g>");
    }
  });
});
