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

/**
 * The facts about a settlement that decide which acute problems are plausible for it, derived once
 * so the row-selecting functions below read as a list of conditions rather than a wall of
 * arithmetic.
 */
type AcuteConditions = {
  precipitation: number;
  categoryName: string;
  biomeName: string;
  isWet: boolean;
  isDry: boolean;
  isVeryHot: boolean;
  isCold: boolean;
  isRoughGround: boolean;
  isUrbanCore: boolean;
  isRural: boolean;
  isCoastal: boolean;
  isRiver: boolean;
  isHigh: boolean;
};

function deriveAcuteConditions(ctx: ProblemContext): AcuteConditions {
  const { facets, environment: env, category } = ctx;
  const tags = new Set(facets.settlementTags);

  const t = env.climate.temperature;
  const pAmt = env.climate.precipitationAmount;
  const hum = env.climate.humidity;
  const relief = env.terrain.reliefEnergy;
  const elev = env.terrain.elevationMax;
  const water = (env.waterSystem.waterType || '').toLowerCase();
  const isSalt = water.includes('salt') || water.includes('sea') || water.includes('ocean');
  const hasFresh =
    water.includes('fresh') || water === 'river' || (water.includes('river') && !isSalt);

  return {
    precipitation: pAmt,
    categoryName: category.name.toLowerCase(),
    biomeName: env.biome.name.toLowerCase(),
    isWet: pAmt > 0.5 || hum > 0.62,
    isDry: pAmt < 0.28 && hum < 0.42,
    isVeryHot: t > 28 || tags.has('hot_climate'),
    isCold: t < 2 || tags.has('cold_climate'),
    isRoughGround: relief > 0.48 || elev > 2200,
    isUrbanCore: tags.has('urban_core'),
    isRural: tags.has('rural'),
    isCoastal: tags.has('coastal'),
    isRiver: tags.has('river_trade') || hasFresh,
    isHigh: tags.has('highland') || relief > 0.45,
  };
}

/** Problems that follow from how well the settlement is run: law, food, trade, health. */
function addFacetRows(seen: Set<string>, out: ProblemRow[], facets: SettlementFacets): void {
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
}

/** Problems that follow from where the settlement sits: its water, climate and elevation. */
function addSiteRows(seen: Set<string>, out: ProblemRow[], cond: AcuteConditions): void {
  if (cond.isRiver && (cond.isWet || cond.precipitation > 0.4)) {
    addRowsUnique(seen, out, Rows.ACUTE_RIVER);
  }
  if (cond.isRiver && cond.isDry) {
    addRowsUnique(seen, out, Rows.ACUTE_DRY);
  }

  if (cond.isCoastal) {
    addRowsUnique(seen, out, Rows.ACUTE_COAST);
  }

  if (cond.isCold) {
    addRowsUnique(seen, out, Rows.ACUTE_COLD);
  }
  if (cond.isVeryHot) {
    addRowsUnique(seen, out, Rows.ACUTE_HEAT);
  }

  if (cond.isHigh) {
    addRowsUnique(seen, out, Rows.ACUTE_HIGHLAND);
  }

  if (cond.isUrbanCore) {
    addRowsUnique(seen, out, Rows.ACUTE_URBAN);
  }
  if (cond.isRural) {
    addRowsUnique(seen, out, Rows.ACUTE_RURAL);
  }
}

/** Problems that follow from what the settlement lives on. */
function addEconomicRoleRows(
  seen: Set<string>,
  out: ProblemRow[],
  economicRole: SettlementFacets['economicRole'],
): void {
  switch (economicRole) {
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
}

/** Problems that follow from how rich and how big the settlement is. */
function addScaleRows(
  seen: Set<string>,
  out: ProblemRow[],
  population: number,
  prosperity: number,
): void {
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
}

/**
 * Problems from the surrounding land, and from what the settlement is called — a place named a
 * city gets urban problems even when its tags did not say so.
 */
function addBiomeAndCategoryRows(
  seen: Set<string>,
  out: ProblemRow[],
  cond: AcuteConditions,
): void {
  const { biomeName, categoryName, precipitation } = cond;

  if (
    biomeName.includes('desert') ||
    biomeName.includes('arid') ||
    (cond.isDry && precipitation < 0.32)
  ) {
    addRowsUnique(seen, out, Rows.ACUTE_BIOME_DRY);
  }
  if (
    biomeName.includes('jungle') ||
    biomeName.includes('rain') ||
    biomeName.includes('swamp') ||
    biomeName.includes('marsh') ||
    (cond.isWet && precipitation > 0.45)
  ) {
    addRowsUnique(seen, out, Rows.ACUTE_BIOME_WET);
  }
  if (cond.isRoughGround) {
    addRowsUnique(seen, out, Rows.ACUTE_TERRAIN_ROUGH);
  }

  if (
    categoryName.includes('metropolis') ||
    categoryName.includes('city') ||
    categoryName.includes('borough')
  ) {
    addRowsUnique(seen, out, Rows.ACUTE_URBAN);
  }
  if (categoryName.includes('hamlet') || categoryName.includes('village')) {
    addRowsUnique(seen, out, Rows.ACUTE_RURAL);
  }
}

/**
 * The acute problems plausible for one settlement, in a fixed order — `pickRows` draws from this
 * list, so the order the sections run in is part of the generator's output.
 */
function buildAcutePool(ctx: ProblemContext): ProblemRow[] {
  const { facets, population, prosperity } = ctx;
  const cond = deriveAcuteConditions(ctx);
  const seen = new Set<string>();
  const out: ProblemRow[] = [];

  addFacetRows(seen, out, facets);
  addSiteRows(seen, out, cond);
  addEconomicRoleRows(seen, out, facets.economicRole);
  addScaleRows(seen, out, population, prosperity);
  addBiomeAndCategoryRows(seen, out, cond);

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
