import { describe, expect, it } from 'vitest';

import { readArtifactPayload, type AnyArtifactKindEntry } from '$lib/artifact_kinds';

import {
  migrateStarNationSnapshot,
  STAR_NATION_ARTIFACT_KIND,
  STAR_NATION_PAYLOAD_VERSION,
  starNationArtifactKind,
  validateStarNationSnapshot,
} from './star_nation_artifact_kind';
import { rollStarNationSnapshot } from './star_nation_roll';
import type { StarNationSnapshot } from './star_nation_snapshot';

/** A stored payload, as anything reading one actually receives it. */
const snapshot = JSON.parse(
  JSON.stringify(rollStarNationSnapshot('kind-fixture', { planetCount: 3 })),
) as StarNationSnapshot;

function withField(field: string, value: unknown): Record<string, unknown> {
  return { ...snapshot, [field]: value };
}

function without(record: Record<string, unknown>, field: string): Record<string, unknown> {
  const broken = { ...record };
  delete broken[field];
  return broken;
}

describe('the star nation artifact kind', () => {
  /** Its own kind, unqualified: neither a game system nor a setting, and not an `organization`. */
  it('is registered under its own name', () => {
    expect(STAR_NATION_ARTIFACT_KIND).toBe('star-nation');
    expect(starNationArtifactKind.kind).toBe('star-nation');
    expect(starNationArtifactKind.displayName).toBe('Star Nation');
    expect(starNationArtifactKind.payloadVersion).toBe(STAR_NATION_PAYLOAD_VERSION);
    expect(starNationArtifactKind.icon).not.toBe('');
  });

  it('names a saved nation after itself', () => {
    expect(starNationArtifactKind.nameOf({ ...snapshot, name: 'Kingdom of Vesh' })).toBe(
      'Kingdom of Vesh',
    );
  });

  it('names a nation with no name by its kind', () => {
    expect(starNationArtifactKind.nameOf({ ...snapshot, name: '  ' })).toBe('Star Nation');
  });

  it('accepts a payload the generator produced', () => {
    expect(validateStarNationSnapshot(snapshot).ok).toBe(true);
  });

  /** 3.3: an emptied nation is a well-defined result, not a refusal. */
  it('accepts a nation with its name, description and regions emptied', () => {
    expect(
      validateStarNationSnapshot({ ...snapshot, name: '', description: '', regionsOfControl: [] })
        .ok,
    ).toBe(true);
  });

  it('rejects something that is not an object at all', () => {
    for (const payload of [null, 'Vesh', 42, [snapshot]]) {
      const result = validateStarNationSnapshot(payload);
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing any top-level field', () => {
    for (const field of Object.keys(snapshot)) {
      expect(validateStarNationSnapshot(without({ ...snapshot }, field)).ok).toBe(false);
    }
  });

  it('rejects a technology level the table has no row for', () => {
    expect(validateStarNationSnapshot(withField('technologyLevel', 11)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('technologyLevel', -1)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('technologyLevel', 7.5)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('technologyLevel', 0)).ok).toBe(true);
    expect(validateStarNationSnapshot(withField('technologyLevel', 10)).ok).toBe(true);
  });

  it('accepts every technology level the table names, so the label never throws', async () => {
    const { getTechnologyLevels } = await import('$lib/technology_levels');
    const { starNationTechnologyLabel } = await import('./star_nation_presentation');
    const { starNationFromSnapshot } = await import('./star_nation_snapshot');
    for (const { level } of getTechnologyLevels()) {
      const accepted = validateStarNationSnapshot(withField('technologyLevel', level));
      expect(accepted.ok).toBe(true);
      if (accepted.ok) {
        expect(() =>
          starNationTechnologyLabel(starNationFromSnapshot(accepted.value)),
        ).not.toThrow();
      }
    }
  });

  it('rejects a count that is negative or not whole', () => {
    expect(validateStarNationSnapshot(withField('homeSystemPopulatedPlanets', -2)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('systemsControlled', 2.5)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('populatedPlanets', 0)).ok).toBe(true);
  });

  it('rejects a military quality the description table cannot name', () => {
    expect(
      validateStarNationSnapshot(withField('military', { ...snapshot.military, quality: 0 })).ok,
    ).toBe(false);
    expect(
      validateStarNationSnapshot(withField('military', { ...snapshot.military, quality: 11 })).ok,
    ).toBe(false);
    expect(
      validateStarNationSnapshot(withField('military', without({ ...snapshot.military }, 'size')))
        .ok,
    ).toBe(false);
  });

  it('rejects a government or economy type missing its fields', () => {
    expect(
      validateStarNationSnapshot(
        withField('governmentType', without({ ...snapshot.governmentType }, 'name_options')),
      ).ok,
    ).toBe(false);
    expect(
      validateStarNationSnapshot(
        withField('economyType', without({ ...snapshot.economyType }, 'adjective')),
      ).ok,
    ).toBe(false);
  });

  it('rejects a region without a region type or a population', () => {
    const region = snapshot.regionsOfControl[0];
    expect(
      validateStarNationSnapshot(
        withField('regionsOfControl', [without({ ...region }, 'region_type')]),
      ).ok,
    ).toBe(false);
    expect(
      validateStarNationSnapshot(withField('regionsOfControl', [{ ...region, population: 'many' }]))
        .ok,
    ).toBe(false);
    expect(validateStarNationSnapshot(withField('regionsOfControl', 'none')).ok).toBe(false);
  });

  it('rejects a home system whose bodies lack a parameter the renderer reads', () => {
    const planet = without({ ...snapshot.homeSystem.planets[0] }, 'radius');
    expect(
      validateStarNationSnapshot(
        withField('homeSystem', { ...snapshot.homeSystem, planets: [planet] }),
      ).ok,
    ).toBe(false);
    const star = { ...snapshot.homeSystem.stars[0], has_atmosphere: 'no' };
    expect(
      validateStarNationSnapshot(withField('homeSystem', { ...snapshot.homeSystem, stars: [star] }))
        .ok,
    ).toBe(false);
  });

  it('rejects a home planet outside the home system', () => {
    expect(validateStarNationSnapshot(withField('homePlanetIndex', 3)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('homePlanetIndex', -1)).ok).toBe(false);
    expect(validateStarNationSnapshot(withField('homePlanetIndex', 1.5)).ok).toBe(false);
    expect(
      validateStarNationSnapshot({
        ...snapshot,
        homePlanetIndex: 0,
        homeSystem: { ...snapshot.homeSystem, planets: [] },
      }).ok,
    ).toBe(false);
  });

  it('has no migration to offer, and says so rather than guessing', () => {
    const result = migrateStarNationSnapshot(snapshot, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  /** The whole read path, as the store runs it. */
  it('reads a stored payload of its own version', () => {
    expect(
      readArtifactPayload(
        starNationArtifactKind as AnyArtifactKindEntry,
        snapshot,
        STAR_NATION_PAYLOAD_VERSION,
      ).ok,
    ).toBe(true);
  });

  it('quarantines a payload from a version it has no step for', () => {
    expect(
      readArtifactPayload(
        starNationArtifactKind as AnyArtifactKindEntry,
        snapshot,
        STAR_NATION_PAYLOAD_VERSION + 1,
      ).ok,
    ).toBe(false);
  });

  it('loads a codec that round-trips the payload', async () => {
    const codec = await starNationArtifactKind.loadCodec();
    const accepted = validateStarNationSnapshot(snapshot);

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    const { RNG } = await import('@ironarachne/rng');
    const live = codec.fromSnapshot(accepted.value, new RNG('unused'));

    expect(codec.toSnapshot(live)).toEqual(accepted.value);
  });
});
