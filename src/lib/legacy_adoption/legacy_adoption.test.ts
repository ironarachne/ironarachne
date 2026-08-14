/**
 * Adoption is verified against payloads the real generators produced, not hand-written stubs.
 *
 * The point of #34 is that a browser holding a year of someone's cultures opens the new build with
 * them intact, and a fixture written by hand only proves adoption agrees with whatever the fixture
 * author believed the shape was. These snapshots come out of `generateCulture`, `generateReligion`,
 * and `generateHeraldry` and go through the same `to*Snapshot` the save buttons call — and the
 * heraldry one is then cut back to the version 1 options that are actually sitting in browsers, so
 * the migration path is exercised rather than described.
 */

import { RNG } from '@ironarachne/rng';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listArtifacts, readArtifact } from '$lib/artifacts';
import {
  generateCulture,
  getDefaultCultureGenerationConfig,
  toCultureSnapshot,
  type CultureSnapshot,
} from '$lib/culture';
import {
  generateHeraldry,
  mergeHeraldryGeneratorConfig,
  toHeraldrySnapshot,
  type HeraldryGeneratorOptionsSnapshot,
} from '$lib/heraldry';
import { readScopedJson, writeScopedJson } from '$lib/persistent_save';
import { createProject, deleteProject, getProject, listProjects } from '$lib/projects';
import {
  generateReligion,
  getDefaultReligionGenerationConfig,
  toReligionSnapshot,
  type ReligionGeneratorOptionsSnapshot,
  type ReligionSnapshot,
} from '$lib/religion';
import { ARTIFACT_KINDS } from '$lib/workshop';

import {
  acknowledgeLegacyAdoptionNotice,
  adoptLegacySaves,
  ADOPTION_PROJECT_NAME,
  legacyAdoptionNotice,
} from './legacy_adoption';
import {
  LEGACY_ADOPTION_SAVE_SCOPE_ID,
  readLegacyAdoptionRecord,
} from './legacy_adoption_saved_state';

const HERALDRY_SCOPE = 'generator.heraldry';
const CULTURE_SCOPE = 'generator.culture';
const RELIGION_SCOPE = 'generator.religion';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size;
    },
    key: (i: number) => [...store.keys()][i] ?? null,
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const currentHeraldryOptions: HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: 'any',
  chargeTinctureName: 'any',
  numberOfChargesOption: 'any',
  chargePosition: 'normal',
  lockSeed: false,
  fieldDivisionOption: 'pale',
  variationSlotOptions: ['plain', 'plain', 'plain'],
  variationTinctureOptions: [['any'], ['any'], ['any']],
};

/**
 * A coat of arms exactly as an old build left it: real generated arms and a real blazon, with the
 * three generator options that did not exist yet simply absent.
 */
function legacyHeraldrySnapshot(seed: string): Record<string, unknown> {
  const arms = generateHeraldry(mergeHeraldryGeneratorConfig({ chargeCount: 1 }));
  const snapshot = toHeraldrySnapshot(arms, seed, currentHeraldryOptions);
  return {
    ...snapshot,
    generatorOptions: {
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    },
  };
}

function legacyCultureSnapshot(seed: string): CultureSnapshot {
  return toCultureSnapshot(generateCulture(seed, getDefaultCultureGenerationConfig()));
}

/**
 * A generated culture under a chosen name.
 *
 * `getDefaultCultureGenerationConfig` seeds its name generators from `Date.now()`, so the same
 * `seed` does not name the same culture twice. Every test below that stores the same saved item
 * across two runs pins the name, which is the field adoption keys on — the rest of the payload is
 * still whatever the generator produced.
 */
function namedCultureSnapshot(seed: string, name: string): CultureSnapshot {
  return { ...legacyCultureSnapshot(seed), name };
}

const religionOptions: ReligionGeneratorOptionsSnapshot = {
  lockSeed: false,
  selectedCategories: [],
  selectedSpecies: [],
  polytheisticStanding: 'random',
  spiritCosmologyDepth: 'random',
  useSavedCulture: false,
};

