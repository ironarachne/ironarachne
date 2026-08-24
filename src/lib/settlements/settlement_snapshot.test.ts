import { describe, expect, it } from 'vitest';

import { settlementFromSnapshot } from './settlement_rehydrate';
import { toSettlementSnapshot } from './settlement_snapshot';
import { rollSettlement } from './settlement_roll';
import type { Settlement } from './settlement_types';

/**
 * The seeds are pinned, and each was chosen for what it produces rather than at random.
 *
 * `greyhaven` is the fully loaded case: every enrichment layer on, an organization whose emblem is
 * a coat of arms, and a leader carrying arms of their own — which together are all three of the
 * things in a settlement that are not plain data. `ashfall` is the same settings with a
 * merchant-mark emblem instead, so the emblem variants that need no rebuilding are exercised too.
 */
const LOADED_SEED = 'greyhaven';
const MERCHANT_MARK_SEED = 'ashfall';

const EVERY_LAYER = {
  size: 'large',
  includeTrade: true,
  includeProblems: true,
  includeOrganizations: true,
  includeNotables: true,
} as const;

/**
 * A snapshot as it comes back out of storage, rather than as it went in.
 *
 * The JSON pass is the point: it is what a stored payload has been through by the time anything
 * reads it, and it is what would expose a `Map` quietly flattened to `{}` or a key holding
 * `undefined`. Comparing a snapshot to itself in memory would prove nothing about either.
 */
function throughStorage(settlement: Settlement): Settlement {
  return settlementFromSnapshot(JSON.parse(JSON.stringify(toSettlementSnapshot(settlement))));
}

function loadedSettlement(): Settlement {
  return rollSettlement(LOADED_SEED, EVERY_LAYER).settlement;
}

describe('toSettlementSnapshot', () => {
  it('produces a payload that survives JSON, which is what storage does to it', () => {
    const snapshot = toSettlementSnapshot(loadedSettlement());
    expect(() => JSON.parse(JSON.stringify(snapshot))).not.toThrow();
  });

  it('stores an organization hierarchy as entries, because JSON empties a Map', () => {
    const settlement = loadedSettlement();
    const hierarchy = settlement.organizations?.[0]?.hierarchy;
    expect(hierarchy?.roleById.size).toBeGreaterThan(0);

    const stored = toSettlementSnapshot(settlement).organizations?.[0]?.hierarchy;
    expect(Array.isArray(stored?.roleById)).toBe(true);
    expect(stored?.roleById).toHaveLength(hierarchy?.roleById.size ?? 0);
    // The check that matters: this is the shape a Map takes when it is stored naively.
    expect(JSON.parse(JSON.stringify(hierarchy?.roleById))).toEqual({});
  });

  it('leaves the equipment tables behind, which is most of a settlement by weight', () => {
    const settlement = loadedSettlement();
    const archetype = settlement.importantPeople?.[0]?.character.archetype;
    expect(archetype?.equipmentGenerationConfigs).toBeDefined();

    const stored = toSettlementSnapshot(settlement).importantPeople?.[0]?.character.archetype;
    expect(stored).toBeDefined();
    expect(stored).not.toHaveProperty('equipmentGenerationConfigs');
    expect(stored?.name).toBe(archetype?.name);

    // Not a micro-optimisation: a campaign accumulates settlements, and the tables are what makes
    // one of them a megabyte rather than a few tens of kilobytes.
    const stored_bytes = JSON.stringify(toSettlementSnapshot(settlement)).length;
    expect(stored_bytes).toBeLessThan(JSON.stringify(settlement).length / 4);
  });

  it('carries no functions, which is what IndexedDB refuses outright', () => {
    const settlement = loadedSettlement();
    // The generator really does produce one, so the assertion below is testing something.
    expect(
      typeof settlement.organizations?.[0]?.leader.heraldry?.device.chargeGroups[0]?.arrangement
        .renderSVG,
    ).toBe('function');
    expect(functionPaths(toSettlementSnapshot(settlement))).toEqual([]);
  });
});

describe('settlementFromSnapshot', () => {
  it('round-trips a settlement with every enrichment layer on', () => {
    const settlement = loadedSettlement();
    expect(throughStorage(settlement)).toEqual(settlement);
  });

  it('round-trips a settlement with a non-heraldic emblem', () => {
    const settlement = rollSettlement(MERCHANT_MARK_SEED, EVERY_LAYER).settlement;
    expect(settlement.organizations?.[0]?.visualIdentity.emblem.kind).toBe('merchant_mark');
    expect(throughStorage(settlement)).toEqual(settlement);
  });

  /**
   * The risk this kind was chosen to find. `enrich_settlement.ts` is opt-in four times over, so a
   * settlement rolled with enrichment and one rolled without are different shapes of the same
   * kind, and both have to survive the same codec.
   */
  it('round-trips a settlement with no enrichment at all', () => {
    const settlement = rollSettlement(LOADED_SEED).settlement;
    expect(settlement.importantPeople).toBeUndefined();
    expect(settlement.organizations).toBeUndefined();
    expect(settlement.acuteProblems).toBeUndefined();
    expect(throughStorage(settlement)).toEqual(settlement);
  });

  it('round-trips each enrichment layer on its own', () => {
    const layers = [
      'includeTrade',
      'includeProblems',
      'includeOrganizations',
      'includeNotables',
    ] as const;
    for (const layer of layers) {
      const settlement = rollSettlement(LOADED_SEED, { size: 'large', [layer]: true }).settlement;
      expect(throughStorage(settlement)).toEqual(settlement);
    }
  });

  it('rebuilds an organization hierarchy as the Maps it was', () => {
    const settlement = loadedSettlement();
    const restored = throughStorage(settlement);
    const hierarchy = restored.organizations?.[0]?.hierarchy;
    expect(hierarchy?.roleById).toBeInstanceOf(Map);
    expect(hierarchy?.childToParent).toBeInstanceOf(Map);
    expect(hierarchy?.idToOrder).toBeInstanceOf(Map);
    expect(hierarchy?.roleById).toEqual(settlement.organizations?.[0]?.hierarchy.roleById);
  });

  it('rebuilds arms that can draw themselves again', () => {
    const restored = throughStorage(loadedSettlement());
    const arrangement =
      restored.organizations?.[0]?.leader.heraldry?.device.chargeGroups[0]?.arrangement;
    expect(typeof arrangement?.renderSVG).toBe('function');
  });

  /**
   * An archetype this build no longer has is not a reason to refuse a settlement. The tables are
   * what a character would be re-equipped from, which a saved settlement never is.
   */
  it('gives an unknown archetype no equipment tables rather than throwing', () => {
    const settlement = loadedSettlement();
    const snapshot = toSettlementSnapshot(settlement);
    const notable = snapshot.importantPeople?.[0];
    expect(notable?.character.archetype).toBeDefined();
    const renamed = {
      ...snapshot,
      importantPeople: [
        {
          ...notable!,
          character: {
            ...notable!.character,
            archetype: { ...notable!.character.archetype!, name: 'chronomancer' },
          },
        },
      ],
    };

    const restored = settlementFromSnapshot(renamed);
    expect(restored.importantPeople?.[0]?.character.archetype?.equipmentGenerationConfigs).toEqual(
      [],
    );
  });
});

/** Every path in a value that holds a function, for the "IndexedDB refuses this" assertion. */
function functionPaths(value: unknown, path = '$'): string[] {
  if (typeof value === 'function') {
    return [path];
  }
  if (value === null || typeof value !== 'object') {
    return [];
  }
  return Object.entries(value).flatMap(([key, child]) => functionPaths(child, `${path}.${key}`));
}
