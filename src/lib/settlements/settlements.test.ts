import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { NameGenerator } from '@ironarachne/made-up-names';
import { Environments } from '$lib/environment';
import { getDefaultCharacterGenerationConfig } from '$lib/characters';
import { deriveSettlementFacets } from './derive_settlement_facets';
import * as Settlements from './settlements';
import Hamlet from './categories/hamlet';
import type { SettlementEconomicRole } from './settlement_types';

function sampleEnvironment(seed: string) {
  const cfg = Environments.getDefaultConfig(new RNG(seed));
  return Environments.generate(cfg);
}

describe('deriveSettlementFacets', () => {
  it('keeps scalars in 0–10', () => {
    const env = sampleEnvironment('facets-1');
    const f = deriveSettlementFacets({
      category: Hamlet,
      population: 400,
      prosperity: 6,
      environment: env,
    });
    for (const k of ['lawAndOrder', 'commerce', 'foodSecurity', 'publicHealth'] as const) {
      expect(f[k]).toBeGreaterThanOrEqual(0);
      expect(f[k]).toBeLessThanOrEqual(10);
    }
  });

  it('increases commerce with higher prosperity (same environment)', () => {
    const env = sampleEnvironment('facets-2');
    const low = deriveSettlementFacets({
      category: Hamlet,
      population: 400,
      prosperity: 2,
      environment: env,
    });
    const high = deriveSettlementFacets({
      category: Hamlet,
      population: 400,
      prosperity: 12,
      environment: env,
    });
    expect(high.commerce).toBeGreaterThanOrEqual(low.commerce);
  });

  it('returns a valid economic role', () => {
    const env = sampleEnvironment('facets-3');
    const f = deriveSettlementFacets({
      category: Hamlet,
      population: 400,
      prosperity: 5,
      environment: env,
    });
    const valid: SettlementEconomicRole[] = [
      'agrarian',
      'market',
      'industrial',
      'extractive',
      'mixed',
    ];
    expect(valid).toContain(f.economicRole);
  });
});

describe('generate', () => {
  it('fills structured facets on every run', () => {
    const config = Settlements.getDefaultConfig(new RNG('core-seed-1'));
    const s = Settlements.generate(config);
    expect(s.lawAndOrder).toBeDefined();
    expect(s.settlementTags).toBeInstanceOf(Array);
    expect(s.economicRole).toBeTruthy();
  });

  it('does not add optional blocks without enrichment', () => {
    const config = Settlements.getDefaultConfig(new RNG('core-seed-2'));
    const s = Settlements.generate(config);
    expect(s.organizations).toBeUndefined();
    expect(s.importantPeople).toBeUndefined();
    expect(s.primaryImports).toBeUndefined();
  });

  it('adds trade, problems, orgs, and notables when enrichment is set', () => {
    const rng = new RNG('enrich-seed-aa');
    const environmentConfig = Environments.getDefaultConfig(rng);
    const environment = Environments.generate(environmentConfig);
    const simpleNameGen = { generate: (_n: number) => [rng.randomString(8)] } as NameGenerator;
    const s = Settlements.generate({
      environment,
      nameGenerator: simpleNameGen,
      size: 'large',
      rng,
      enrichment: {
        seedPrefix: 'test-rich',
        includeTrade: true,
        includeProblems: true,
        includeOrganizations: true,
        importantCharacterCount: { min: 1, max: 1 },
        characterConfig: getDefaultCharacterGenerationConfig('notable-cfg-1'),
        genre: 'fantasy',
        organizationCount: { min: 1, max: 1 },
        acuteProblemCount: { min: 1, max: 1 },
        creepingProblemCount: { min: 1, max: 1 },
      },
    });
    expect(s.primaryImports && s.primaryImports.length).toBeGreaterThan(0);
    expect(s.primaryExports && s.primaryExports.length).toBeGreaterThan(0);
    expect(s.tradeBlurb).toBeDefined();
    expect(s.acuteProblems && s.acuteProblems.length).toBeGreaterThan(0);
    expect(s.creepingProblems && s.creepingProblems.length).toBeGreaterThan(0);
    expect(s.organizations && s.organizations.length).toBeGreaterThan(0);
    expect(s.importantPeople && s.importantPeople.length).toBe(1);
    const p = s.importantPeople![0]!;
    expect(p.importance.length).toBeGreaterThan(0);
    expect(p.roleId.length).toBeGreaterThan(0);
    expect(p.salientPersonality.length).toBeGreaterThan(0);
  });
});
