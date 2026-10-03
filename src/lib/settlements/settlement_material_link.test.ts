import { describe, expect, it } from 'vitest';
import {
  isRegionalMaterialLink,
  regionalMaterialReference,
  regionalMaterialReferenceError,
} from './settlement_material_link';
import { migrateSettlementSnapshot, validateSettlementSnapshot } from './settlement_artifact_kind';
import { toSettlementSnapshot } from './settlement_snapshot';
import { settlementFromSnapshot } from './settlement_rehydrate';
import { rollSettlement } from './settlement_roll';
import { migrateRegionSnapshot } from '$lib/regions';
import { rollRegionSnapshot } from '$lib/regions';

const link = {
  regionTargetId: 'region-one',
  sourceSettlement: { kind: 'embedded' as const, settlementId: 'settlement:one' },
};
describe('material links and migrations', () => {
  it('requires an explicit valid link/null in the current payload', () => {
    const snapshot = toSettlementSnapshot(rollSettlement('material-link').settlement);
    expect(snapshot.regionalMaterialContext).toBeNull();
    for (const value of [
      undefined,
      'region',
      {},
      { ...link, regionTargetId: '' },
      { ...link, regionSnapshot: {} },
      { ...link, sourceSettlement: { ...link.sourceSettlement, snapshot: {} } },
      { ...link, sourceSettlement: { kind: 'future', targetId: 'one' } },
    ]) {
      expect(isRegionalMaterialLink(value)).toBe(false);
      expect(validateSettlementSnapshot({ ...snapshot, regionalMaterialContext: value }).ok).toBe(
        false,
      );
    }
    expect(
      isRegionalMaterialLink({ ...link, sourceSettlement: { kind: 'artifact', targetId: 'one' } }),
    ).toBe(true);
  });
  it('stores only identity through JSON and codec round trips', () => {
    const snapshot = {
      ...toSettlementSnapshot(rollSettlement('material-link').settlement),
      regionalMaterialContext: link,
    };
    const json = JSON.parse(JSON.stringify(snapshot));
    expect(validateSettlementSnapshot(json).ok).toBe(true);
    expect(toSettlementSnapshot(settlementFromSnapshot(json))).toEqual(snapshot);
    expect(Object.keys(snapshot.regionalMaterialContext)).toEqual([
      'regionTargetId',
      'sourceSettlement',
    ]);
  });
  it('requires one reference of the right kind and role', () => {
    expect(regionalMaterialReferenceError(link, [regionalMaterialReference(link)])).toBeNull();
    expect(regionalMaterialReferenceError(null, [])).toBeNull();
    for (const refs of [
      [],
      [{ targetId: 'wrong', targetKind: 'region', role: 'material-context' }],
      [{ targetId: 'region-one', targetKind: 'culture', role: 'material-context' }],
    ])
      expect(regionalMaterialReferenceError(link, refs)).not.toBeNull();
    expect(regionalMaterialReferenceError(null, [regionalMaterialReference(link)])).not.toBeNull();
  });
  it.each([1, 2, 3])('migrates settlement v%s without adding contextual content', (version) => {
    const snapshot = toSettlementSnapshot(rollSettlement('material-link').settlement);
    const { regionalMaterialContext: _link, ...old } = snapshot;
    const migrated = migrateSettlementSnapshot(old, version);
    expect(migrated).toEqual({ ok: true, value: snapshot });
    expect(old).not.toHaveProperty('regionalMaterialContext');
  });
  it('adds null to embedded v8 settlements without touching region facts or map', () => {
    const snapshot = rollRegionSnapshot('region-material-migration');
    const old = {
      ...snapshot,
      settlements: snapshot.settlements.map((entry) => {
        const { regionalMaterialContext: _link, ...stored } = entry.snapshot;
        return { ...entry, snapshot: stored };
      }),
    };
    expect(migrateRegionSnapshot(old, 8)).toEqual({ ok: true, value: snapshot });
    expect(old.settlements[0].snapshot).not.toHaveProperty('regionalMaterialContext');
  });
});
