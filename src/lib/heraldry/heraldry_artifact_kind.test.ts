import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import { generateHeraldry } from './generator.js';
import { mergeHeraldryGeneratorConfig } from './generatorconfig.js';
import {
  heraldryArtifactKind,
  HERALDRY_ARTIFACT_KIND,
  HERALDRY_PAYLOAD_VERSION,
  migrateHeraldrySnapshot,
  validateHeraldrySnapshot,
} from './heraldry_artifact_kind.js';
import {
  toHeraldrySnapshot,
  type HeraldryGeneratorOptionsSnapshot,
  type HeraldrySnapshot,
  type RestoredHeraldry,
} from './heraldry_snapshot.js';

const currentOptions: HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: 'any',
  chargeTinctureName: 'gules',
  numberOfChargesOption: 'one',
  chargePosition: 'normal',
  lockSeed: true,
  fieldDivisionOption: 'pale',
  variationSlotOptions: ['barry', 'plain', 'any'],
  variationTinctureOptions: [['azure', 'Or'], ['gules'], ['any', 'any']],
};

function restoredHeraldry(): RestoredHeraldry {
  const arms = generateHeraldry(mergeHeraldryGeneratorConfig({ chargeCount: 2 }));
  return {
    arms,
    seed: 'heraldry-artifact-kind',
    blazon: arms.blazon,
    generatorOptions: currentOptions,
  };
}

/** What sits in `generator.heraldry` in browsers today: no field division, no variation options. */
function version1Payload(): Record<string, unknown> {
  const snapshot = toHeraldrySnapshot(restoredHeraldry().arms, 'legacy-seed', currentOptions);
  return {
    ...snapshot,
    generatorOptions: {
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    },
  };
}

describe('heraldryArtifactKind', () => {
  it('declares its kind, name, and current payload version', () => {
    expect(heraldryArtifactKind.kind).toBe(HERALDRY_ARTIFACT_KIND);
    expect(heraldryArtifactKind.displayName).toBe('Coat of Arms');
    expect(heraldryArtifactKind.payloadVersion).toBe(HERALDRY_PAYLOAD_VERSION);
  });

  it('round-trips arms through JSON without losing the device or the options', async () => {
    const value = restoredHeraldry();
    const { toSnapshot, fromSnapshot } = await heraldryArtifactKind.loadCodec();

    const snapshot = toSnapshot(value);
    const parsed = JSON.parse(JSON.stringify(snapshot)) as HeraldrySnapshot;
    const restored = fromSnapshot(parsed, new RNG('unused'));

    expect(restored.blazon).toBe(value.arms.blazon);
    expect(restored.seed).toBe(value.seed);
    expect(restored.generatorOptions).toEqual(currentOptions);
    expect(restored.arms.device.field.name).toBe(value.arms.device.field.name);
    expect(restored.arms.device.chargeGroups.map((group) => group.charge.name)).toEqual(
      value.arms.device.chargeGroups.map((group) => group.charge.name),
    );
  });

  it('takes its default name from the blazon, truncated', async () => {
    const { toSnapshot } = await heraldryArtifactKind.loadCodec();
    const snapshot = toSnapshot(restoredHeraldry());
    expect(heraldryArtifactKind.nameOf(snapshot)).toBe(snapshot.name);
  });

  it('falls back to the blazon when a snapshot has no name', () => {
    const snapshot = { ...version1Payload(), name: '   ', blazon: 'Per pale' } as HeraldrySnapshot;
    expect(heraldryArtifactKind.nameOf(snapshot)).toBe('Per pale');
  });
});

describe('validateHeraldrySnapshot', () => {
  it('accepts a snapshot this build wrote', async () => {
    const { toSnapshot } = await heraldryArtifactKind.loadCodec();
    const result = validateHeraldrySnapshot(toSnapshot(restoredHeraldry()));
    expect(result.ok).toBe(true);
  });

  it.each([
    ['not an object', 'Or, a lion rampant'],
    ['missing the blazon', { name: 'a', seed: 'b', generatorOptions: currentOptions, device: {} }],
  ])('rejects a payload %s', (_label, payload) => {
    const result = validateHeraldrySnapshot(payload);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });

  it('rejects a version 1 payload, naming what is missing', () => {
    const result = validateHeraldrySnapshot(version1Payload());
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('version 1 payload');
  });

  it('rejects a device whose charge groups are not stored charge groups', async () => {
    const { toSnapshot } = await heraldryArtifactKind.loadCodec();
    const snapshot = toSnapshot(restoredHeraldry());
    const result = validateHeraldrySnapshot({
      ...snapshot,
      device: { ...snapshot.device, chargeGroups: [{ chargeName: 'lion' }] },
    });
    expect(result.ok === false && result.message).toContain('charge groups');
  });

  it('rejects generator options that are not options', async () => {
    const { toSnapshot } = await heraldryArtifactKind.loadCodec();
    const snapshot = toSnapshot(restoredHeraldry());
    const result = validateHeraldrySnapshot({ ...snapshot, generatorOptions: { lockSeed: 'yes' } });
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });
});

describe('migrateHeraldrySnapshot', () => {
  it('brings a real version 1 payload up to version 2 by filling in the missing options', () => {
    const result = migrateHeraldrySnapshot(version1Payload(), 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.generatorOptions).toEqual({
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
      fieldDivisionOption: 'any',
      variationSlotOptions: ['any', 'any', 'any'],
      variationTinctureOptions: [
        ['any', 'any'],
        ['any', 'any'],
        ['any', 'any'],
      ],
    });
    expect(validateHeraldrySnapshot(result.value).ok).toBe(true);
  });

  it('leaves the device and blazon of a migrated payload alone', () => {
    const legacy = version1Payload();
    const result = migrateHeraldrySnapshot(legacy, 1);
    expect(result.ok && result.value.blazon).toBe(legacy.blazon);
    expect(result.ok && result.value.device).toEqual(legacy.device);
  });

  it('keeps the options a version 1 payload happened to have', () => {
    const legacy = version1Payload();
    const partial = {
      ...legacy,
      generatorOptions: { ...(legacy.generatorOptions as object), fieldDivisionOption: 'pale' },
    };
    const result = migrateHeraldrySnapshot(partial, 1);
    expect(result.ok && result.value.generatorOptions.fieldDivisionOption).toBe('pale');
  });

  it('refuses a version it has no step for', () => {
    const result = migrateHeraldrySnapshot(version1Payload(), 0);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  it('rejects a payload that is not a heraldry record at all', () => {
    expect(migrateHeraldrySnapshot('arms', 1).ok).toBe(false);
    expect(migrateHeraldrySnapshot({ name: 'a', seed: 'b', blazon: 'c' }, 1).ok).toBe(false);
  });
});
