import { describe, expect, it } from 'vitest';

import { generateHeraldry } from './generator.js';
import { mergeHeraldryGeneratorConfig } from './generatorconfig.js';
import { heraldryFromSnapshot } from './heraldry_rehydrate.js';
import { toHeraldrySnapshot, type HeraldryGeneratorOptionsSnapshot } from './heraldry_snapshot.js';

const sampleGeneratorOptions: HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: 'any',
  chargeTinctureName: 'gules',
  numberOfChargesOption: 'one',
  chargePosition: 'normal',
  lockSeed: true,
  fieldDivisionOption: 'pale',
  variationSlotOptions: ['barry', 'plain'],
  variationTinctureOptions: [['azure', 'Or'], ['gules']],
};

describe('heraldry_rehydrate', () => {
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
      expect(restored.arms.device.field.variations[i].name).toBe(
        arms.device.field.variations[i].name,
      );
      expect(restored.arms.device.field.variations[i].tinctures.map((t) => t.name)).toEqual(
        arms.device.field.variations[i].tinctures.map((t) => t.name),
      );
    }
  });

  it('fills in the generator options a version 1 snapshot never had', () => {
    const arms = generateHeraldry(mergeHeraldryGeneratorConfig({ chargeCount: 1 }));
    const snapshot = toHeraldrySnapshot(arms, 'legacy-seed', {
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    });

    expect(heraldryFromSnapshot(snapshot).generatorOptions.fieldDivisionOption).toBe('any');
  });

  it('throws for a charge this build no longer has', () => {
    const arms = generateHeraldry(mergeHeraldryGeneratorConfig({ chargeCount: 1 }));
    const snapshot = toHeraldrySnapshot(arms, 'seed', sampleGeneratorOptions);
    const withMissingCharge = {
      ...snapshot,
      device: {
        ...snapshot.device,
        chargeGroups: [{ ...snapshot.device.chargeGroups[0], chargeName: 'no-such-charge' }],
      },
    };

    expect(() => heraldryFromSnapshot(withMissingCharge)).toThrow(/no-such-charge/);
  });
});
