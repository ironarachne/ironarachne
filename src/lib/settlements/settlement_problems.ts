import type { RNG } from '@ironarachne/rng';
import type Environment from '$lib/environment/environment.js';
import type { SettlementCategory, SettlementProblem } from './settlement_types.js';
import type { SettlementFacets } from './derive_settlement_facets.js';
import type { ProblemRow } from './settlement_problem_rows.js';
import * as Rows from './settlement_problem_rows.js';

type ProblemContext = {
  category: SettlementCategory;
  population: number;
  prosperity: number;
  facets: SettlementFacets;
  environment: Environment;
  rng: RNG;
};

function addRowsUnique(
  seen: Set<string>,
  out: ProblemRow[],
  rows: readonly Pick<ProblemRow, 'summary' | 'detail'>[],
): void {
  for (const row of rows) {
    if (seen.has(row.summary)) {
      continue;
    }
    seen.add(row.summary);
    out.push({ summary: row.summary, detail: row.detail });
  }
}

/**
 * Picks concrete acute and creeping `SettlementProblem`s from facet- and environment-weighted tables.
 */
export function generateSettlementProblems(
  ctx: ProblemContext,
  acuteCount: number,
  creepingCount: number,
): { acuteProblems: SettlementProblem[]; creepingProblems: SettlementProblem[] } {
  const { rng } = ctx;
  const acutePool = buildAcutePool(ctx);
  const creepPool = buildCreepingPool(ctx);
  return {
    acuteProblems: pickRows(acutePool, acuteCount, rng).map((row) => ({
      kind: 'acute' as const,
      summary: row.summary,
      detail: row.detail,
    })),
    creepingProblems: pickRows(creepPool, creepingCount, rng).map((row) => ({
      kind: 'creeping' as const,
      summary: row.summary,
      detail: row.detail,
    })),
  };
}