function legacyReligionSnapshot(seed: string): ReligionSnapshot {
  const religion = generateReligion(seed, getDefaultReligionGenerationConfig());
  return toReligionSnapshot(religion, seed, religionOptions);
}

function writeLegacyScope(scopeId: string, itemsField: string, items: unknown[]): void {
  writeScopedJson(scopeId, { payloadVersion: 1, [itemsField]: items });
}

/** One of each, which is the browser #34 is written for. */
function writeAllLegacyScopes(): {
  heraldry: Record<string, unknown>;
  culture: CultureSnapshot;
  religion: ReligionSnapshot;
} {
  const heraldry = legacyHeraldrySnapshot('legacy-arms');
  const culture = legacyCultureSnapshot('legacy-culture');
  const religion = legacyReligionSnapshot('legacy-religion');
  writeLegacyScope(HERALDRY_SCOPE, 'heraldries', [heraldry]);
  writeLegacyScope(CULTURE_SCOPE, 'cultures', [culture]);
  writeLegacyScope(RELIGION_SCOPE, 'religions', [religion]);
  return { heraldry, culture, religion };
}

function adopt(now = 1_000) {
  return adoptLegacySaves(ARTIFACT_KINDS, { now });
}

describe('adoptLegacySaves', () => {
  it('adopts a real saved coat of arms, culture, and religion into one new project', () => {
    const legacy = writeAllLegacyScopes();

    const result = adopt();

    expect(result.projectCreated).toBe(true);
    expect(result.skipped).toEqual([]);
    expect(result.unreadableScopeIds).toEqual([]);
    expect(result.adopted).toHaveLength(3);

    const projects = listProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe(ADOPTION_PROJECT_NAME);
    expect(result.projectId).toBe(projects[0].id);

    const artifacts = listArtifacts(projects[0].id);
    expect(artifacts.map((artifact) => artifact.kind).sort()).toEqual([
      'culture',
      'heraldry',
      'religion',
    ]);
    expect(artifacts.map((artifact) => artifact.name).sort()).toEqual(
      [legacy.heraldry.name as string, legacy.culture.name, legacy.religion.name].sort(),
    );
  });

  it('records no provenance, because the legacy scopes stored no origin to record', () => {
    writeAllLegacyScopes();

    const result = adopt();

    const artifacts = listArtifacts(result.projectId!);
    expect(artifacts.every((artifact) => artifact.provenance === undefined)).toBe(true);
  });

  it('migrates a version 1 coat of arms through the kind registry on the way in', async () => {
    writeLegacyScope(HERALDRY_SCOPE, 'heraldries', [legacyHeraldrySnapshot('legacy-arms')]);

    const result = adopt();

    const [summary] = listArtifacts(result.projectId!);
    const read = readArtifact(ARTIFACT_KINDS, result.projectId!, summary.id);
    expect(read?.ok).toBe(true);
    if (read?.ok !== true) return;

    // Stored at the kind's current version, with the three options the migration filled in.
    expect(read.artifact.payloadVersion).toBe(2);
    expect(read.migrated).toBe(false);
    const payload = read.artifact.payload as { generatorOptions: Record<string, unknown> };
    expect(payload.generatorOptions.fieldDivisionOption).toBeTypeOf('string');
    expect(Array.isArray(payload.generatorOptions.variationSlotOptions)).toBe(true);

    // And it still rebuilds into arms, which is the only proof the migration produced something
    // usable rather than something merely well-typed.
    const codec = await ARTIFACT_KINDS.byKind.get('heraldry')!.loadCodec();
    const restored = codec.fromSnapshot(read.artifact.payload, new RNG('unused')) as {
      arms: { blazon: string };
    };
    expect(restored.arms.blazon).toBe((payload as unknown as { blazon: string }).blazon);
  });

  it('leaves every legacy scope exactly as it found it', () => {
    writeAllLegacyScopes();
    const before = [HERALDRY_SCOPE, CULTURE_SCOPE, RELIGION_SCOPE].map((scope) =>
      JSON.stringify(readScopedJson(scope)),
    );

    adopt();

    const after = [HERALDRY_SCOPE, CULTURE_SCOPE, RELIGION_SCOPE].map((scope) =>
      JSON.stringify(readScopedJson(scope)),
    );
    expect(after).toEqual(before);
  });

  it('adopts nothing a second time', () => {
    writeAllLegacyScopes();
    const first = adopt(1_000);

    const second = adopt(2_000);

    expect(second.adopted).toEqual([]);
    expect(second.projectCreated).toBe(false);
    expect(second.alreadyAdopted).toBe(3);
    expect(listProjects()).toHaveLength(1);
    expect(listArtifacts(first.projectId!)).toHaveLength(3);
  });

  it('picks up an item saved after the previous run without touching the rest', () => {
    const kept = namedCultureSnapshot('first', 'Aurelian');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept]);
    const first = adopt(1_000);

    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept, namedCultureSnapshot('second', 'Borvath')]);
    const second = adopt(2_000);

    expect(second.adopted).toHaveLength(1);
    expect(second.adopted[0].name).toBe('Borvath');
    expect(second.alreadyAdopted).toBe(1);
    expect(second.projectCreated).toBe(false);
    expect(listArtifacts(first.projectId!)).toHaveLength(2);
  });

  it('does not touch a browser that never saved anything', () => {
    const result = adopt();

    expect(result).toEqual({
      projectId: null,
      projectCreated: false,
      adopted: [],
      skipped: [],
      alreadyAdopted: 0,
      unreadableScopeIds: [],
    });
    expect(listProjects()).toEqual([]);
    expect(store.size).toBe(0);
  });

  it('adopts the one scope that has anything in it', () => {
    writeLegacyScope(RELIGION_SCOPE, 'religions', [legacyReligionSnapshot('only-religion')]);

    const result = adopt();

    expect(result.adopted).toHaveLength(1);
    expect(result.adopted[0].kind).toBe('religion');
    expect(result.skipped).toEqual([]);
    expect(listArtifacts(result.projectId!)).toHaveLength(1);
  });

  it('reports a scope whose envelope it cannot parse, and adopts the others', () => {
    writeScopedJson(HERALDRY_SCOPE, { payloadVersion: 1, heraldries: 'not an array' });
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [legacyCultureSnapshot('survivor')]);

    const result = adopt();

    expect(result.unreadableScopeIds).toEqual([HERALDRY_SCOPE]);
    expect(result.adopted).toHaveLength(1);
    expect(result.adopted[0].kind).toBe('culture');
  });

  it('skips a malformed item with its reason, and keeps the good ones beside it', () => {
    const good = legacyCultureSnapshot('good');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [
      { name: 'Half a culture' },
      good,
      { nothing: 'here' },
    ]);

    const result = adopt();

    expect(result.adopted).toHaveLength(1);
    expect(result.adopted[0].name).toBe(good.name);
    expect(result.skipped).toHaveLength(2);
    expect(result.skipped[0]).toMatchObject({
      scopeId: CULTURE_SCOPE,
      kind: 'culture',
      identity: 'Half a culture',
      reason: 'invalid-payload',
    });
    // No identity field at all, so it is skipped before the kind ever sees it.
    expect(result.skipped[1]).toMatchObject({ identity: null, reason: 'invalid-payload' });
  });

  it('creates no project when it could not read a single item', () => {
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [{ name: 'Half a culture' }, { nothing: 'here' }]);

    const result = adopt();

    expect(result.skipped).toHaveLength(2);
    expect(result.projectId).toBeNull();
    expect(result.projectCreated).toBe(false);
    expect(listProjects()).toEqual([]);
    expect(legacyAdoptionNotice()).toBeNull();
  });

  it('records no key against a skipped item, so a later build can still adopt it', () => {
    const good = legacyCultureSnapshot('good');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [{ name: 'Half a culture' }, good]);
    adopt(1_000);

    // The same list, with the broken record repaired — as a later build reading it would see.
    const repaired = legacyCultureSnapshot('repaired');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [{ ...repaired, name: 'Half a culture' }, good]);
    const second = adopt(2_000);

    expect(second.adopted).toHaveLength(1);
    expect(second.adopted[0].name).toBe('Half a culture');
    expect(second.alreadyAdopted).toBe(1);
  });

  it('adopts two saved items that share a name rather than counting the second as done', () => {
    const first = legacyCultureSnapshot('twin-one');
    const second = { ...legacyCultureSnapshot('twin-two'), name: first.name };
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [first, second]);

    const result = adopt();

    expect(result.adopted).toHaveLength(2);
    expect(listArtifacts(result.projectId!)).toHaveLength(2);
  });

  it('adopts into the project the last run used', () => {
    const kept = namedCultureSnapshot('first', 'Aurelian');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept]);
    const first = adopt(1_000);
    createProject({ name: 'Somewhere else' }, { now: 1_500 });

    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept, namedCultureSnapshot('second', 'Borvath')]);
    const second = adopt(2_000);

    expect(second.projectId).toBe(first.projectId);
    expect(second.projectCreated).toBe(false);
    expect(listArtifacts(first.projectId!)).toHaveLength(2);
  });

  it('creates a fresh project when the one it used has been deleted', () => {
    const kept = namedCultureSnapshot('first', 'Aurelian');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept]);
    const first = adopt(1_000);
    deleteProject(first.projectId!);

    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept, namedCultureSnapshot('second', 'Borvath')]);
    const second = adopt(2_000);

    expect(second.projectCreated).toBe(true);
    expect(second.projectId).not.toBe(first.projectId);
    expect(getProject(first.projectId!)).toBeUndefined();
    // Only the new item: the first is still recorded as adopted, and re-adopting it into a new
    // project because the old one was deleted would resurrect something the user threw away.
    expect(listArtifacts(second.projectId!)).toHaveLength(1);
  });

  it('gives the project a name and a description the user can change', () => {
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [legacyCultureSnapshot('first')]);

    const result = adopt();

    const project = getProject(result.projectId!);
    expect(project?.name).toBe(ADOPTION_PROJECT_NAME);
    expect(project?.description).toBeTypeOf('string');
  });

  it('honours a caller-supplied project name', () => {
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [legacyCultureSnapshot('first')]);

    const result = adoptLegacySaves(ARTIFACT_KINDS, { now: 1_000, projectName: 'Ashfall' });

    expect(getProject(result.projectId!)?.name).toBe('Ashfall');
  });

  it('stamps every artifact in a run with the same timestamps', () => {
    writeAllLegacyScopes();

    const result = adopt(4_242);

    for (const artifact of listArtifacts(result.projectId!)) {
      expect(artifact.createdAt).toBe(4_242);
      expect(artifact.updatedAt).toBe(4_242);
    }
  });
});

