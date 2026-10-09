import { afterEach, describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate, getDefaultConfig } from './regions';
import { toRegionSnapshot } from './region_snapshot';
import { regionFromSnapshot } from './region_rehydrate';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { regionToMapSvg, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { readRegionGeneratorConfig, rollRegion, rollRegionSnapshot } from './region_roll';
import { setRegionMainRealm, setRegionText } from './region_editing';
import type { RegionAffiliationMode } from './region_affiliation_types';
import { generateRegionGeographicName } from './region_landscape_names';

function roll(seed: string, affiliation: RegionAffiliationMode, generateNeighbors = false) {
  const config = getDefaultConfig(new RNG(seed));
  return toRegionSnapshot(
    generate({
      ...config,
      mapWidth: 12,
      mapHeight: 10,
      affiliation,
      generateNeighbors,
      minRealms: 2,
      maxRealms: 2,
    }),
  );
}

afterEach(() => vi.restoreAllMocks());

describe('region affiliation', () => {
  it('defaults to random affiliation without neighbors', () => {
    expect(getDefaultConfig(new RNG('defaults'))).toMatchObject({
      affiliation: 'random',
      generateNeighbors: false,
    });
  });

  it('retains local governments without generating a regional ruler or capital', () => {
    const saved = roll('unaffiliated', 'unaffiliated');
    expect(saved).toMatchObject({
      affiliation: 'unaffiliated',
      mainRealm: null,
      authority: null,
      realms: [],
    });
    expect(saved.settlements.length).toBeGreaterThan(0);
    expect(saved.settlements[0].snapshot.lawAndOrder).toEqual(expect.any(Number));
    expect(saved.settlements[0].snapshot.settlementTags).toEqual(expect.any(Array));
    expect(
      saved.settlements.some((town) => town.snapshot.description.includes('capital of the region')),
    ).toBe(false);
    expect(saved.facts.settlementRoles.some((role) => role.id === 'role:capital')).toBe(false);
    expect(regionToText(saved)).toContain('This region is unaffiliated.');
    expect(regionToMapSvg(saved)).not.toContain('data-capital-pennant="true"');
    expect(JSON.stringify(regionToUiDocument(saved))).not.toContain('Capital ');
    const legacyFacts = { ...saved, facts: { ...saved.facts, settlementRoles: [] } };
    expect(regionToMapSvg(legacyFacts)).not.toContain('data-capital-pennant="true"');
    expect(JSON.stringify(regionToUiDocument(legacyFacts))).not.toContain('Capital ');
  });

  it.each(['affiliated', 'unaffiliated'] as const)(
    '%s neighbors do not change main region content',
    (affiliation) => {
      const clock = vi.spyOn(Date, 'now').mockReturnValue(1);
      const without = roll('neighbor-isolation', affiliation);
      clock.mockReturnValue(9000000);
      const withNeighbors = roll('neighbor-isolation', affiliation, true);
      clock.mockReturnValue(42);
      expect(roll('neighbor-isolation', affiliation, true)).toEqual(withNeighbors);
      expect(withNeighbors.realms.length).toBeGreaterThan(without.realms.length);
      expect(withNeighbors.realms.slice(0, without.realms.length)).toEqual(without.realms);
      expect({ ...withNeighbors, realms: without.realms }).toEqual(without);
      for (const realm of withNeighbors.realms) {
        expect(
          realm.parent === -1 || (realm.parent >= 0 && realm.parent < withNeighbors.realms.length),
        ).toBe(true);
      }
    },
  );

  it('preserves physical geography, ecology and resources across affiliation modes', () => {
    const affiliated = roll('physical-isolation', 'affiliated');
    const unaffiliated = roll('physical-isolation', 'unaffiliated');
    expect(unaffiliated.map).toEqual(affiliated.map);
    for (const key of [
      'habitats',
      'resources',
      'geology',
      'resourceDeposits',
      'ecologyInhabitants',
      'ecologyRelationships',
    ] as const) {
      expect(unaffiliated.facts[key]).toEqual(affiliated.facts[key]);
    }
  });

  it('reproduces both resolved affiliations and favors unaffiliated in a fixed seed corpus', () => {
    const results = Array.from({ length: 16 }, (_, index) =>
      roll(`affiliation-${index}`, 'random'),
    );
    const count = results.filter((result) => result.affiliation === 'unaffiliated').length;
    expect(count).toBeGreaterThan(8);
    expect(count).toBeLessThan(16);
    expect(roll('affiliation-0', 'random')).toEqual(results[0]);
  });

  it('round-trips null authority and political neighbors while keeping text edits', () => {
    const saved = setRegionText(
      roll('round-trip', 'unaffiliated', true),
      'name',
      'The Quiet Reaches',
    );
    expect(validateRegionSnapshot(saved).ok).toBe(true);
    expect(setRegionMainRealm(saved, 0)).toBe(saved);
    const restored = regionFromSnapshot(JSON.parse(JSON.stringify(saved)), new RNG('read'));
    expect(toRegionSnapshot(restored)).toEqual(saved);
  });

  it('migrates version 10 without changing content and rejects inconsistent new payloads', () => {
    const saved = roll('old-save', 'affiliated', true);
    const { affiliation: _affiliation, ...old } = saved;
    expect(migrateRegionSnapshot(old, 10)).toEqual({ ok: true, value: saved });
    expect(validateRegionSnapshot(old).ok).toBe(false);
    expect(validateRegionSnapshot({ ...saved, affiliation: 'unaffiliated' }).ok).toBe(false);
    expect(validateRegionSnapshot({ ...saved, mainRealm: saved.realms.length }).ok).toBe(false);
    expect(validateRegionSnapshot({ ...saved, mainRealm: -1 }).ok).toBe(false);
    expect(validateRegionSnapshot({ ...saved, authority: null }).ok).toBe(false);
    expect(migrateRegionSnapshot(old, 11).ok).toBe(false);
  });

  it('reproduces a new result from its saved resolved name-set provenance', () => {
    const config = { affiliation: 'unaffiliated' as const, generateNeighbors: true };
    const rolled = rollRegion('saved-provenance', config);
    const storedConfig = readRegionGeneratorConfig({ ...config, nameSet: rolled.nameSet });
    expect(rollRegionSnapshot('saved-provenance', storedConfig)).toEqual(
      toRegionSnapshot(rolled.region),
    );
  });

  it('reads historical config separately from fresh generation and saves random intent', () => {
    expect(readRegionGeneratorConfig({})).toEqual({
      affiliation: 'affiliated',
      generateNeighbors: true,
    });
    const config = readRegionGeneratorConfig({ affiliation: 'random', generateNeighbors: false });
    expect(config).toEqual({ affiliation: 'random', generateNeighbors: false });
    expect(
      readRegionGeneratorConfig({ affiliation: 'invalid', generateNeighbors: 'invalid' }),
    ).toEqual(config);
    expect(rollRegionSnapshot('provenance', config)).toEqual(rollRegionSnapshot('provenance'));
  });

  it('names observed terrain rather than the requested biome', () => {
    const region = regionFromSnapshot(roll('observed-name', 'unaffiliated'), new RNG('read'));
    const land = region.map.nodes.filter((node) => !node.isWater && !node.isOcean);
    expect(land.length).toBeGreaterThan(0);
    for (const node of land) node.biomeId = 'desert';
    const name = generateRegionGeographicName(region, new RNG('observed-name'));
    expect(name).not.toMatch(/Woods|Forest|Sea|Northern|Western|Eastern|Southern/);
    expect(name).toMatch(/Desert|Hills|Heights|Mountains$/);
  });

  it('uses a neutral name when no land supports a specific geographic noun', () => {
    const region = regionFromSnapshot(roll('name-fallback', 'unaffiliated'), new RNG('read'));
    region.map.nodes.forEach((node) => {
      node.isWater = true;
    });
    expect(generateRegionGeographicName(region, new RNG('name'))).toMatch(/Reaches$/);
  });
});
