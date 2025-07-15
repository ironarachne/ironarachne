import { describe, it, expect } from "vitest";
import {
  getStarClassifications,
  getLuminosityClasses,
  getSpectralClasses,
  getStarClassificationByName,
} from "./star_classifications";

describe("Star Classifications", () => {
  describe("getAllStarClassifications", () => {
    it("should return an array of star classifications", () => {
      const classifications = getStarClassifications();
      expect(Array.isArray(classifications)).toBe(true);
      expect(classifications.length).toBeGreaterThan(0);
      for (const classification of classifications) {
        expect(classification).toHaveProperty("name");
        expect(classification).toHaveProperty("luminosity_class");
        expect(classification).toHaveProperty("spectral_class");
      }
    });
  });

  describe("getAllLuminosityClasses", () => {
    it("should return an array of luminosity classes", () => {
      const classes = getLuminosityClasses();
      expect(Array.isArray(classes)).toBe(true);
      expect(classes.length).toBeGreaterThan(0);
      for (const cls of classes) {
        expect(cls).toHaveProperty("name");
        expect(cls).toHaveProperty("description");
        expect(cls).toHaveProperty("commonality");
      }
    });
  });

  describe("getAllSpectralClasses", () => {
    it("should return an array of spectral classes", () => {
      const classes = getSpectralClasses();
      expect(Array.isArray(classes)).toBe(true);
      expect(classes.length).toBeGreaterThan(0);
      for (const cls of classes) {
        expect(cls).toHaveProperty("name");
        expect(cls).toHaveProperty("spectral_class");
        expect(cls).toHaveProperty("commonality");
      }
    });
  });

  describe("getStarClassificationByName", () => {
    it("should return a valid star classification for valid name", () => {
      const classification = getStarClassificationByName("B3VII");
      expect(classification).toBeDefined();
      expect(classification).toHaveProperty("name");
      expect(classification).toHaveProperty("luminosity_class");
      expect(classification).toHaveProperty("spectral_class");
    });
  });
});
