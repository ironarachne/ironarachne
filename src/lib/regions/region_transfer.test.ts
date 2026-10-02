import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createArtifactKindRegistry, registerArtifactKind } from '$lib/artifact_kinds';
import { createArtifact, readArtifact, listArtifacts, resetArtifactIndex } from '$lib/artifacts';
import { createProject, resetProjectIndex } from '$lib/projects';
import { closeVault } from '$lib/vault_db';
import { buildArtifactExportFile, importExportFile } from '$lib/vault_file';
import { REGION_SEED_BANK } from '../../../test_fixtures/region_seeds';
import { regionArtifactKind } from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';
import { setRegionPlaceText } from './region_editing';
import { regionToMarkdown, regionToMapSvg } from './region_presentation';

const registry = createArtifactKindRegistry();
registerArtifactKind(registry, regionArtifactKind);
beforeEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});
afterEach(() => {
  closeVault();
  resetProjectIndex();
  resetArtifactIndex();
  vi.unstubAllGlobals();
});

it.each(REGION_SEED_BANK)(
  'exports and imports an edited $contrast region through the vault ($seed)',
  async ({ seed }) => {
    const project = await createProject({ name: 'Source' });
    const target = await createProject({ name: 'Destination' });
    if (!project.ok || !target.ok) throw new Error('Project creation failed');
    const payload = setRegionPlaceText(
      rollRegionSnapshot(seed),
      'settlements',
      0,
      'name',
      'Kept Town',
    );
    const created = await createArtifact(registry, {
      projectId: project.value.id,
      kind: 'region',
      payload,
      provenance: { seed, toolPath: '/region', config: {} },
    });
    if (!created.ok) throw new Error(created.message);
    const exported = await buildArtifactExportFile(project.value.id, created.value.id);
    if (!exported.ok) throw new Error(exported.message);
    const imported = await importExportFile(registry, exported.value.text, {
      targetProjectId: target.value.id,
    });
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw new Error(imported.message);
    expect(imported.summary.quarantined).toEqual([]);
    expect(imported.summary.artifactsAdded).toBe(1);
    const [summary] = listArtifacts(target.value.id);
    expect(summary.id).not.toBe(created.value.id);
    expect(summary.provenance).toEqual(created.value.provenance);
    const read = await readArtifact(registry, target.value.id, summary.id);
    expect(read?.ok).toBe(true);
    if (!read?.ok) throw new Error('Imported region did not reopen');
    expect(read.artifact.payload).toEqual(payload);
    const checked = regionArtifactKind.validate(read.artifact.payload);
    if (!checked.ok) throw new Error(checked.message);
    expect(regionToMarkdown(checked.value)).toEqual(regionToMarkdown(payload));
    expect(regionToMapSvg(checked.value)).toEqual(regionToMapSvg(payload));
  },
);
