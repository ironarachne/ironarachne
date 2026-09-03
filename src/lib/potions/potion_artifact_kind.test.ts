import { describe, expect, it } from 'vitest';

import {
  POTION_ARTIFACT_KIND,
  POTION_PAYLOAD_VERSION,
  migratePotionSnapshot,
  potionArtifactKind,
  potionName,
  validatePotionSnapshot,
} from './potion_artifact_kind';
import { defaultPotionGeneratorConfigRecord, rollPotionSnapshot } from './potion_roll';

const POTION = rollPotionSnapshot('kind-seed', defaultPotionGeneratorConfigRecord());

function accepted(payload: unknown) {
  const result = validatePotionSnapshot(payload);
  if (!result.ok) {
    throw new Error(`expected an accepted payload, got: ${result.message}`);
  }
  return result.value;
}

describe('potionArtifactKind', () => {
  it('registers the id and version the pass assigned it', () => {
    expect(potionArtifactKind.kind).toBe(POTION_ARTIFACT_KIND);
    expect(POTION_ARTIFACT_KIND).toBe('potion');
    expect(potionArtifactKind.payloadVersion).toBe(POTION_PAYLOAD_VERSION);
    expect(POTION_PAYLOAD_VERSION).toBe(1);
  });

  it('is its own kind rather than a share of `item`', () => {
    // Decision 2 of docs/readiness-objects.md, and a correction to what #68 assumed.
    expect(POTION_ARTIFACT_KIND).not.toBe('item');
  });

  it('loads a codec that round-trips', async () => {
    const codec = await potionArtifactKind.loadCodec();

    expect(codec.toSnapshot(codec.fromSnapshot(POTION, undefined as never))).toEqual(POTION);
  });
});

describe('validatePotionSnapshot', () => {
  it('accepts a rolled potion unchanged', () => {
    expect(accepted(POTION)).toEqual(POTION);
  });

  it('accepts one that has been through storage', () => {
    expect(accepted(JSON.parse(JSON.stringify(POTION)))).toEqual(POTION);
  });

  it('refuses anything that is not an object', () => {
    for (const payload of [null, undefined, 42, 'a potion', ['a potion']]) {
      expect(validatePotionSnapshot(payload).ok, String(payload)).toBe(false);
    }
  });

  it('refuses a payload with no display name, container, liquid or effect', () => {
    for (const field of ['displayName', 'container', 'liquid', 'effect']) {
      const broken: Record<string, unknown> = { ...POTION };
      delete broken[field];

      expect(validatePotionSnapshot(broken).ok, field).toBe(false);
    }
  });

  it('refuses an effect with no name, which every reader prints', () => {
    expect(validatePotionSnapshot({ ...POTION, effect: { description: 'x' } }).ok).toBe(false);
  });

  it('accepts an emptied display name, because clearing one is an editing decision', () => {
    // 3.3 asks for a well-defined empty result rather than a refusal.
    expect(accepted({ ...POTION, displayName: '' }).displayName).toBe('');
  });

  it('reads a missing sensory field as empty prose rather than refusing', () => {
    const sparse = accepted({ ...POTION, sensory: { appearance: 'cloudy' } });

    expect(sparse.sensory).toEqual({
      appearance: 'cloudy',
      viscosity: '',
      flavor: '',
      scent: '',
    });
  });

  it('drops a modification with no recognisable tag', () => {
    expect(
      accepted({ ...POTION, modifications: [{ kind: 'tainted' }, 'tainted', {}] }).modifications,
    ).toEqual([{ kind: 'tainted' }]);
  });

  it('empties modifications that are not a list', () => {
    expect(accepted({ ...POTION, modifications: 'tainted' }).modifications).toEqual([]);
  });

  it('keeps a parameters union this build may not know', () => {
    // The presentation reads it defensively; refusing a potion over a parameter nothing prints
    // would lose the whole artifact to save a line.
    const exotic = accepted({
      ...POTION,
      effect: { ...POTION.effect, parameters: { kind: 'chronomantic', turns: 3 } },
    });

    expect(exotic.effect.parameters).toEqual({ kind: 'chronomantic', turns: 3 });
  });

  it('drops an empty base formula rather than storing it blank', () => {
    expect(accepted({ ...POTION, canonicalName: '' }).canonicalName).toBeUndefined();
  });
});

describe('migratePotionSnapshot', () => {
  it('rejects rather than pretending there has been another shape', () => {
    // Requirement 7.3 has one step to exercise and it is the absence of one.
    const result = migratePotionSnapshot({ displayName: 'x' }, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
    expect(result.ok ? '' : result.message).toContain('payload version 0');
  });
});

describe('potionName', () => {
  it('prefers the label on the bottle', () => {
    expect(potionName(POTION)).toBe(POTION.displayName);
  });

  it('falls back to the base formula, then to the kind', () => {
    expect(potionName({ ...POTION, displayName: '  ', canonicalName: 'Potion of Healing' })).toBe(
      'Potion of Healing',
    );
    expect(potionName({ ...POTION, displayName: '', canonicalName: undefined })).toBe('Potion');
  });
});
