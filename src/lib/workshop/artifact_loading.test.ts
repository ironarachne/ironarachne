import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteArtifact,
  resetArtifactIndex,
  type Artifact,
  type ArtifactSummary,
} from '$lib/artifacts';
import type { Culture } from '$lib/culture';
import { closeVault, writeArtifactRecord } from '$lib/vault_db';

import { loadArtifactValue } from './artifact_loading';
import { saveToolArtifact } from './artifact_saving';

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
 * The smallest payload the registered culture kind accepts. What is proved here is that a saved
 * artifact comes back as a live value; `culture_artifact_kind.test.ts` is where the shape of a
 * culture is argued about.
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

/**
 * A stored device naming one charge, written by hand rather than generated: the heraldry
 * validator asks for shape only, which is exactly what makes an unresolvable name reachable.
 */
function armsSnapshotNamingACharge(chargeName: string): Record<string, unknown> {
  return {
    name: 'Emberhold arms',
    seed: 'emberhold',
    blazon: 'Or, a lion rampant gules',
    generatorOptions: {
      heraldryTag: 'any',
      chargeTinctureName: 'gules',
      numberOfChargesOption: 'one',
      chargePosition: 'normal',
      lockSeed: false,
      fieldDivisionOption: 'plain',
      variationSlotOptions: [],
      variationTinctureOptions: [],
    },
    device: {
      fieldName: 'plain',
      variations: [],
      chargeGroups: [
        {
          chargeName,
          chargeTinctureName: 'gules',
          arrangementName: 'normal',
          numberOfCharges: 1,
        },
      ],
    },
  };
}

async function saveCulture(name = 'Ashfall'): Promise<Artifact> {
  const result = await saveToolArtifact('p1', {
    kind: 'culture',
    payload: cultureSnapshot(name),
    toolPath: '/culture',
  });
  if (!result.ok) {
    throw new Error(`expected a stored culture, got ${result.reason}: ${result.message}`);
  }
  return result.value;
}

describe('loadArtifactValue', () => {
  it('rebuilds a saved artifact into the live value its library works with', async () => {
    const saved = await saveCulture();

    const loaded = await loadArtifactValue('p1', saved.id);

    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }
    expect(loaded.summary.id).toBe(saved.id);
    // A snapshot stores patterns; only the codec turns them back into generators that generate.
    const culture = loaded.value as Culture;
    expect(culture.name).toBe('Ashfall');
    expect(typeof culture.nameGenerators.town.generate).toBe('function');
    expect(culture.nameGenerators.town.generate(1)).toHaveLength(1);
  });

  it('rehydrates the same artifact the same way every time', async () => {
    const saved = await saveCulture();

    const first = await loadArtifactValue('p1', saved.id);
    const second = await loadArtifactValue('p1', saved.id);

    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) {
      return;
    }
    const names = (value: unknown) => (value as Culture).nameGenerators.town.generate(5);
    expect(names(first.value)).toEqual(names(second.value));
  });

  it('reports a target that has been deleted rather than throwing', async () => {
    const saved = await saveCulture();
    await deleteArtifact('p1', saved.id);

    expect(await loadArtifactValue('p1', saved.id)).toMatchObject({
      ok: false,
      reason: 'missing-target',
    });
  });

  it('reports a target held by another project as missing', async () => {
    const saved = await saveCulture();

    expect(await loadArtifactValue('p2', saved.id)).toMatchObject({
      ok: false,
      reason: 'missing-target',
    });
  });

  it('reports a kind this build does not have, keeping the summary', async () => {
    const saved = await saveCulture();
    const fromANewerBuild: ArtifactSummary = { ...saved, kind: 'not-a-kind' };
    await writeArtifactRecord(fromANewerBuild, saved.payload);
    resetArtifactIndex();

    const loaded = await loadArtifactValue('p1', saved.id);

    expect(loaded).toMatchObject({ ok: false, reason: 'unknown-kind' });
    expect(loaded.ok === false && loaded.summary?.name).toBe('Ashfall');
  });

  it('reports a payload the codec cannot rebuild, rather than taking out the caller', async () => {
    // The real case the heraldry kind documents: its validator checks the shape of a stored
    // device and deliberately not whether the names in it still resolve, because resolving them
    // is what costs 18 MB of charge art. A charge this build has dropped therefore surfaces here,
    // in the conversion, and it must cost the one artifact rather than the generator holding it.
    const result = await saveToolArtifact('p1', {
      kind: 'heraldry',
      payload: armsSnapshotNamingACharge('a-charge-this-build-does-not-have'),
      toolPath: '/heraldry',
    });

    const loaded = await loadArtifactValue('p1', result.ok ? result.value.id : '');

    expect(loaded).toMatchObject({ ok: false, reason: 'invalid-payload' });
    expect(loaded.ok === false && loaded.message).toContain('Emberhold arms');
  });

  it('reports a database it could not read', async () => {
    const saved = await saveCulture();
    closeVault();
    vi.stubGlobal('indexedDB', undefined);

    expect(await loadArtifactValue('p1', saved.id)).toMatchObject({ ok: false });
  });
});