describe('the adoption notice', () => {
  it('is left for the user by a run that adopted something', () => {
    writeAllLegacyScopes();

    const result = adopt(1_000);

    expect(legacyAdoptionNotice()).toEqual({
      projectId: result.projectId,
      adoptedCount: 3,
      skippedCount: 0,
      at: 1_000,
    });
  });

  it('is not raised by a run that adopted nothing', () => {
    adopt();

    expect(legacyAdoptionNotice()).toBeNull();
  });

  it('adds up runs the user has not read yet', () => {
    const kept = namedCultureSnapshot('first', 'Aurelian');
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept]);
    adopt(1_000);
    writeLegacyScope(CULTURE_SCOPE, 'cultures', [kept, namedCultureSnapshot('second', 'Borvath')]);

    adopt(2_000);

    expect(legacyAdoptionNotice()).toMatchObject({ adoptedCount: 2, at: 2_000 });
  });

  it('is cleared when acknowledged, without forgetting what was adopted', () => {
    writeAllLegacyScopes();
    const result = adopt(1_000);

    acknowledgeLegacyAdoptionNotice();

    expect(legacyAdoptionNotice()).toBeNull();
    expect(readLegacyAdoptionRecord().adoptedKeys).toHaveLength(3);
    expect(adopt(2_000).adopted).toEqual([]);
    expect(listArtifacts(result.projectId!)).toHaveLength(3);
  });

  it('acknowledging nothing writes nothing', () => {
    acknowledgeLegacyAdoptionNotice();

    expect(readScopedJson(LEGACY_ADOPTION_SAVE_SCOPE_ID)).toBeNull();
  });
});
