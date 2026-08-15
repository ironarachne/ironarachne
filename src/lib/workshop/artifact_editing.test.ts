import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteArtifact,
  getArtifactSummary,
  readArtifact,
  resetArtifactIndex,
  type Artifact,
  type ArtifactSummary,
} from '$lib/artifacts';
import { closeVault, writeArtifactRecord } from '$lib/vault_db';

import {
  artifactRerollAvailability,
  hasUnsavedArtifactEdits,
  openArtifactForEditing,
  rerollArtifact,
  saveArtifactEdits,
} from './artifact_editing';
import { ARTIFACT_KINDS } from './artifact_kind_catalog';
import { saveToolArtifact } from './artifact_saving';
import type { ArtifactEditingTarget, ArtifactEditorRegistry } from './workshop_types';

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

/**
 * The smallest payload the registered culture kind accepts. The framework is generic over kinds,
 * so what it is edited with matters only in that a real kind validates what is written back —
 * which is the half a fake registry could not prove.
 */
function cultureSnapshot(name = 'Ashfall'): Record<string, unknown> {
  return {
    name,
    greeting: 'Well met',
    eatingTrait: 'They eat at dusk.',
    designTrait: 'Angular.',
    musicStyle: 'Drums.',
    taboos: ['No iron indoors.'],
    organization: {
      powerConcentration: 'centralized',
      socialMobility: 'rigid',
      dominantProfession: 'smith',
      description: 'A guild of smiths rules.',
    },
    religion: { name: 'The Ember' },
    nameGenerators: {
      name: 'ashfall',
      culture: ['a$'],
      country: ['a$'],
      family: ['a$'],
      female: ['a$'],
      male: ['a$'],
      town: ['a$'],
    },
  };
}