function buildAcutePool(ctx: ProblemContext): ProblemRow[] {
  const { facets, environment: env, population, prosperity, category } = ctx;
  const tags = new Set(facets.settlementTags);
  const seen = new Set<string>();
  const out: ProblemRow[] = [];

  const t = env.climate.temperature;
  const pAmt = env.climate.precipitationAmount;
  const hum = env.climate.humidity;
  const relief = env.terrain.reliefEnergy;
  const elev = env.terrain.elevationMax;
  const water = (env.waterSystem.waterType || '').toLowerCase();
  const isSalt = water.includes('salt') || water.includes('sea') || water.includes('ocean');
  const hasFresh =
    water.includes('fresh') || water === 'river' || (water.includes('river') && !isSalt);
  const name = category.name.toLowerCase();
  const biomeName = env.biome.name.toLowerCase();

  const isWet = pAmt > 0.5 || hum > 0.62;
  const isDry = pAmt < 0.28 && hum < 0.42;
  const isVeryHot = t > 28 || tags.has('hot_climate');
  const isCold = t < 2 || tags.has('cold_climate');
  const isRoughGround = relief > 0.48 || elev > 2200;
  const isUrbanCore = tags.has('urban_core');
  const isRural = tags.has('rural');
  const isCoastal = tags.has('coastal');
  const isRiver = tags.has('river_trade') || hasFresh;
  const isHigh = tags.has('highland') || relief > 0.45;

  if (facets.lawAndOrder < 5) {
    addRowsUnique(seen, out, Rows.ACUTE_LAW);
  }
  if (facets.lawAndOrder < 3) {
    addRowsUnique(seen, out, Rows.ACUTE_LAW_SEVERE);
  }
  if (facets.lawAndOrder >= 8) {
    addRowsUnique(seen, out, Rows.ACUTE_LAW_STRICT);
  }

  if (facets.foodSecurity < 5) {
    addRowsUnique(seen, out, Rows.ACUTE_FOOD);
  }
  if (facets.foodSecurity < 3) {
    addRowsUnique(seen, out, Rows.ACUTE_FOOD_SEVERE);
  }

  if (facets.commerce < 5) {
    addRowsUnique(seen, out, Rows.ACUTE_COMMERCE_LOW);
  }
  if (facets.commerce > 7) {
    addRowsUnique(seen, out, Rows.ACUTE_COMMERCE_HIGH);
  }

  if (facets.publicHealth < 5) {
    addRowsUnique(seen, out, Rows.ACUTE_HEALTH);
  }
  if (facets.publicHealth < 3) {
    addRowsUnique(seen, out, Rows.ACUTE_HEALTH_SEVERE);
  }

  if (isRiver && (isWet || pAmt > 0.4)) {
    addRowsUnique(seen, out, Rows.ACUTE_RIVER);
  }
  if (isRiver && isDry) {
    addRowsUnique(seen, out, Rows.ACUTE_DRY);
  }

  if (isCoastal) {
    addRowsUnique(seen, out, Rows.ACUTE_COAST);
  }

  if (isCold) {
    addRowsUnique(seen, out, Rows.ACUTE_COLD);
  }
  if (isVeryHot) {
    addRowsUnique(seen, out, Rows.ACUTE_HEAT);
  }

  if (isHigh) {
    addRowsUnique(seen, out, Rows.ACUTE_HIGHLAND);
  }

  if (isUrbanCore) {
    addRowsUnique(seen, out, Rows.ACUTE_URBAN);
  }
  if (isRural) {
    addRowsUnique(seen, out, Rows.ACUTE_RURAL);
  }

  switch (facets.economicRole) {
    case 'agrarian':
      addRowsUnique(seen, out, Rows.ACUTE_ECON_AGRARIAN);
      break;
    case 'market':
      addRowsUnique(seen, out, Rows.ACUTE_ECON_MARKET);
      break;
    case 'industrial':
      addRowsUnique(seen, out, Rows.ACUTE_ECON_INDUSTRIAL);
      break;
    case 'extractive':
      addRowsUnique(seen, out, Rows.ACUTE_ECON_EXTRACTIVE);
      break;
    case 'mixed':
      addRowsUnique(seen, out, Rows.ACUTE_ECON_MIXED);
      break;
  }

  if (prosperity <= 3) {
    addRowsUnique(seen, out, Rows.ACUTE_PROSPERITY_LOW);
  }
  if (prosperity >= 9) {
    addRowsUnique(seen, out, Rows.ACUTE_PROSPERITY_HIGH);
  }
  if (population > 10_000) {
    addRowsUnique(seen, out, Rows.ACUTE_POP_LARGE);
  }
  if (population < 1200) {
    addRowsUnique(seen, out, Rows.ACUTE_POP_SMALL);
  }

  if (biomeName.includes('desert') || biomeName.includes('arid') || (isDry && pAmt < 0.32)) {
    addRowsUnique(seen, out, Rows.ACUTE_BIOME_DRY);
  }
  if (
    biomeName.includes('jungle') ||
    biomeName.includes('rain') ||
    biomeName.includes('swamp') ||
    biomeName.includes('marsh') ||
    (isWet && pAmt > 0.45)
  ) {
    addRowsUnique(seen, out, Rows.ACUTE_BIOME_WET);
  }
  if (isRoughGround) {
    addRowsUnique(seen, out, Rows.ACUTE_TERRAIN_ROUGH);
  }

  if (name.includes('metropolis') || name.includes('city') || name.includes('borough')) {
    addRowsUnique(seen, out, Rows.ACUTE_URBAN);
  }
  if (name.includes('hamlet') || name.includes('village')) {
    addRowsUnique(seen, out, Rows.ACUTE_RURAL);
  }

  addRowsUnique(seen, out, Rows.ACUTE_BROAD);

  if (out.length === 0) {
    addRowsUnique(seen, out, Rows.ACUTE_EMERGENCY_FALLBACK);
  }
  if (out.length < 8) {
    addRowsUnique(seen, out, Rows.ACUTE_EMERGENCY_FALLBACK);
  }
  return out;
}

