import { describe, expect, it } from 'vitest';

import {
  ITEM_ARTIFACT_KIND,
  ITEM_PAYLOAD_VERSION,
  itemArtifactKind,
  itemName,
  migrateItemSnapshot,
  validateItemSnapshot,
} from './item_artifact_kind';
import { rollItem } from './item_roll';
import { DEFAULT_ITEM_DENSITY, DEFAULT_ITEM_RARITY, toItemSnapshot } from './item_snapshot';

const CONFIG = {
  itemMajorType: 'any' as const,
  useRefine: true,
  useEnchant: true,
  useDecorate: true,
};

const ITEM = toItemSnapshot(rollItem('kind-seed', CONFIG));

function accepted(payload: unknown) {
  const result = validateItemSnapshot(payload);
  if (!result.ok) {
    throw new Error(`expected an accepted payload, got: ${result.message}`);
  }
  return result.value;
}

describe('itemArtifactKind', () => {
  it('registers the id and version the pass assigned it', () => {
    expect(itemArtifactKind.kind).toBe(ITEM_ARTIFACT_KIND);
    expect(ITEM_ARTIFACT_KIND).toBe('item');
    expect(itemArtifactKind.payloadVersion).toBe(ITEM_PAYLOAD_VERSION);
    expect(ITEM_PAYLOAD_VERSION).toBe(1);
  });

  it('loads a codec that round-trips', async () => {
    const codec = await itemArtifactKind.loadCodec();

    expect(codec.fromSnapshot(codec.toSnapshot(ITEM), undefined as never)).toEqual(ITEM);
  });
});

describe('validateItemSnapshot', () => {
  it('accepts a rolled item unchanged', () => {
    expect(accepted(ITEM)).toEqual(ITEM);
  });

  it('accepts one that has been through storage', () => {
    expect(accepted(JSON.parse(JSON.stringify(ITEM)))).toEqual(ITEM);
  });

  it('refuses anything that is not an object', () => {
    for (const payload of [null, undefined, 42, 'sword', ['sword']]) {
      expect(validateItemSnapshot(payload).ok, String(payload)).toBe(false);
    }
  });

  it('refuses a payload missing a field every reader depends on', () => {
    for (const field of ['id', 'name', 'itemMajorType', 'description', 'value', 'weight']) {
      const broken: Record<string, unknown> = { ...ITEM };
      delete broken[field];
      const result = validateItemSnapshot(broken);

      expect(result.ok, field).toBe(false);
      expect(result.ok ? '' : result.message).toContain(field);
    }
  });

  it('refuses a value or weight that is not a finite number', () => {
    expect(validateItemSnapshot({ ...ITEM, value: 'a lot' }).ok).toBe(false);
    expect(validateItemSnapshot({ ...ITEM, weight: Number.NaN }).ok).toBe(false);
  });

  it('accepts an emptied name, because clearing one is an editing decision', () => {
    // 3.3 asks for a well-defined empty result rather than a refusal.
    expect(accepted({ ...ITEM, name: '' }).name).toBe('');
  });

  it('falls back rather than refusing on a rarity or density it does not know', () => {
    // The discipline docs/workshop.md asks of a project's genre: a payload from a build with a
    // sixth rarity loses the field, not the item.
    expect(accepted({ ...ITEM, rarity: 'mythic' }).rarity).toBe(DEFAULT_ITEM_RARITY);
    expect(accepted({ ...ITEM, densityCategory: 'squishy' }).densityCategory).toBe(
      DEFAULT_ITEM_DENSITY,
    );
  });

  it('empties properties that are not a list of strings', () => {
    expect(accepted({ ...ITEM, properties: 'sharp' }).properties).toEqual([]);
    expect(accepted({ ...ITEM, properties: [1, 2] }).properties).toEqual([]);
  });

  it('drops a composition part that is not a record, and keeps one that is', () => {
    expect(accepted({ ...ITEM, material: 'iron' }).material).toBeUndefined();
    expect(accepted({ ...ITEM, material: { name: 'iron' } }).material).toEqual({ name: 'iron' });
  });

  it('drops an empty optional name rather than storing it blank', () => {
    expect(accepted({ ...ITEM, uniqueName: '' }).uniqueName).toBeUndefined();
    expect(accepted({ ...ITEM, itemMinorType: '' }).itemMinorType).toBeUndefined();
  });
});

describe('migrateItemSnapshot', () => {
  it('rejects rather than pretending there has been another shape', () => {
    // Requirement 7.3 has one step to exercise and it is the absence of one: version 1 is the only
    // shape there has been, and a migration that quietly accepted anything would be worse than none.
    const result = migrateItemSnapshot({ name: 'sword' }, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
    expect(result.ok ? '' : result.message).toContain('payload version 0');
  });
});

describe('itemName', () => {
  it('prefers the unique name, which is what a magic item is called', () => {
    // 3.5 carries unusual weight here: an unnamed item in a list of forty is unusable.
    expect(itemName({ ...ITEM, name: 'longsword', uniqueName: 'Bitterlight' })).toBe('Bitterlight');
  });

  it('falls back to the plain name, then to the kind', () => {
    expect(itemName({ ...ITEM, name: 'longsword', uniqueName: '  ' })).toBe('longsword');
    expect(itemName({ ...ITEM, name: '  ', uniqueName: undefined })).toBe('Item');
  });
});
