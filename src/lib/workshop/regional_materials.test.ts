import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createArtifact,
  readArtifact,
  deleteArtifact,
  resetArtifactIndex,
  updateArtifactPayload,
} from '$lib/artifacts';
import { closeVault } from '$lib/vault_db';
import { rollRegionSnapshot } from '$lib/regions';
import { rollSettlement, toSettlementSnapshot, regionalMaterialReference } from '$lib/settlements';
import { ARTIFACT_KINDS } from './artifact_kind_catalog';
import { saveToolArtifact } from './artifact_saving';
import { saveArtifactEdits, openArtifactForEditing, rerollArtifact } from './artifact_editing';
import { resolveRegionalMaterials } from './regional_materials';
import { collectProjectPdfArtifacts } from '$lib/pdf';

beforeEach(() => {
  closeVault();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});
afterEach(() => {
  closeVault();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});
const region = rollRegionSnapshot('regional-material-store');
const standalone = toSettlementSnapshot(rollSettlement('regional-material-consumer').settlement);
async function source() {
  const saved = await createArtifact(
    ARTIFACT_KINDS,
    { projectId: 'p1', kind: 'region', payload: region, name: 'Source region' },
    { id: 'region-one' },
  );
  expect(saved.ok).toBe(true);
  return {
    regionTargetId: 'region-one',
    sourceSettlement: { kind: 'embedded' as const, settlementId: region.settlements[0].id },
  };
}

