import { describe, expect, it } from 'vitest';

import {
  DRUG_ARTIFACT_KIND,
  DRUG_PAYLOAD_VERSION,
  drugArtifactKind,
  migrateDrugSnapshot,
  validateDrugSnapshot,
} from './drug_artifact_kind';
import { rollDrugSnapshot } from './drug_roll';

const snapshot = rollDrugSnapshot('kind-seed');

/** A copy of the good payload with one part replaced, for the rejection cases. */
function broken(changes: Record<string, unknown>): unknown {
  return { ...(snapshot as unknown as Record<string, unknown>), ...changes };
}

describe('the drug artifact kind', () => {
  it('is registered under a stable, unqualified id', () => {
    expect(drugArtifactKind.kind).toEqual(DRUG_ARTIFACT_KIND);
    expect(DRUG_ARTIFACT_KIND).toEqual('drug');
  });

  it('is its own kind rather than a share of `item`', () => {
    // Decision 1 of docs/readiness-objects.md gives `item` to the tools that produce the same
    // payload shape. A drug has no material, rarity, weight or combat profile, and an item has no
    // method of ingestion.
    expect(DRUG_ARTIFACT_KIND).not.toEqual('item');
  });

  it('declares the payload version it writes', () => {
    expect(drugArtifactKind.payloadVersion).toEqual(DRUG_PAYLOAD_VERSION);
  });

  it('names a saved drug by its street name', () => {
    expect(drugArtifactKind.nameOf(snapshot)).toEqual(snapshot.name);
  });

  it('falls back to the kind when the name has been emptied', () => {
    expect(drugArtifactKind.nameOf({ ...snapshot, name: '  ' })).toEqual('Drug');
  });

  it('round-trips through its own codec', async () => {
    const codec = await drugArtifactKind.loadCodec();
    expect(codec.toSnapshot(codec.fromSnapshot(snapshot, undefined as never))).toEqual(snapshot);
  });
});

describe('validating a stored drug', () => {
  it('accepts what the generator wrote', () => {
    expect(validateDrugSnapshot(snapshot).ok).toBe(true);
  });

  it('accepts one a user has emptied field by field', () => {
    // Every one of the eleven may be empty: clearing the side effects of a drug is an editing
    // decision, and 3.3 asks for a well-defined empty result rather than a refusal.
    const emptied = Object.fromEntries(Object.keys(snapshot).map((key) => [key, '']));
    expect(validateDrugSnapshot(emptied).ok).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    expect(validateDrugSnapshot('a drug')).toMatchObject({
      ok: false,
      reason: 'invalid-payload',
    });
  });

  it('rejects a payload missing any one of the eleven fields', () => {
    for (const field of Object.keys(snapshot)) {
      const { [field]: _dropped, ...rest } = snapshot as unknown as Record<string, unknown>;
      expect(validateDrugSnapshot(rest), field).toMatchObject({ ok: false });
    }
  });

  it('rejects a field that is not a string', () => {
    // `undefined` would print as the word once the presentation joined the fields.
    expect(validateDrugSnapshot(broken({ strength: 7 }))).toMatchObject({ ok: false });
    expect(validateDrugSnapshot(broken({ sideEffect: null }))).toMatchObject({ ok: false });
  });

  it('says which field it rejected', () => {
    const result = validateDrugSnapshot(broken({ color: 12 }));
    expect(result.ok ? '' : result.message).toContain('color');
  });
});

describe('migrating a stored drug (7.3)', () => {
  it('rejects every version, because version 1 is the only shape there has been', () => {
    // The whole of this kind's migration story today, asserted so that the day a version 2 lands
    // this test is what has to change rather than something that silently drops a user's work.
    const result = migrateDrugSnapshot(snapshot, 0);
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(result.ok ? '' : result.message).toContain('version 0');
  });
});
