import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  armsManufacturerArtifactKind,
  ARMS_MANUFACTURER_ARTIFACT_KIND,
  ARMS_MANUFACTURER_PAYLOAD_VERSION,
  migrateArmsManufacturerSnapshot,
  validateArmsManufacturerSnapshot,
} from './arms_manufacturer_artifact_kind.js';
import { rollArmsManufacturerSnapshot } from './arms_manufacturer_roll.js';
import type { ArmsManufacturerSnapshot } from './arms_manufacturer_snapshot.js';

/** A stored payload, as anything reading one actually receives it. */
const snapshot = JSON.parse(JSON.stringify(rollArmsManufacturerSnapshot('kind-fixture'))) as Record<
  string,
  unknown
>;

const model = {
  name: 'XR-7 Laser Rifle',
  maker: '',
  damage: 'energy',
  cosmetics: ['a matte finish'],
  effects: ['fires in bursts'],
  description: 'A rifle that fires in bursts and has a matte finish.',
};

describe('the arms manufacturer artifact kind', () => {
  /** Its own kind, unqualified: neither a game system nor a setting, and not an `organization`. */
  it('is registered under its own name', () => {
    expect(ARMS_MANUFACTURER_ARTIFACT_KIND).toBe('arms-manufacturer');
    expect(armsManufacturerArtifactKind.kind).toBe('arms-manufacturer');
    expect(armsManufacturerArtifactKind.displayName).toBe('Arms Manufacturer');
    expect(armsManufacturerArtifactKind.payloadVersion).toBe(ARMS_MANUFACTURER_PAYLOAD_VERSION);
    expect(armsManufacturerArtifactKind.icon).not.toBe('');
  });

  it('names a saved manufacturer after the company', () => {
    expect(
      armsManufacturerArtifactKind.nameOf({
        name: 'Vex Heavy Industries',
        description: '',
        models: [],
      }),
    ).toBe('Vex Heavy Industries');
  });

  it('names a manufacturer with no name by its kind', () => {
    expect(armsManufacturerArtifactKind.nameOf({ name: '  ', description: '', models: [] })).toBe(
      'Arms Manufacturer',
    );
  });

  it('accepts a payload the generator produced', () => {
    expect(validateArmsManufacturerSnapshot(snapshot).ok).toBe(true);
  });

  /** 3.3: an emptied manufacturer is a well-defined result, not a refusal. */
  it('accepts a manufacturer with no models and no name left', () => {
    expect(validateArmsManufacturerSnapshot({ name: '', description: '', models: [] }).ok).toBe(
      true,
    );
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'Vex', 42, [{ name: 'Vex' }]]) {
      const result = validateArmsManufacturerSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing either text field', () => {
    expect(validateArmsManufacturerSnapshot({ description: '', models: [] }).ok).toBe(false);
    expect(validateArmsManufacturerSnapshot({ name: 'Vex', models: [] }).ok).toBe(false);
    expect(validateArmsManufacturerSnapshot({ name: 3, description: '', models: [] }).ok).toBe(
      false,
    );
  });

  it('rejects a payload with no model list', () => {
    expect(validateArmsManufacturerSnapshot({ name: 'Vex', description: '' }).ok).toBe(false);
    expect(
      validateArmsManufacturerSnapshot({ name: 'Vex', description: '', models: 'XR-7' }).ok,
    ).toBe(false);
  });

  it('rejects a model missing any of its six fields', () => {
    const fields = Object.keys(model) as (keyof typeof model)[];
    for (const field of fields) {
      const broken: Record<string, unknown> = { ...model };
      delete broken[field];
      expect(
        validateArmsManufacturerSnapshot({ name: 'Vex', description: '', models: [broken] }).ok,
      ).toBe(false);
    }
  });

  it('rejects a model whose lists are not lists of strings', () => {
    expect(
      validateArmsManufacturerSnapshot({
        name: 'Vex',
        description: '',
        models: [{ ...model, cosmetics: [1] }],
      }).ok,
    ).toBe(false);
    expect(
      validateArmsManufacturerSnapshot({
        name: 'Vex',
        description: '',
        models: [{ ...model, effects: 'bursts' }],
      }).ok,
    ).toBe(false);
  });

  it('accepts a model with every field in place', () => {
    expect(
      validateArmsManufacturerSnapshot({ name: 'Vex', description: '', models: [model] }).ok,
    ).toBe(true);
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateArmsManufacturerSnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    expect(
      readArtifactPayload(
        armsManufacturerArtifactKind as AnyArtifactKindEntry,
        snapshot,
        ARMS_MANUFACTURER_PAYLOAD_VERSION,
      ).ok,
    ).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    expect(
      readArtifactPayload(
        armsManufacturerArtifactKind as AnyArtifactKindEntry,
        snapshot,
        ARMS_MANUFACTURER_PAYLOAD_VERSION + 1,
      ).ok,
    ).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await armsManufacturerArtifactKind.loadCodec();
    const accepted = validateArmsManufacturerSnapshot(snapshot);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value as ArmsManufacturerSnapshot, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