describe('regional material persistence and resolution', () => {
  it('rejects absent/wrong references at the generator save boundary', async () => {
    const link = await source();
    for (const references of [
      [],
      [{ targetId: 'region-one', targetKind: 'culture', role: 'material-context' }],
    ]) {
      expect(
        await saveToolArtifact('p1', {
          kind: 'settlement',
          toolPath: '/fantasy/settlement',
          payload: { ...standalone, regionalMaterialContext: link },
          references,
        }),
      ).toMatchObject({ ok: false, reason: 'invalid-payload' });
    }
  });
  it('round-trips a generated consumer and resolves the current region once', async () => {
    const link = await source();
    const saved = await saveToolArtifact('p1', {
      kind: 'settlement',
      toolPath: '/fantasy/settlement',
      payload: { ...standalone, regionalMaterialContext: link },
      references: [regionalMaterialReference(link)],
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    const read = await readArtifact(ARTIFACT_KINDS, 'p1', saved.value.id);
    expect(read?.ok && read.artifact.payload).toEqual(saved.value.payload);
    const initial = await resolveRegionalMaterials('p1', link, saved.value.references);
    expect(initial.status).not.toBe('unresolved');
    const renamed = structuredClone(region);
    renamed.settlements[0].snapshot.name = 'New source name';
    await updateArtifactPayload(ARTIFACT_KINDS, 'p1', 'region-one', renamed);
    expect((await resolveRegionalMaterials('p1', link, saved.value.references)).sourceName).toBe(
      'New source name',
    );
    const entries = await collectProjectPdfArtifacts('p1');
    const entry = entries.find((item) => item.sourceId === saved.value.id)!;
    expect(JSON.stringify(entry.blocks)).toContain('New source name');
    await deleteArtifact('p1', 'region-one');
    expect((await resolveRegionalMaterials('p1', link, saved.value.references)).status).toBe(
      'unresolved',
    );
    expect((await readArtifact(ARTIFACT_KINDS, 'p1', saved.value.id))?.ok).toBe(true);
  });
  it('saves link edits and references atomically while preserving unrelated composition', async () => {
    const link = await source();
    const created = await createArtifact(ARTIFACT_KINDS, {
      projectId: 'p1',
      kind: 'settlement',
      payload: standalone,
      references: [{ targetId: 'faith', targetKind: 'religion', role: 'faith' }],
    });
    if (!created.ok) throw new Error(created.message);
    const changed = await saveArtifactEdits('p1', created.value.id, {
      name: 'Consumer',
      payload: { ...standalone, regionalMaterialContext: link },
    });
    expect(changed.ok && changed.summary.references).toEqual([
      { targetId: 'faith', targetKind: 'religion', role: 'faith' },
      regionalMaterialReference(link),
    ]);
    const cleared = await saveArtifactEdits('p1', created.value.id, {
      name: 'Consumer',
      payload: standalone,
    });
    expect(cleared.ok && cleared.summary.references).toEqual([
      { targetId: 'faith', targetKind: 'religion', role: 'faith' },
    ]);
  });
  it('preserves independent material composition when rerolling the individual settlement', async () => {
    const link = await source();
    const saved = await saveToolArtifact('p1', {
      kind: 'settlement',
      toolPath: '/fantasy/settlement',
      seed: 'material-reroll',
      payload: { ...standalone, regionalMaterialContext: link },
      references: [regionalMaterialReference(link)],
    });
    if (!saved.ok) throw new Error(saved.message);
    const target = await openArtifactForEditing('p1', saved.value.id);
    if (!target) throw new Error('missing target');
    const result = await rerollArtifact('p1', target);
    expect(result.ok).toBe(true);
    expect(result.ok && result.snapshot).toMatchObject({ regionalMaterialContext: link });
    expect(result.ok && result.summary.references).toEqual([regionalMaterialReference(link)]);
  });
  it('resolves referenced source identity without following its own material link', async () => {
    await source();
    const link = {
      regionTargetId: 'region-one',
      sourceSettlement: { kind: 'artifact' as const, targetId: 'settlement-source' },
    };
    const saved = await createArtifact(
      ARTIFACT_KINDS,
      {
        projectId: 'p1',
        kind: 'settlement',
        name: 'Referenced source',
        payload: { ...standalone, regionalMaterialContext: link },
        references: [regionalMaterialReference(link)],
      },
      { id: 'settlement-source' },
    );
    expect(saved.ok).toBe(true);
    const adapted = structuredClone(region);
    const embedded = adapted.settlements[0].id;
    for (const role of [
      ...adapted.facts.settlementRoles,
      ...adapted.facts.dailyLife,
      ...adapted.facts.products,
      ...adapted.facts.supply,
    ]) {
      if (role.settlement.kind === 'embedded' && role.settlement.settlementId === embedded)
        role.settlement = link.sourceSettlement;
    }
    const changed = await updateArtifactPayload(ARTIFACT_KINDS, 'p1', 'region-one', adapted, {
      references: [{ targetKind: 'settlement', targetId: 'settlement-source', role: 'settlement' }],
    });
    if (!changed?.ok) throw new Error(changed?.message);
    expect(
      (await resolveRegionalMaterials('p1', link, [regionalMaterialReference(link)])).sourceName,
    ).toBe('Referenced source');
    await deleteArtifact('p1', 'settlement-source');
    expect(
      (await resolveRegionalMaterials('p1', link, [regionalMaterialReference(link)])).status,
    ).toBe('unresolved');
  });
  it('reports wrong kinds, missing sources and mismatched references without traversing cycles', async () => {
    const link = await source();
    expect((await resolveRegionalMaterials('p1', link, [])).status).toBe('unresolved');
    expect(
      (
        await resolveRegionalMaterials(
          'p1',
          { ...link, sourceSettlement: { kind: 'embedded', settlementId: 'settlement:missing' } },
          [regionalMaterialReference(link)],
        )
      ).status,
    ).toBe('unresolved');
    const wrong = await createArtifact(
      ARTIFACT_KINDS,
      {
        projectId: 'p1',
        kind: 'settlement',
        payload: { ...standalone, regionalMaterialContext: link },
      },
      { id: 'wrong-kind' },
    );
    expect(wrong.ok).toBe(true);
    const badLink = { ...link, regionTargetId: 'wrong-kind' };
    expect(
      (await resolveRegionalMaterials('p1', badLink, [regionalMaterialReference(badLink)])).status,
    ).toBe('unresolved');
    expect(
      (await resolveRegionalMaterials('other-project', link, [regionalMaterialReference(link)]))
        .status,
    ).toBe('unresolved');
  });
});
