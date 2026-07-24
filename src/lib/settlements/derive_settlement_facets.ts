import type Environment from '$lib/environment/environment.js';
import type { SettlementCategory, SettlementEconomicRole } from './settlement_types.js';

export type SettlementFacets = {
  lawAndOrder: number;
  commerce: number;
  foodSecurity: number;
  publicHealth: number;
  settlementTags: string[];
  economicRole: SettlementEconomicRole;
};

type FacetInput = {
  category: SettlementCategory;
  population: number;
  prosperity: number;
  environment: Environment;
};

function clamp10(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n)));
}

/**
 * Derives 0–10 scalar facets, settlement tags, and economic role from size, prosperity, and environment.
 * Deterministic (no RNG) for stable tests and replays.
 */
export function deriveSettlementFacets(input: FacetInput): SettlementFacets {
  const { category, population, prosperity, environment: env } = input;
  const p = prosperity;
  const sizeClass = category.sizeClass;
  const urbanBoost = sizeClass === 'large' ? 1.2 : sizeClass === 'medium' ? 0.6 : 0;
  const nameLower = category.name.toLowerCase();

  const waterType = (env.waterSystem.waterType || '').toLowerCase();
  const hasFresh = waterType.includes('fresh') || waterType === 'river';
  const isSalt =
    waterType.includes('salt') || waterType.includes('sea') || waterType.includes('ocean');
  const highRelief = env.terrain.reliefEnergy > 0.45;
  const veryHigh = env.terrain.elevationMax > 2500;

  const humidity = env.biome.humidity;
  const precip = env.climate.precipitationAmount;
  const temp = env.climate.temperature;
  const agrarianLean = (humidity + precip) / 2;
  const foodFromEnv = 2 + agrarianLean * 4 + (hasFresh ? 1.5 : 0) + (env.biome.isAquatic ? 0.5 : 0);
  const foodFromProsperity = p * 0.35;
  const foodSecurity = clamp10(foodFromEnv + foodFromProsperity * 0.4 + urbanBoost * 0.3);

  const commerce = clamp10(2.2 + p * 0.55 + urbanBoost * 1.1 + (population > 8000 ? 0.7 : 0));
  const lawAndOrder = clamp10(2.5 + p * 0.45 + urbanBoost * 0.8 + (commerce > 6 ? 0.3 : 0));
  const publicHealth = clamp10(
    2.4 + p * 0.5 + (hasFresh ? 0.4 : -0.3) + (foodSecurity > 5 ? 0.4 : 0),
  );

  const tags: string[] = [];
  if (isSalt || env.biome.isAquatic) {
    tags.push('coastal');
  }
  if (hasFresh) {
    tags.push('river_trade');
  }
  if (veryHigh || highRelief) {
    tags.push('highland');
  }
  if (nameLower === 'metropolis' || nameLower === 'city') {
    tags.push('urban_core');
  }
  if (population < 2000) {
    tags.push('rural');
  }
  if (temp < 2) {
    tags.push('cold_climate');
  } else if (temp > 28) {
    tags.push('hot_climate');
  }

  const economicRole = deriveEconomicRole(category, population, p, env, { highRelief, veryHigh });

  return {
    lawAndOrder,
    commerce,
    foodSecurity,
    publicHealth,
    settlementTags: tags,
    economicRole,
  };
}

function deriveEconomicRole(
  category: SettlementCategory,
  population: number,
  prosperity: number,
  env: Environment,
  flags: { highRelief: boolean; veryHigh: boolean },
): SettlementEconomicRole {
  const n = category.name.toLowerCase();
  const isUrban = n === 'borough' || n === 'city' || n === 'metropolis' || n === 'town';
  if ((flags.highRelief || flags.veryHigh) && (n === 'village' || n === 'hamlet')) {
    return 'extractive';
  }
  if (flags.highRelief && !isUrban) {
    return 'extractive';
  }
  if (n === 'metropolis' || (n === 'city' && population > 20000)) {
    if (prosperity >= 7) {
      return 'market';
    }
    return 'industrial';
  }
  if (population > 8000 && prosperity >= 6 && (n === 'town' || n === 'borough')) {
    return 'market';
  }
  if (isUrban && prosperity >= 6) {
    return 'mixed';
  }
  if (n === 'hamlet' || n === 'village') {
    return 'agrarian';
  }
  if (n === 'town' && population < 6000) {
    return 'mixed';
  }
  return 'mixed';
}
