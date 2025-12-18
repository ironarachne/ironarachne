import { describe, it, expect } from "vitest";
import { animalCharges } from "../charges-animals";
import { monsterCharges } from "../charges-monsters";
import { objectCharges } from "../charges-objects";
import { plantCharges } from "../charges-plants";
import { symbolCharges } from "../charges-symbols";
import type { Charge } from "../charge-types";

describe("Heraldry Charges", () => {
  function testChargeArray(name: string, arr: Charge[]) {
    it(`${name} array is not empty`, () => {
      expect(arr.length).toBeGreaterThan(0);
    });
    it(`${name} array contains valid charges`, () => {
      for (const charge of arr) {
        expect(charge).toHaveProperty("name");
        expect(charge).toHaveProperty("pluralName");
        expect(charge).toHaveProperty("SVG");
      }
    });
  }

  testChargeArray("animalCharges", animalCharges);
  testChargeArray("monsterCharges", monsterCharges);
  testChargeArray("objectCharges", objectCharges);
  testChargeArray("plantCharges", plantCharges);
  testChargeArray("symbolCharges", symbolCharges);
});
