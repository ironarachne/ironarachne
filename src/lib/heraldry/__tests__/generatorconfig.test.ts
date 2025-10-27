import { describe, expect, test } from "vitest";
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  getDefaultHeraldryGeneratorConfig,
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
  validateHeraldryGeneratorConfig,
} from "$lib/heraldry/generatorconfig.js";

// Simple deterministic RNGs for testing
const rngFirst = () => 0; // always picks index 0
const rngLast = () => 0.99; // will floor to last index for small arrays

describe("heraldry/generatorconfig", () => {
  test("getDefaultHeraldryGeneratorConfig returns defaults and non-empty option sets", () => {
    const cfg = getDefaultHeraldryGeneratorConfig();

    expect(cfg.width).toBe(DEFAULT_WIDTH);
    expect(cfg.height).toBe(DEFAULT_HEIGHT);
    expect(typeof cfg.chargeCount).toBe("number");
    expect(cfg.chargeCount).toBeGreaterThanOrEqual(0);
    expect(cfg.chargeCount).toBeLessThanOrEqual(3);

    expect(cfg.chargeOptions.length).toBeGreaterThan(0);
    expect(cfg.chargeTinctures.length).toBeGreaterThan(0);
    expect(cfg.fieldOptions.length).toBeGreaterThan(0);
    expect(cfg.fieldTinctures1.length).toBeGreaterThan(0);
    expect(cfg.fieldTinctures2.length).toBeGreaterThan(0);
    expect(cfg.variationOptions.length).toBeGreaterThan(0);
  });

  test("getDefaultHeraldryGeneratorConfig respects injected RNG for chargeCount (first)", () => {
    const cfg = getDefaultHeraldryGeneratorConfig(rngFirst);
    // with rngFirst -> index 0 of [0,1,2,3] => 0
    expect(cfg.chargeCount).toBe(0);
  });

  test("getDefaultHeraldryGeneratorConfig respects injected RNG for chargeCount (last)", () => {
    const cfg = getDefaultHeraldryGeneratorConfig(rngLast);
    // with rngLast -> floor(0.99 * 4) => 3
    expect(cfg.chargeCount).toBe(3);
  });

  test("mergeHeraldryGeneratorConfig overlays provided values and keeps defaults", () => {
    const overrides = {
      width: 700,
      height: 800,
      chargeCount: 2,
    } satisfies Partial<HeraldryGeneratorConfig>;

    const cfg = mergeHeraldryGeneratorConfig(overrides);

    expect(cfg.width).toBe(700);
    expect(cfg.height).toBe(800);
    expect(cfg.chargeCount).toBe(2);

    // Ensure some defaults are still present (spot checks)
    expect(cfg.chargeOptions.length).toBeGreaterThan(0);
    expect(cfg.fieldOptions.length).toBeGreaterThan(0);
  });

  test("validateHeraldryGeneratorConfig rejects invalid sizes and counts", () => {
    const base = getDefaultHeraldryGeneratorConfig();

    expect(() =>
      validateHeraldryGeneratorConfig({ ...base, width: -1 }),
    ).toThrowError();

    expect(() =>
      validateHeraldryGeneratorConfig({ ...base, height: 0 }),
    ).toThrowError();

    expect(() =>
      validateHeraldryGeneratorConfig({ ...base, chargeCount: -1 }),
    ).toThrowError();
  });
});
