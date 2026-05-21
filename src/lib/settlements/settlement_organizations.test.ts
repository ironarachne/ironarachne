import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Environments from '$lib/environment/environments';
import { getDefaultOrganizationCharacterConfig } from '$lib/organizations/fantasy';
import { generateSettlementOrganizations } from './settlement_organizations';

function sampleEnvironment(seed: string) {
  const cfg = Environments.getDefaultConfig();
  cfg.rng = new RNG(seed);
  return Environments.generate(cfg);
}

describe('generateSettlementOrganizations', () => {
  it('never returns science-fiction orgs when genre is fantasy', () => {
    const env = sampleEnvironment('org-genre-1');
    const charCfg = getDefaultOrganizationCharacterConfig('org-genre-chars');
    for (let i = 0; i < 80; i++) {
      const rng = new RNG(`org-genre-seed-${i}`);
      const population = rng.int(10, 20000);
      const economicRole = rng.item([
        'agrarian',
        'market',
        'industrial',
        'extractive',
        'mixed',
      ] as const);
      const orgs = generateSettlementOrganizations({
        count: 1,
        population,
        economicRole,
        environment: env,
        settlementName: 'Testville',
        seedPrefix: 'org-genre-test',
        genre: 'fantasy',
        rng,
        characterConfig: charCfg,
      });
      for (const org of orgs) {
        expect(org.genre).toBe('fantasy');
      }
    }
  });

  it('returns no orgs for tiny settlements when no fantasy kind fits', () => {
    const env = sampleEnvironment('org-genre-2');
    const charCfg = getDefaultOrganizationCharacterConfig('org-genre-chars-2');
    const rng = new RNG('org-genre-tiny');
    const orgs = generateSettlementOrganizations({
      count: 1,
      population: 40,
      economicRole: 'agrarian',
      environment: env,
      settlementName: 'Hamleton',
      seedPrefix: 'org-genre-tiny',
      genre: 'fantasy',
      rng,
      characterConfig: charCfg,
    });
    expect(orgs).toEqual([]);
  });
});
