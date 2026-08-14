import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { Environments } from '$lib/environment';
import { generateSettlementProblems } from './settlement_problems';
import { deriveSettlementFacets } from './derive_settlement_facets';
import Hamlet from './categories/hamlet';
import type { Environment } from '$lib/environment';

function sampleEnv(seed: string): Environment {
  const cfg = Environments.getDefaultConfig();
  cfg.rng = new RNG(seed);
  return Environments.generate(cfg);
}

describe('generateSettlementProblems', () => {
  it('produces many candidate rows so picks stay varied', () => {
    const environment = sampleEnv('problems-pool-1');
    const population = 900;
    const prosperity = 6;
    const facets = deriveSettlementFacets({
      category: Hamlet,
      population,
      prosperity,
      environment,
    });
    const { acuteProblems, creepingProblems } = generateSettlementProblems(
      {
        category: Hamlet,
        population,
        prosperity,
        facets,
        environment,
        rng: new RNG('problems-pool-rng-1'),
      },
      2,
      2,
    );
    expect(acuteProblems).toHaveLength(2);
    expect(creepingProblems).toHaveLength(2);
    const a = new Set(acuteProblems.map((p) => p.summary));
    const c = new Set(creepingProblems.map((p) => p.summary));
    expect(a.size).toBe(2);
    expect(c.size).toBe(2);
  });
});
