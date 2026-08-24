import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  collectReferencedArtifacts,
  deleteArtifact,
  getArtifactSummary,
  hasBrokenArtifactReferences,
  listArtifactBacklinks,
  resetArtifactIndex,
  setArtifactReferences,
  type Artifact,
  type ArtifactSummary,
} from '$lib/artifacts';
import type { Culture } from '$lib/culture';
import { closeVault, writeArtifactRecord } from '$lib/vault_db';

import { createProject, resetProjectIndex, setActiveProject } from '$lib/projects';

import { loadActiveProjectArtifactValues, loadArtifactValue } from './artifact_loading';
import { saveToolArtifact } from './artifact_saving';

beforeEach(() => {
  closeVault();
  resetArtifactIndex();
  resetProjectIndex();
  vi.stubGlobal('indexedDB', new IDBFactory());
});

afterEach(() => {
  closeVault();
  resetArtifactIndex();
  resetProjectIndex();
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

describe('loadActiveProjectArtifactValues', () => {
  /** The open project with two cultures in it, which is what the naming dropdowns read. */
  async function openAProjectHoldingCultures(names: string[]): Promise<string> {
    const project = await createProject({ name: 'Ashfall' });
    if (!project.ok) {
      throw new Error(`expected a project, got ${project.reason}`);
    }
    setActiveProject(project.value.id);
    for (const name of names) {
      await saveToolArtifact(project.value.id, {
        kind: 'culture',
        payload: cultureSnapshot(name),
        toolPath: '/culture',
      });
    }
    return project.value.id;
  }

  it('rebuilds every artifact of one kind in the open project', async () => {
    await openAProjectHoldingCultures(['Ashfall', 'Saltmarch']);

    const cultures = (await loadActiveProjectArtifactValues('culture')) as Culture[];

    expect(cultures.map((culture) => culture.name).sort()).toEqual(['Ashfall', 'Saltmarch']);
    // Live values, not snapshots: a caller asked for something it can name a character from.
    expect(cultures[0].nameGenerators.town.generate(1)).toHaveLength(1);
  });

  it('offers nothing of a kind the project does not hold', async () => {
    await openAProjectHoldingCultures(['Ashfall']);

    expect(await loadActiveProjectArtifactValues('heraldry')).toEqual([]);
  });

  it('offers nothing when no project is open, which is not a failure', async () => {
    setActiveProject(null);

    expect(await loadActiveProjectArtifactValues('culture')).toEqual([]);
  });

  /**
   * One unreadable artifact costs that artifact and not the list. A dropdown of things to name a
   * character from is not a place a user can act on a broken payload.
   */
  it('leaves out what it cannot read and keeps the rest', async () => {
    const projectId = await openAProjectHoldingCultures(['Ashfall']);
    const broken = await saveToolArtifact(projectId, {
      kind: 'heraldry',
      payload: armsSnapshotNamingACharge('a-charge-this-build-does-not-have'),
      toolPath: '/heraldry',
    });
    expect(broken.ok).toBe(true);

    expect(await loadActiveProjectArtifactValues('heraldry')).toEqual([]);
    expect(await loadActiveProjectArtifactValues('culture')).toHaveLength(1);
  });
});

/**
 * Requirement 5.4, for the pair that makes it a real question rather than a hypothetical.
 *
 * A culture takes its religion from a saved religion; a religion takes its gods' names from a
 * saved culture. Pointed at each other, they are a cycle — and per docs/workshop.md that is an
 * ordinary arrangement rather than a bug to detect, so everything that walks references has to
 * terminate on it and everything that reads one has to keep working.
 *
 * Built through the store rather than through the two generators, because a reference is recorded
 * when an artifact is saved and saving always makes a new artifact: the UI can build
 * `culture → religion → culture` across three artifacts but cannot yet close the loop over two.
 * Closing it here is what proves the model tolerates what the model allows.
 */
describe('a culture and a religion that reference each other', () => {
  function religionSnapshot(name = 'The Ember'): Record<string, unknown> {
    return {
      name,
      seed: 'ember',
      generatorOptions: {
        lockSeed: false,
        selectedCategories: ['polytheism'],
        selectedSpecies: ['human'],
        polytheisticStanding: 'random',
        spiritCosmologyDepth: 'random',
        useSavedCulture: true,
        savedCultureName: 'Ashfall',
      },
      religion: { name, description: 'They keep the long silence.', realms: [], pantheon: null },
    };
  }

  /** Two artifacts, each naming the other, in the roles their generators actually record. */
  async function saveACycle(): Promise<{ culture: Artifact; religion: Artifact }> {
    const culture = await saveCulture();
    const stored = await saveToolArtifact('p1', {
      kind: 'religion',
      payload: religionSnapshot(),
      toolPath: '/fantasy/religion',
      references: [{ targetId: culture.id, targetKind: 'culture', role: 'naming-culture' }],
    });
    if (!stored.ok) {
      throw new Error(`expected a stored religion, got ${stored.reason}: ${stored.message}`);
    }
    await setArtifactReferences('p1', culture.id, [
      { targetId: stored.value.id, targetKind: 'religion', role: 'religion' },
    ]);
    return { culture, religion: stored.value };
  }

  it('terminates when the walk goes round, from either end', async () => {
    const { culture, religion } = await saveACycle();

    // Each reaches the other and stops. Neither reaches itself: a project is not a thing that
    // reaches itself, and looping back is precisely what would hang.
    expect(collectReferencedArtifacts('p1', culture.id).map((entry) => entry.id)).toEqual([
      religion.id,
    ]);
    expect(collectReferencedArtifacts('p1', religion.id).map((entry) => entry.id)).toEqual([
      culture.id,
    ]);
  });

  it('answers what points at each of them, by role', async () => {
    const { culture, religion } = await saveACycle();

    expect(listArtifactBacklinks('p1', culture.id)).toMatchObject([
      { referrer: { id: religion.id }, references: [{ role: 'naming-culture' }] },
    ]);
    expect(listArtifactBacklinks('p1', religion.id)).toMatchObject([
      { referrer: { id: culture.id }, references: [{ role: 'religion' }] },
    ]);
  });

  it('still rebuilds both, since a cycle is a shape of the links and not of the payloads', async () => {
    const { culture, religion } = await saveACycle();

    expect(await loadArtifactValue('p1', culture.id)).toMatchObject({ ok: true });
    expect(await loadArtifactValue('p1', religion.id)).toMatchObject({ ok: true });
  });

  it('leaves the survivor readable and visibly broken when one half is deleted', async () => {
    const { culture, religion } = await saveACycle();

    await deleteArtifact('p1', culture.id);

    expect(hasBrokenArtifactReferences('p1', getArtifactSummary('p1', religion.id)!)).toBe(true);
    expect(collectReferencedArtifacts('p1', religion.id)).toEqual([]);
    expect(await loadArtifactValue('p1', religion.id)).toMatchObject({ ok: true });
  });
});

/**
 * Requirement 5.4 for settlement (#20), which is the tool that makes a cycle reachable through
 * three real kinds rather than two.
 *
 * A settlement takes its names from a saved culture and records a saved religion as the local
 * faith; a religion takes its gods' names from a saved culture; a culture takes its faith from a
 * saved religion. Pointed round, `settlement → culture → religion → settlement` is a cycle, and
 * per docs/workshop.md that is an ordinary arrangement rather than a bug to detect.
 *
 * Built through the store for the reason the two-kind case is: a reference is recorded when an
 * artifact is saved, and saving always makes a new artifact, so the UI cannot close a loop it is
 * allowed to describe.
 */
describe('a settlement in a cycle of references', () => {
  /**
   * The smallest payload the registered settlement kind accepts. What is proved here is the shape
   * of the links; `settlement_artifact_kind.test.ts` is where the shape of a settlement is argued
   * about.
   */
  function settlementSnapshot(name = 'White Ridge'): Record<string, unknown> {
    return {
      name,
      description: 'A city on a ridge above the salt road.',
      category: { name: 'city', sizeClass: 'large', minSize: 8000, maxSize: 20000 },
      population: 12000,
      prosperity: 8,
      environment: { description: 'Dry uplands, cut by one green valley.' },
      lawAndOrder: 6,
      commerce: 7,
      foodSecurity: 5,
      publicHealth: 4,
      settlementTags: ['highland'],
      economicRole: 'market',
    };
  }

  async function saveALoop(): Promise<{
    settlement: Artifact;
    culture: Artifact;
    religion: Artifact;
  }> {
    const culture = await saveCulture();
    const storedReligion = await saveToolArtifact('p1', {
      kind: 'religion',
      payload: {
        name: 'The Ember',
        seed: 'ember',
        generatorOptions: {
          lockSeed: false,
          selectedCategories: ['polytheism'],
          selectedSpecies: ['human'],
          polytheisticStanding: 'random',
          spiritCosmologyDepth: 'random',
          useSavedCulture: true,
          savedCultureName: 'Ashfall',
        },
        religion: { name: 'The Ember', description: 'They keep the long silence.' },
      },
      toolPath: '/fantasy/religion',
      references: [{ targetId: culture.id, targetKind: 'culture', role: 'naming-culture' }],
    });
    if (!storedReligion.ok) {
      throw new Error(`expected a stored religion, got ${storedReligion.reason}`);
    }
    const storedSettlement = await saveToolArtifact('p1', {
      kind: 'settlement',
      payload: settlementSnapshot(),
      toolPath: '/fantasy/settlement',
      references: [
        { targetId: culture.id, targetKind: 'culture', role: 'naming-culture' },
        { targetId: storedReligion.value.id, targetKind: 'religion', role: 'faith' },
      ],
    });
    if (!storedSettlement.ok) {
      throw new Error(`expected a stored settlement, got ${storedSettlement.reason}`);
    }
    // The link that closes the loop: the culture's own faith is the religion above, and that
    // religion is practised in the settlement named from the culture.
    await setArtifactReferences('p1', culture.id, [
      { targetId: storedReligion.value.id, targetKind: 'religion', role: 'religion' },
    ]);
    return { settlement: storedSettlement.value, culture, religion: storedReligion.value };
  }

  it('walks out of a settlement and stops, rather than going round', async () => {
    const { settlement, culture, religion } = await saveALoop();

    expect(
      collectReferencedArtifacts('p1', settlement.id)
        .map((entry) => entry.id)
        .sort(),
    ).toEqual([culture.id, religion.id].sort());
  });

  it('rebuilds a settlement that is part of one', async () => {
    const { settlement } = await saveALoop();

    expect(await loadArtifactValue('p1', settlement.id)).toMatchObject({ ok: true });
  });

  /** The roles are what make two links of different kinds legible from the other end. */
  it('answers what a culture and a religion are used for, by role', async () => {
    const { settlement, culture, religion } = await saveALoop();

    expect(listArtifactBacklinks('p1', culture.id)).toMatchObject([
      { referrer: { id: religion.id }, references: [{ role: 'naming-culture' }] },
      { referrer: { id: settlement.id }, references: [{ role: 'naming-culture' }] },
    ]);
    expect(listArtifactBacklinks('p1', religion.id)).toMatchObject([
      { referrer: { id: culture.id }, references: [{ role: 'religion' }] },
      { referrer: { id: settlement.id }, references: [{ role: 'faith' }] },
    ]);
  });

  /**
   * Requirement 5.3: composition is opt-in, so a settlement that was handed nothing is a settlement
   * with no references — not one with empty ones.
   */
  it('records nothing for a settlement that was handed nothing', async () => {
    const stored = await saveToolArtifact('p1', {
      kind: 'settlement',
      payload: settlementSnapshot('Oakhollow'),
      toolPath: '/fantasy/settlement',
    });

    expect(stored.ok && stored.value.references).toEqual([]);
    expect(stored.ok && collectReferencedArtifacts('p1', stored.value.id)).toEqual([]);
  });

  it('leaves a settlement readable and visibly broken when its faith is deleted', async () => {
    const { settlement, religion } = await saveALoop();

    await deleteArtifact('p1', religion.id);

    expect(hasBrokenArtifactReferences('p1', getArtifactSummary('p1', settlement.id)!)).toBe(true);
    expect(await loadArtifactValue('p1', settlement.id)).toMatchObject({ ok: true });
  });
});
