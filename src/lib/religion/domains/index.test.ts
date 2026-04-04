import { describe, it, expect } from "vitest";
import * as domainData from "./domain_data";
import * as domainGen from "./domain_generation";
import * as domainManip from "./domain_manipulation";
import * as domainTypes from "./domain_types";

// Basic smoke tests for each module

describe("domains library", () => {
    it("should export domains array", () => {
        expect(domainData.domains).toBeDefined();
        expect(Array.isArray(domainData.domains)).toBe(true);
        expect(domainData.domains.length).toBeGreaterThan(0);
    });

    it("should export domain types", () => {
        expect(domainTypes).toBeDefined();
    });

    it("should export domain generation functions", () => {
        expect(domainGen).toBeDefined();
        // Optionally check for a known function
        // expect(typeof domainGen.generateDomain).toBe("function");
    });

    it("should export domain manipulation functions", () => {
        expect(domainManip).toBeDefined();
        // Optionally check for a known function
        // expect(typeof domainManip.someManipulationFunction).toBe("function");
    });
});
