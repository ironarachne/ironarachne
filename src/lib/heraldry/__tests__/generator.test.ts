import { describe, expect, test } from 'vitest';
import * as RNG from '@ironarachne/rng';
import { generateHeraldry, generateHeraldryConfig } from '../generator.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '../generatorconfig.js';

const rng = new RNG.RNG('test-seed');

// Helper: config with zero charges
function zeroChargeConfig(): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({ chargeCount: 0 });
}

describe('heraldry/generator', () => {
  test('generateHeraldry returns Arms with device and blazon (default config)', () => {
    const arms = generateHeraldry();
    expect(arms).toHaveProperty('device');
    expect(arms).toHaveProperty('blazon');
    expect(typeof arms.blazon).toBe('string');
  });

  test('generateHeraldry returns Arms with no charges when chargeCount is 0', () => {
    const cfg = zeroChargeConfig();
    const arms = generateHeraldry(cfg);
    // Device should exist, and chargeGroups should be empty or absent
    expect(arms.device).toBeDefined();
    // The device's chargeGroups property may not exist, but if it does, it should be empty
    if (Array.isArray(arms.device.chargeGroups)) {
      expect(arms.device.chargeGroups.length).toBe(0);
    }
  });

  test('generateHeraldryConfig returns a valid config', () => {
    const cfg = generateHeraldryConfig(rng);
    expect(cfg.chargeCount).toBeGreaterThanOrEqual(0);
    expect(cfg.chargeOptions.length).toBeGreaterThan(0);
    expect(cfg.fieldOptions.length).toBeGreaterThan(0);
  });

  test('generateHeraldry returns different blazons for different configs', () => {
    const cfg1 = mergeHeraldryGeneratorConfig({ chargeCount: 0 });
    const cfg2 = mergeHeraldryGeneratorConfig({ chargeCount: 2 });
    const arms1 = generateHeraldry(cfg1);
    const arms2 = generateHeraldry(cfg2);
    expect(arms1.blazon).not.toBe(arms2.blazon);
  });

  test('mergeHeraldryGeneratorConfig rejects chargeCount above four', () => {
    expect(() => mergeHeraldryGeneratorConfig({ chargeCount: 5 })).toThrowError();
  });

  test('generateHeraldry supports four charges', () => {
    const cfg = mergeHeraldryGeneratorConfig({ chargeCount: 4 });
    const arms = generateHeraldry(cfg);
    expect(arms.device.chargeGroups.length).toBe(1);
    expect(arms.device.chargeGroups[0].numberOfCharges).toBe(4);
  });

  test('generateHeraldry uses pinned field division', () => {
    const cfg = mergeHeraldryGeneratorConfig({
      chargeCount: 0,
      fieldDivisionName: 'saltire',
      fieldOptions: [],
      rng: new RNG.RNG('pinned-field'),
    });
    const arms = generateHeraldry(cfg);
    expect(arms.device.field.name).toBe('saltire');
  });

  test('generateHeraldry uses pinned variation and tinctures', () => {
    const cfg = mergeHeraldryGeneratorConfig({
      chargeCount: 0,
      fieldDivisionName: 'plain',
      fieldOptions: [],
      variationSlotPreferences: [
        {
          variationName: 'barry',
          tinctureNames: ['azure', 'Or'],
        },
      ],
      rng: new RNG.RNG('pinned-variation'),
    });
    const arms = generateHeraldry(cfg);
    expect(arms.device.field.variations[0].name).toBe('barry');
    expect(arms.device.field.variations[0].tinctures.map((t) => t.name)).toEqual(['azure', 'Or']);
    expect(arms.blazon).toContain('barry azure and Or');
  });

  test('generateHeraldry is deterministic with pinned field options', () => {
    const cfg = mergeHeraldryGeneratorConfig({
      chargeCount: 0,
      fieldDivisionName: 'fess',
      fieldOptions: [],
      variationSlotPreferences: [
        { variationName: 'plain', tinctureNames: ['gules'] },
        { variationName: 'plain', tinctureNames: ['argent'] },
      ],
      rng: new RNG.RNG('repeatable-field'),
    });
    const first = generateHeraldry(cfg);
    const second = generateHeraldry(cfg);
    expect(first.blazon).toBe(second.blazon);
    expect(first.device.field.name).toBe('fess');
  });

  test('generateHeraldry assigns three variations for per pall', () => {
    const cfg = mergeHeraldryGeneratorConfig({
      chargeCount: 0,
      fieldDivisionName: 'pall',
      fieldOptions: [],
      variationSlotPreferences: [
        { variationName: 'plain', tinctureNames: ['gules'] },
        { variationName: 'plain', tinctureNames: ['Or'] },
        { variationName: 'plain', tinctureNames: ['azure'] },
      ],
      rng: new RNG.RNG('pall-field'),
    });
    const arms = generateHeraldry(cfg);
    expect(arms.device.field.name).toBe('pall');
    expect(arms.device.field.variations).toHaveLength(3);
    expect(arms.blazon).toBe('per pall gules, Or and azure');
  });
});