async function saveCulture(
  name = 'Ashfall',
  seed: string | undefined = 'seed-1',
): Promise<Artifact> {
  const result = await saveToolArtifact('p1', {
    kind: 'culture',
    payload: cultureSnapshot(name),
    toolPath: '/culture',
    seed,
    config: { nameGeneratorSet: 'ashfall' },
  });
  if (!result.ok) {
    throw new Error(`expected a stored culture, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

/** A registry standing in for a kind that has taken itself to Release-ready. */
function editorsFor(
  kind: string,
  options: { roller?: () => unknown } = {},
): ArtifactEditorRegistry {
  return {
    [kind]: {
      // The framework never renders anything in a unit test, so what the loader resolves to is
      // beside the point; that it is *offered* is what decides read-only from editable.
      loadEditor: () => Promise.resolve({ default: (() => undefined) as never }),
      ...(options.roller === undefined
        ? {}
        : { loadRoller: () => Promise.resolve(options.roller as () => unknown) }),
    },
  };
}

async function openCulture(
  editors?: ArtifactEditorRegistry,
): Promise<{ saved: Artifact; target: ArtifactEditingTarget }> {
  const saved = await saveCulture();
  const target = await openArtifactForEditing('p1', saved.id, editors);
  if (target === undefined) {
    throw new Error('expected the saved culture to open');
  }
  return { saved, target };
}

describe('openArtifactForEditing', () => {
  it('opens a saved artifact with its payload and its editor', async () => {
    const { saved, target } = await openCulture(editorsFor('culture'));

    expect(target.summary.id).toBe(saved.id);
    expect(target.snapshot).toMatchObject({ name: 'Ashfall' });
    expect(target.problem).toBeUndefined();
    expect(target.loadEditor).toBeDefined();
  });

  it('opens a kind with no editor registered rather than refusing to open it', async () => {
    const { target } = await openCulture({});

    expect(target.loadEditor).toBeUndefined();
    expect(target.loadRoller).toBeUndefined();
    // The point of the read-only case: the contents are still there to look at.
    expect(target.snapshot).toMatchObject({ name: 'Ashfall' });
  });

  it('reports an artifact that is gone as gone, and not as a failure', async () => {
    const saved = await saveCulture();
    await deleteArtifact('p1', saved.id);

    expect(await openArtifactForEditing('p1', saved.id)).toBeUndefined();
    expect(await openArtifactForEditing('p2', saved.id)).toBeUndefined();
  });

  it('keeps the summary when the payload is one this build cannot read', async () => {
    const saved = await saveCulture();
    const fromANewerBuild: ArtifactSummary = { ...saved, kind: 'not-a-kind' };
    await writeArtifactRecord(fromANewerBuild, saved.payload);
    resetArtifactIndex();

    const target = await openArtifactForEditing('p1', saved.id);

    expect(target?.summary.name).toBe('Ashfall');
    expect(target?.snapshot).toBeUndefined();
    expect(target?.problem?.reason).toBe('unknown-kind');
  });
});

describe('hasUnsavedArtifactEdits', () => {
  it('is quiet when nothing has been touched', async () => {
    const { target } = await openCulture(editorsFor('culture'));

    expect(hasUnsavedArtifactEdits(target, { name: 'Ashfall' })).toBe(false);
    expect(hasUnsavedArtifactEdits(target, { name: 'Ashfall', payload: target.snapshot })).toBe(
      false,
    );
  });

  it('notices a changed name', async () => {
    const { target } = await openCulture();

    expect(hasUnsavedArtifactEdits(target, { name: 'The Emberfolk' })).toBe(true);
  });

  it('does not count a blank name, which the store would not store anyway', async () => {
    const { target } = await openCulture();

    // Counting it would leave the surface dirty forever: saving cannot resolve a change the
    // store refuses to make.
    expect(hasUnsavedArtifactEdits(target, { name: '   ' })).toBe(false);
  });

  it('notices a changed payload, however deep the change is', async () => {
    const { target } = await openCulture(editorsFor('culture'));
    const stored = cultureSnapshot();
    const edited = {
      ...stored,
      organization: {
        ...(stored.organization as Record<string, unknown>),
        description: 'A council rules.',
      },
    };

    expect(hasUnsavedArtifactEdits(target, { name: 'Ashfall', payload: edited })).toBe(true);
  });

  it('ignores a payload rebuilt with its fields in another order', async () => {
    const { target } = await openCulture(editorsFor('culture'));
    const stored = target.snapshot as Record<string, unknown>;
    const reordered = Object.fromEntries(Object.entries(stored).reverse());

    expect(hasUnsavedArtifactEdits(target, { name: 'Ashfall', payload: reordered })).toBe(false);
  });

  it('tells an array apart from an object, and a longer list from a shorter one', async () => {
    const { target } = await openCulture(editorsFor('culture'));
    const withAnotherTaboo = { ...cultureSnapshot(), taboos: ['No iron indoors.', 'No names.'] };
    const withTaboosAsAnObject = { ...cultureSnapshot(), taboos: { 0: 'No iron indoors.' } };

    expect(hasUnsavedArtifactEdits(target, { name: 'Ashfall', payload: withAnotherTaboo })).toBe(
      true,
    );
    expect(
      hasUnsavedArtifactEdits(target, { name: 'Ashfall', payload: withTaboosAsAnObject }),
    ).toBe(true);
  });
});

describe('saveArtifactEdits', () => {
  it('writes an edited payload, and the change is what a reader gets back', async () => {
    const { saved, target } = await openCulture(editorsFor('culture'));
    const edited = { ...cultureSnapshot(), greeting: 'Stand and be seen' };

    const result = await saveArtifactEdits('p1', saved.id, { name: 'Ashfall', payload: edited });

    expect(result.ok).toBe(true);
    const reread = await readArtifact(ARTIFACT_KINDS, 'p1', saved.id);
    expect(reread?.ok === true && reread.artifact.payload).toMatchObject({
      greeting: 'Stand and be seen',
    });
    // And the surface has nothing left to warn about.
    expect(
      hasUnsavedArtifactEdits(
        { ...target, snapshot: result.ok ? result.snapshot : undefined },
        { name: 'Ashfall', payload: edited },
      ),
    ).toBe(false);
  });

  it('renames from the editing surface', async () => {
    const saved = await saveCulture();

    const result = await saveArtifactEdits('p1', saved.id, { name: '  The Emberfolk  ' });

    expect(result.ok === true && result.summary.name).toBe('The Emberfolk');
    expect(getArtifactSummary('p1', saved.id)?.name).toBe('The Emberfolk');
  });

  it('leaves an untouched payload alone, so a rename does not restamp the contents', async () => {
    const saved = await saveCulture();
    const before = getArtifactSummary('p1', saved.id);

    await saveArtifactEdits('p1', saved.id, { name: 'The Emberfolk' });

    const after = getArtifactSummary('p1', saved.id);
    expect(after?.byteSize).toBe(before?.byteSize);
    expect(after?.payloadVersion).toBe(before?.payloadVersion);
  });

  it('advances updatedAt, which is what puts an edited artifact back at the top', async () => {
    const saved = await saveCulture();

    await saveArtifactEdits('p1', saved.id, {
      name: 'Ashfall',
      payload: { ...cultureSnapshot(), musicStyle: 'Pipes.' },
    });

    expect(getArtifactSummary('p1', saved.id)?.updatedAt).toBeGreaterThanOrEqual(saved.updatedAt);
  });

  it('refuses a payload the kind does not accept, and changes nothing', async () => {
    const saved = await saveCulture();

    const result = await saveArtifactEdits('p1', saved.id, {
      name: 'The Emberfolk',
      payload: { name: 'Ashfall' },
    });

    expect(result).toMatchObject({ ok: false, reason: 'invalid-payload' });
    // The name went second on purpose: a rejected snapshot must not leave a renamed artifact.
    expect(getArtifactSummary('p1', saved.id)?.name).toBe('Ashfall');
  });

  it('reports an artifact deleted out from under the surface', async () => {
    const saved = await saveCulture();
    await deleteArtifact('p1', saved.id);

    expect(await saveArtifactEdits('p1', saved.id, { name: 'The Emberfolk' })).toMatchObject({
      ok: false,
      reason: 'missing-target',
    });
    expect(
      await saveArtifactEdits('p1', saved.id, { name: 'Ashfall', payload: cultureSnapshot() }),
    ).toMatchObject({ ok: false, reason: 'missing-target' });
  });

  it('reports a database that would not take the write', async () => {
    const saved = await saveCulture();
    closeVault();
    vi.stubGlobal('indexedDB', undefined);

    expect(await saveArtifactEdits('p1', saved.id, { name: 'The Emberfolk' })).toMatchObject({
      ok: false,
    });
  });
});

describe('artifactRerollAvailability', () => {
  it('is available when the kind can roll and the artifact says where it came from', async () => {
    const { target } = await openCulture(editorsFor('culture', { roller: cultureSnapshot }));

    expect(artifactRerollAvailability(target)).toBe('available');
  });

  it('is unsupported when the kind has no roller', async () => {
    const { target } = await openCulture(editorsFor('culture'));

    expect(artifactRerollAvailability(target)).toBe('unsupported');
  });

  it('says so when the artifact has no provenance to roll from', async () => {
    // What every artifact adopted from `ironarachne.save.v1.*` looks like: a seed was never
    // stored, and #34 records that as absent rather than inventing one.
    const adopted = await saveToolArtifact('p1', {
      kind: 'culture',
      payload: cultureSnapshot(),
      toolPath: '/culture',
    });
    const target = await openArtifactForEditing(
      'p1',
      adopted.ok ? adopted.value.id : '',
      editorsFor('culture', { roller: cultureSnapshot }),
    );

    expect(target?.summary.provenance).toBeUndefined();
    expect(target !== undefined && artifactRerollAvailability(target)).toBe('no-provenance');
  });
});

describe('rerollArtifact', () => {
  it('replaces the stored payload with what the kind rolls from provenance', async () => {
    const { saved, target } = await openCulture(
      editorsFor('culture', { roller: () => cultureSnapshot('Rolled again') }),
    );
    await saveArtifactEdits('p1', saved.id, {
      name: 'Ashfall',
      payload: { ...cultureSnapshot(), greeting: 'An edit worth losing' },
    });

    const result = await rerollArtifact('p1', target);

    expect(result.ok).toBe(true);
    const reread = await readArtifact(ARTIFACT_KINDS, 'p1', saved.id);
    expect(reread?.ok === true && reread.artifact.payload).toMatchObject({
      name: 'Rolled again',
      greeting: 'Well met',
    });
  });

  it('hands the roller the provenance that was stored', async () => {
    const seen: unknown[] = [];
    const { target } = await openCulture(
      editorsFor('culture', {
        roller: ((provenance: unknown) => {
          seen.push(provenance);
          return cultureSnapshot();
        }) as () => unknown,
      }),
    );

    await rerollArtifact('p1', target);

    expect(seen).toEqual([
      { toolPath: '/culture', seed: 'seed-1', config: { nameGeneratorSet: 'ashfall' } },
    ]);
  });

  it('refuses when the kind has no roller, rather than pretending to roll', async () => {
    const { target } = await openCulture(editorsFor('culture'));

    expect(await rerollArtifact('p1', target)).toMatchObject({
      ok: false,
      reason: 'not-rerollable',
    });
  });

  it('refuses when there is no provenance, and says that is why', async () => {
    const { target } = await openCulture(editorsFor('culture', { roller: cultureSnapshot }));
    const withoutProvenance: ArtifactEditingTarget = {
      ...target,
      summary: { ...target.summary, provenance: undefined },
    };

    const result = await rerollArtifact('p1', withoutProvenance);

    expect(result).toMatchObject({ ok: false, reason: 'not-rerollable' });
    expect(result.ok === false && result.message).toContain('no record of how it was made');
  });

  it('survives a roller that throws, leaving what the user has on screen alone', async () => {
    const { saved, target } = await openCulture(
      editorsFor('culture', {
        roller: () => {
          throw new Error('the generator moved on');
        },
      }),
    );

    const result = await rerollArtifact('p1', target);

    expect(result).toMatchObject({ ok: false, reason: 'roll-failed' });
    expect(result.ok === false && result.message).toContain('the generator moved on');
    const reread = await readArtifact(ARTIFACT_KINDS, 'p1', saved.id);
    expect(reread?.ok === true && reread.artifact.payload).toMatchObject({ name: 'Ashfall' });
  });

  it('refuses a roll its own kind will not accept', async () => {
    const { target } = await openCulture(
      editorsFor('culture', { roller: () => ({ name: 'not a culture snapshot' }) }),
    );

    expect(await rerollArtifact('p1', target)).toMatchObject({
      ok: false,
      reason: 'invalid-payload',
    });
  });

  it('reports an artifact deleted between opening it and rolling it again', async () => {
    const { saved, target } = await openCulture(
      editorsFor('culture', { roller: () => cultureSnapshot() }),
    );
    await deleteArtifact('p1', saved.id);

    expect(await rerollArtifact('p1', target)).toMatchObject({
      ok: false,
      reason: 'missing-target',
    });
  });
});
