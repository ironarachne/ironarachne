import type { RNG } from '@ironarachne/rng';
import type { Settlement, SettlementEnrichmentConfig } from './settlement_types.js';
import { deriveSettlementFacets } from './derive_settlement_facets.js';
import { generateSettlementTrade } from './settlement_trade.js';
import { generateSettlementProblems } from './settlement_problems.js';
import {
  generateSettlementOrganizations,
  resolveOrgCharacterConfig,
} from './settlement_organizations.js';
import {
  generateSettlementNotables,
  resolveNotableCharacterConfig,
} from './settlement_notables.js';

type BaseForFacets = Omit<
  Settlement,
  'lawAndOrder' | 'commerce' | 'foodSecurity' | 'publicHealth' | 'settlementTags' | 'economicRole'
>;

/**
 * Merges derived facets into a settlement (deterministic; no enrichment).
 */
export function buildSettlementWithFacets(base: BaseForFacets): Settlement {
  const f = deriveSettlementFacets({
    category: base.category,
    population: base.population,
    prosperity: base.prosperity,
    environment: base.environment,
  });
  return { ...base, ...f };
}

function countInRange(
  r: { min: number; max: number } | undefined,
  defaultMin: number,
  defaultMax: number,
  rng: RNG,
): number {
  const min = r?.min ?? defaultMin;
  const max = r?.max ?? defaultMax;
  if (min > max) {
    return 0;
  }
  return rng.int(min, max);
}

/**
 * Augments a fully-built settlement with optional trade, problems, orgs, and notables.
 */
export function applySettlementEnrichment(
  settlement: Settlement,
  enrichment: SettlementEnrichmentConfig,
  rng: RNG,
): Settlement {
  let result = settlement;
  const prefix = enrichment.seedPrefix ?? 'settlement';
  const genre = enrichment.genre ?? 'fantasy';

  if (enrichment.includeTrade) {
    const t = generateSettlementTrade({
      economicRole: settlement.economicRole,
      environment: settlement.environment,
      rng,
    });
    result = {
      ...result,
      primaryImports: t.primaryImports,
      primaryExports: t.primaryExports,
      tradeBlurb: t.tradeBlurb,
    };
  }

  if (enrichment.includeProblems) {
    const acuteN = countInRange(enrichment.acuteProblemCount, 1, 2, rng);
    const creepN = countInRange(enrichment.creepingProblemCount, 1, 2, rng);
    const facets = deriveSettlementFacets({
      category: settlement.category,
      population: settlement.population,
      prosperity: settlement.prosperity,
      environment: settlement.environment,
    });
    const p = generateSettlementProblems(
      {
        category: settlement.category,
        population: settlement.population,
        prosperity: settlement.prosperity,
        facets,
        environment: settlement.environment,
        rng,
      },
      acuteN,
      creepN,
    );
    result = {
      ...result,
      acuteProblems: p.acuteProblems,
      creepingProblems: p.creepingProblems,
    };
  }

  if (enrichment.includeOrganizations) {
    const n = countInRange(enrichment.organizationCount, 1, 2, rng);
    const orgChars = resolveOrgCharacterConfig(enrichment.characterConfig, prefix);
    const orgs = generateSettlementOrganizations({
      count: n,
      population: settlement.population,
      economicRole: settlement.economicRole,
      environment: settlement.environment,
      settlementName: settlement.name,
      seedPrefix: prefix,
      genre,
      rng,
      characterConfig: orgChars,
    });
    result = { ...result, organizations: orgs };
  }

  const notableRange = enrichment.importantCharacterCount;
  if (notableRange !== undefined && notableRange.max > 0) {
    const n = countInRange(notableRange, 1, 2, rng);
    if (n > 0) {
      const notableChars = resolveNotableCharacterConfig(enrichment.characterConfig, prefix);
      const people = generateSettlementNotables({
        count: n,
        settlement: {
          name: settlement.name,
          population: settlement.population,
          category: settlement.category,
          settlementTags: settlement.settlementTags,
        },
        seedPrefix: prefix,
        rng,
        characterConfig: notableChars,
      });
      result = { ...result, importantPeople: people };
    }
  }

  return result;
}