function buildCreepingPool(ctx: ProblemContext): ProblemRow[] {
  const { facets, environment: env, population, prosperity } = ctx;
  const tags = new Set(facets.settlementTags);
  const seen = new Set<string>();
  const out: ProblemRow[] = [];

  const t = env.climate.temperature;
  const pAmt = env.climate.precipitationAmount;
  const hum = env.climate.humidity;
  const relief = env.terrain.reliefEnergy;
  const isDry = pAmt < 0.3 && hum < 0.45;
  const isWet = pAmt > 0.5 || hum > 0.58;
  const isCoastal = tags.has('coastal');
  const isRiver = tags.has('river_trade');
  const isHot = t > 28 || tags.has('hot_climate');
  const isCold = t < 2 || tags.has('cold_climate');
  const isHigh = tags.has('highland') || relief > 0.45;

  if (facets.lawAndOrder < 6) {
    addRowsUnique(seen, out, Rows.CREEP_LAW);
    addRowsUnique(seen, out, Rows.CREEP_BANDITRY);
  }

  if (facets.foodSecurity < 6) {
    addRowsUnique(seen, out, Rows.CREEP_FOOD);
  }
  if (facets.foodSecurity > 7) {
    addRowsUnique(seen, out, Rows.CREEP_FOOD_BOUNTIFUL);
  }

  if (facets.commerce < 5) {
    addRowsUnique(seen, out, Rows.CREEP_COMMERCE_LOW);
  }
  if (facets.commerce > 7) {
    addRowsUnique(seen, out, Rows.CREEP_COMMERCE_HIGH);
  }

  if (facets.publicHealth < 6) {
    addRowsUnique(seen, out, Rows.CREEP_HEALTH);
  }
  if (hum > 0.62) {
    addRowsUnique(seen, out, Rows.CREEP_HUMID);
  }

  if (prosperity > 7 && population > 4000) {
    addRowsUnique(seen, out, Rows.CREEP_CORRUPTION);
  }
  if (population > 6000) {
    addRowsUnique(seen, out, Rows.CREEP_GUILDS);
  }

  if (isCoastal) {
    addRowsUnique(seen, out, Rows.CREEP_COAST);
  }
  if (isCold) {
    addRowsUnique(seen, out, Rows.CREEP_COLD);
  }
  if (isHot) {
    addRowsUnique(seen, out, Rows.CREEP_HEAT);
  }
  if (isRiver) {
    addRowsUnique(seen, out, Rows.CREEP_RIVER);
  }
  if (isDry) {
    addRowsUnique(seen, out, Rows.CREEP_DRY);
  }
  if (isWet) {
    addRowsUnique(seen, out, Rows.CREEP_HUMID);
  }

  if (isHigh) {
    addRowsUnique(seen, out, Rows.CREEP_HIGHLAND);
  }
  if (tags.has('urban_core')) {
    addRowsUnique(seen, out, Rows.CREEP_URBAN);
  }
  if (tags.has('rural')) {
    addRowsUnique(seen, out, Rows.CREEP_RURAL);
  }

  switch (facets.economicRole) {
    case 'agrarian':
      addRowsUnique(seen, out, Rows.CREEP_ECON_AGRARIAN);
      break;
    case 'market':
      addRowsUnique(seen, out, Rows.CREEP_ECON_MARKET);
      break;
    case 'industrial':
      addRowsUnique(seen, out, Rows.CREEP_ECON_INDUSTRIAL);
      break;
    case 'extractive':
      addRowsUnique(seen, out, Rows.CREEP_ECON_EXTRACTIVE);
      break;
    case 'mixed':
      addRowsUnique(seen, out, Rows.CREEP_ECON_MIXED);
      break;
  }

  if (prosperity > 4) {
    addRowsUnique(seen, out, Rows.CREEP_PROSPERITY);
  }
  if (population > 5000) {
    addRowsUnique(seen, out, Rows.CREEP_POP);
  }

  addRowsUnique(seen, out, Rows.CREEP_BROAD);

  if (out.length === 0) {
    addRowsUnique(seen, out, Rows.CREEP_EMERGENCY_FALLBACK);
  }
  if (out.length < 8) {
    addRowsUnique(seen, out, Rows.CREEP_EMERGENCY_FALLBACK);
  }
  return out;
}

function pickRows(pool: ProblemRow[], n: number, rng: RNG): ProblemRow[] {
  if (n <= 0) {
    return [];
  }
  const copy = [...pool];
  const out: ProblemRow[] = [];
  while (out.length < n && copy.length > 0) {
    const idx = rng.int(0, copy.length - 1);
    out.push(copy[idx]!);
    copy.splice(idx, 1);
  }
  return out;
}
