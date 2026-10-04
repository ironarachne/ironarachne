import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createArtifactKindRegistry, registerArtifactKind } from '$lib/artifact_kinds';
import { createArtifact, readArtifact, listArtifacts, resetArtifactIndex } from '$lib/artifacts';
import { createProject, resetProjectIndex } from '$lib/projects';
import { closeVault } from '$lib/vault_db';
import {
  buildArtifactExportFile,
  buildProjectExportFile,
  importExportFile,
  type ExportEnvelope,
} from '$lib/vault_file';
import { collectProjectPdfArtifacts } from '$lib/pdf';
import { REGION_SEED_BANK } from '../../../test_fixtures/region_seeds';
import {
  regionArtifactKind,
  REGION_PAYLOAD_VERSION,
  migrateRegionSnapshot,
} from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';
import { setRegionPlaceText } from './region_editing';
import { regionToMarkdown, regionToMapSvg, regionToExportDocument } from './region_presentation';

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

it.each(
  REGION_SEED_BANK.flatMap((entry) =>
    ['artifact', 'project'].map((scope) => ({ ...entry, scope })),
  ),
)(
  'exports and imports an edited $contrast region as $scope ($seed)',
  async ({ seed, scope }) => {
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
    const exported =
      scope === 'artifact'
        ? await buildArtifactExportFile(project.value.id, created.value.id)
        : await buildProjectExportFile(project.value.id);
    if (!exported.ok) throw new Error(exported.message);
    const envelope: ExportEnvelope = JSON.parse(exported.value.text);
    const stored =
      envelope.scope === 'artifact' ? envelope.body.artifact : envelope.body.artifacts[0];
    expect(stored.payloadVersion).toBe(REGION_PAYLOAD_VERSION);
    expect(stored.payload).toEqual(payload);
    const imported = await importExportFile(registry, exported.value.text, {
      targetProjectId: target.value.id,
    });
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw new Error(imported.message);
    expect(imported.summary.quarantined).toEqual([]);
    expect(imported.summary.artifactsAdded).toBe(1);
    const destinationId = imported.summary.projectId!;
    const [summary] = listArtifacts(destinationId);
    expect(summary.id).not.toBe(created.value.id);
    expect(summary.provenance).toEqual(created.value.provenance);
    expect(summary.payloadVersion).toBe(REGION_PAYLOAD_VERSION);
    const read = await readArtifact(registry, destinationId, summary.id);
    expect(read?.ok).toBe(true);
    if (!read?.ok) throw new Error('Imported region did not reopen');
    expect(read.artifact.payload).toEqual(payload);
    const checked = regionArtifactKind.validate(read.artifact.payload);
    if (!checked.ok) throw new Error(checked.message);
    expect(regionToMarkdown(checked.value)).toEqual(regionToMarkdown(payload));
    expect(regionToMapSvg(checked.value)).toEqual(regionToMapSvg(payload));
    const [publication] = await collectProjectPdfArtifacts(destinationId);
    expect(publication.status).toBe('ready');
    const printed = publication.blocks
      .flatMap((block) => {
        if (block.type === 'paragraph' || block.type === 'heading') return [block.text];
        if (block.type === 'list') return block.items;
        if (block.type === 'facts')
          return block.facts.map((fact) => `${fact.label}: ${fact.value}`);
        return [];
      })
      .join('\n');
    for (const section of regionToExportDocument(payload).sections) {
      expect(printed).toContain(section.heading);
      for (const line of section.lines.flatMap((line) => line.split('\n\n')))
        expect(printed).toContain(line);
    }
  },
  // Each case generates a region and renders the original, imported copy, and publication.
  // Coverage instrumentation on the CI runner can exceed the default five seconds.
  15_000,
);

it('exports migrated version 2 regions without adding new regional facts', async () => {
  const snapshot = rollRegionSnapshot('legacy-export');
  const { facts: _facts, ...legacy } = snapshot;
  const migrated = migrateRegionSnapshot(
    { ...legacy, settlements: snapshot.settlements.map((entry) => entry.snapshot) },
    2,
  );
  if (!migrated.ok) throw new Error(migrated.message);
  expect(migrated.value.facts.state).toBe('legacy');
  expect(regionToMarkdown(migrated.value)).toContain(snapshot.description);
  expect(regionToMarkdown(migrated.value)).not.toContain('Supporting facts and explanations');
  expect(regionToMapSvg(migrated.value)).toContain('<svg');
  const project = await createProject({ name: 'Legacy source' });
  if (!project.ok) throw new Error(project.message);
  const created = await createArtifact(registry, {
    projectId: project.value.id,
    kind: 'region',
    payload: migrated.value,
  });
  if (!created.ok) throw new Error(created.message);
  const exported = await buildProjectExportFile(project.value.id);
  if (!exported.ok) throw new Error(exported.message);
  const imported = await importExportFile(registry, exported.value.text);
  if (!imported.ok) throw new Error(imported.message);
  expect(imported.summary.quarantined).toEqual([]);
  const [summary] = listArtifacts(imported.summary.projectId!);
  const read = await readArtifact(registry, summary.projectId, summary.id);
  if (!read?.ok) throw new Error('Imported legacy region did not reopen');
  expect(read.artifact.payload).toEqual(migrated.value);
});
