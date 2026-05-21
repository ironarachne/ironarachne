import { describe, expect, it } from 'vitest';

import { generateHeraldry } from '$lib/heraldry/generator.js';
import { mergeHeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import {
  defaultHeraldryGeneratorOptions,
  heraldryFromSnapshot,
  HERALDRY_SNAPSHOT_NAME_MAX_LENGTH,
  normalizeHeraldryGeneratorOptions,
  toHeraldrySnapshot,
  type HeraldryGeneratorOptionsSnapshot,
} from '$lib/heraldry/heraldry_snapshot.js';

const sampleGeneratorOptions: HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: 'any',
  chargeTinctureName: 'gules',
  numberOfChargesOption: 'one',
  chargePosition: 'normal',
  lockSeed: true,
  fieldDivisionOption: 'pale',
  variationSlotOptions: ['barry', 'plain'],
  variationTinctureOptions: [
    ['azure', 'Or'],
    ['gules'],
  ],
};

describe('heraldry_snapshot', () => {
  it('truncates snapshot name from blazon', () => {
    const longBlazon = 'x'.repeat(HERALDRY_SNAPSHOT_NAME_MAX_LENGTH + 10);
    const snapshot = toHeraldrySnapshot(
      {
        device: {
          field: {
            name: 'plain',
            blazon: 'variation1',
            variationCount: 1,
            pattern: '',
            commonality: 1,
            variations: [],
          },
          chargeGroups: [],
        },
        blazon: longBlazon,
      },
      'seed',
      sampleGeneratorOptions,
    );
    expect(snapshot.name.length).toBe(HERALDRY_SNAPSHOT_NAME_MAX_LENGTH);
    expect(snapshot.name.endsWith('…')).toBe(true);
  });

  it('round-trips heraldry through JSON', () => {
    const cfg = mergeHeraldryGeneratorConfig({ chargeCount: 2 });
    const arms = generateHeraldry(cfg);
    const snapshot = toHeraldrySnapshot(arms, 'heraldry-snapshot-test', sampleGeneratorOptions);
    const json = JSON.stringify(snapshot);
    const parsed = JSON.parse(json) as typeof snapshot;
    const restored = heraldryFromSnapshot(parsed);

    expect(restored.blazon).toBe(arms.blazon);
    expect(restored.seed).toBe('heraldry-snapshot-test');
    expect(restored.generatorOptions).toEqual(sampleGeneratorOptions);
    expect(restored.arms.device.field.name).toBe(arms.device.field.name);
    expect(restored.arms.device.chargeGroups.length).toBe(arms.device.chargeGroups.length);

    if (arms.device.chargeGroups.length > 0) {
      const originalGroup = arms.device.chargeGroups[0];
      const restoredGroup = restored.arms.device.chargeGroups[0];
      expect(restoredGroup.charge.name).toBe(originalGroup.charge.name);
      expect(restoredGroup.charge.tincture.name).toBe(originalGroup.charge.tincture.name);
      expect(restoredGroup.arrangement.name).toBe(originalGroup.arrangement.name);
      expect(restoredGroup.numberOfCharges).toBe(originalGroup.numberOfCharges);
    }

    expect(restored.arms.device.field.variations.length).toBe(arms.device.field.variations.length);
    for (let i = 0; i < arms.device.field.variations.length; i++) {
      expect(restored.arms.device.field.variations[i].name).toBe(arms.device.field.variations[i].name);
      expect(restored.arms.device.field.variations[i].tinctures.map((t) => t.name)).toEqual(
        arms.device.field.variations[i].tinctures.map((t) => t.name),
      );
    }
  });

  it('defaultHeraldryGeneratorOptions returns all-any generator defaults', () => {
    expect(defaultHeraldryGeneratorOptions()).toEqual({
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
      fieldDivisionOption: 'any',
      variationSlotOptions: ['any', 'any'],
      variationTinctureOptions: [
        ['any', 'any'],
        ['any', 'any'],
      ],
    });
  });

  it('normalizeHeraldryGeneratorOptions fills defaults for legacy snapshots', () => {
    const legacy: HeraldryGeneratorOptionsSnapshot = {
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    };
    expect(normalizeHeraldryGeneratorOptions(legacy)).toEqual({
      ...legacy,
      fieldDivisionOption: 'any',
      variationSlotOptions: ['any', 'any'],
      variationTinctureOptions: [
        ['any', 'any'],
        ['any', 'any'],
      ],
    });
  });
});
