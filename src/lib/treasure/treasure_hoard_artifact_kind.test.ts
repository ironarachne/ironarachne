import { describe, expect, it } from 'vitest';

import {
  TREASURE_HOARD_ARTIFACT_KIND,
  TREASURE_HOARD_PAYLOAD_VERSION,
  migrateTreasureHoardSnapshot,
  treasureHoardArtifactKind,
  treasureHoardName,
  validateTreasureHoardSnapshot,
} from './treasure_hoard_artifact_kind';
import { defaultTreasureHoardConfigRecord, rollTreasureHoardSnapshot } from './treasure_hoard_roll';
import { withLegacyHoardMechanics, withLegacyItemMechanics } from '$lib/rulesets';

const HOARD = rollTreasureHoardSnapshot('kind-seed', defaultTreasureHoardConfigRecord());

function current(payload: Record<string, unknown>): unknown {
  const items = Array.isArray(payload.items)
    ? payload.items.map((item) =>
        typeof item === 'object' && item !== null
          ? withLegacyItemMechanics(item, 'generated')
          : item,
      )
    : payload.items;
  return withLegacyHoardMechanics({ ...payload, items }, 'generated');
}

function accepted(payload: unknown) {
  const result = validateTreasureHoardSnapshot(payload);
  if (!result.ok) {
    throw new Error(`expected an accepted payload, got: ${result.message}`);
  }
  return result.value;
}

describe('treasureHoardArtifactKind', () => {
  it('registers the id and version the pass assigned it', () => {
    expect(treasureHoardArtifactKind.kind).toBe(TREASURE_HOARD_ARTIFACT_KIND);
    expect(TREASURE_HOARD_ARTIFACT_KIND).toBe('treasure-hoard');
    expect(treasureHoardArtifactKind.payloadVersion).toBe(TREASURE_HOARD_PAYLOAD_VERSION);
    expect(TREASURE_HOARD_PAYLOAD_VERSION).toBe(2);
  });

  it('loads a codec that round-trips', async () => {
    const codec = await treasureHoardArtifactKind.loadCodec();

    expect(codec.toSnapshot(codec.fromSnapshot(HOARD, undefined as never))).toEqual(HOARD);
  });
});

describe('validateTreasureHoardSnapshot', () => {
  it('accepts a rolled hoard unchanged', () => {
    expect(accepted(HOARD)).toEqual(HOARD);
  });

  it('accepts one that has been through storage', () => {
    expect(accepted(JSON.parse(JSON.stringify(HOARD)))).toEqual(HOARD);
  });

  it('refuses anything that is not an object with an item list', () => {
    for (const payload of [null, undefined, 42, 'a hoard', ['a hoard'], { targetValue: 1 }]) {
      expect(validateTreasureHoardSnapshot(payload).ok, String(payload)).toBe(false);
    }
  });

  it('accepts a hoard the party has carried off entirely', () => {
    // 3.3 asks for a well-defined empty result rather than a refusal.
    expect(accepted(current({ targetValue: 100, items: [] })).items).toEqual([]);
  });

  it('drops an item with no id, which nothing could place', () => {
    // The id is what a container's `contents` points at, so an item that has lost it would show
    // twice: once in a chest it is no longer in, and once loose.
    const mixed = accepted(
      current({
        targetValue: 100,
        items: [{ name: 'a nameless thing', value: 5 }, HOARD.items[0]],
      }),
    );

    expect(mixed.items).toEqual([HOARD.items[0]]);
  });

  it('reads a missing number as zero rather than refusing', () => {
    const sparse = accepted(current({ targetValue: 100, items: [{ id: 'x', name: 'a thing' }] }));

    expect(sparse.items[0]).toMatchObject({ id: 'x', name: 'a thing', value: 0, weight: 0 });
  });

  it('keeps an empty contents list, which is what says "this is an empty container"', () => {
    // Its absence says "this is not a container at all", which is a different thing.
    const chest = accepted(
      current({ targetValue: 0, items: [{ id: 'c', name: 'a chest', contents: [] }] }),
    );

    expect(chest.items[0].contents).toEqual([]);
  });

  it('drops an extra that is not the right type', () => {
    const odd = accepted(
      current({
        targetValue: 0,
        items: [{ id: 'g', name: 'a gem', cut: 4, quantity: 'lots', isCut: 'yes' }],
      }),
    );

    expect('cut' in odd.items[0]).toBe(false);
    expect('quantity' in odd.items[0]).toBe(false);
    expect('isCut' in odd.items[0]).toBe(false);
  });

  it('reads a missing target value as nothing rather than refusing', () => {
    expect(accepted(current({ items: [] })).targetValue).toBe(0);
  });
});

describe('migrateTreasureHoardSnapshot', () => {
  it('copies the hoard and every item mechanics field into migrated variants', () => {
    const { mechanics: _hoardMechanics, ...legacy } = HOARD;
    const legacyItems = legacy.items.map(({ mechanics: _itemMechanics, ...item }) => item);
    const result = migrateTreasureHoardSnapshot({ ...legacy, items: legacyItems }, 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.targetValue).toBe(legacy.targetValue);
      expect(result.value.mechanics.variants[0]).toMatchObject({
        subject: 'hoard',
        origin: 'migrated',
        payload: { targetValue: legacy.targetValue },
      });
      expect(result.value.items[0].mechanics.variants[0]).toMatchObject({
        subject: 'item',
        origin: 'migrated',
        payload: { value: legacyItems[0].value },
      });
    }
  });

  it('rejects rather than pretending there has been another shape', () => {
    // Requirement 7.3 has one step to exercise and it is the absence of one.
    const result = migrateTreasureHoardSnapshot({ items: [] }, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
    expect(result.ok ? '' : result.message).toContain('payload version 0');
  });
});

describe('treasureHoardName', () => {
  it('says how big it is, which is what a hoard has instead of a name', () => {
    expect(treasureHoardName(HOARD)).toBe(`Treasure Hoard (${HOARD.items.length} items)`);
    expect(treasureHoardName({ targetValue: 0, items: [], mechanics: { variants: [] } })).toBe(
      'Treasure Hoard',
    );
  });
});
