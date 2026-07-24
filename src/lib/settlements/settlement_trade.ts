import * as Words from '@ironarachne/words';
import type Environment from '$lib/environment/environment.js';
import type { RNG } from '@ironarachne/rng';
import type { SettlementEconomicRole } from './settlement_types.js';

const GRAIN = ['grain', 'barley', 'millet', 'rye', 'dried legumes', 'straw for thatch'];
const LIVESTOCK = ['cattle', 'wool', 'hides', 'cheese', 'fleece'];
const FOREST = ['timber', 'charcoal', 'resins', 'game meat', 'furs', 'cordage'];
const ORE = ['copper ingots', 'iron ore', 'tin', 'crushed stone'];
const FISH = ['salt fish', 'fish oil', 'shellfish', 'kelp', 'dried fish'];
const LUXURY = ['spices', 'dyes', 'fine cloth', 'glassware', 'worked metal goods'];

const IMPORTS_INDUSTRIAL = ['coal', 'iron ingots', 'lime', 'timber', 'leather', 'resins'];
const IMPORTS_MARKET = [
  'spices',
  'textiles',
  'exotic woods',
  'salt',
  'preserved food',
  'fine ceramics',
];
const IMPORTS_AGRARIAN = ['salt', 'iron tools', 'linseed oil', 'millstones', 'hemp rope'];
const IMPORTS_EXTRACT = [
  'picks and drills',
  'timber supports',
  'leather aprons',
  'quicksilver for amalgams',
];

type TradeInput = {
  economicRole: SettlementEconomicRole;
  environment: Environment;
  rng: RNG;
};

function uniq(xs: string[]): string[] {
  return [...new Set(xs)];
}

/** `randomSet` requires `itemCount <= pool.length` or the RNG can push undefined; cap the count. */
function randomSubset(rng: RNG, count: number, pool: readonly string[]): string[] {
  if (count <= 0 || pool.length === 0) {
    return [];
  }
  return rng.randomSet(Math.min(count, pool.length), [...pool]);
}

function phraseOrLittle(items: string[]): string {
  if (items.length === 0) {
    return 'little';
  }
  return Words.arrayToPhrase(items);
}

/**
 * Narrative import/export strings plus a one-line blurb. Not a full economy sim.
 */
export function generateSettlementTrade(input: TradeInput): {
  primaryImports: string[];
  primaryExports: string[];
  tradeBlurb: string;
} {
  const { economicRole, environment: env, rng } = input;
  const biome = env.biome.name.toLowerCase();
  const isAquatic = env.biome.isAquatic;
  const nImp = rng.int(2, 4);
  const nExp = rng.int(2, 4);
  const exports: string[] = [];
  const imports: string[] = [];

  if (isAquatic || biome.includes('coast') || biome.includes('marine')) {
    exports.push(...randomSubset(rng, Math.min(3, nExp), FISH));
  }
  if (env.terrain.reliefEnergy > 0.5 || biome.includes('mountain') || biome.includes('alpine')) {
    exports.push(...randomSubset(rng, 2, ORE));
  }
  if (env.biome.humidity > 0.4 && !isAquatic) {
    exports.push(...randomSubset(rng, 3, GRAIN));
  } else if (!isAquatic) {
    exports.push(...randomSubset(rng, 2, LIVESTOCK));
  }
  exports.push(...randomSubset(rng, Math.max(0, nExp - exports.length + 1), FOREST));

  if (economicRole === 'market' || economicRole === 'industrial') {
    imports.push(...randomSubset(rng, nImp, IMPORTS_MARKET));
  } else if (economicRole === 'agrarian') {
    imports.push(...randomSubset(rng, nImp, IMPORTS_AGRARIAN));
  } else if (economicRole === 'extractive') {
    imports.push(...randomSubset(rng, nImp, IMPORTS_EXTRACT));
  } else {
    imports.push(...randomSubset(rng, nImp, IMPORTS_INDUSTRIAL));
  }
  if (economicRole === 'industrial' && imports.length < nImp) {
    imports.push(...randomSubset(rng, nImp - imports.length, IMPORTS_INDUSTRIAL));
  }
  if (rng.int(0, 1) === 1) {
    exports.push(rng.item(LUXURY));
  }
  if (rng.int(0, 1) === 1) {
    imports.push(rng.item(LUXURY));
  }

  const uExp = uniq(exports).slice(0, 6);
  const uImp = uniq(imports).slice(0, 6);
  const blurb = `Traders here move ${phraseOrLittle(uExp)} out and bring ${phraseOrLittle(uImp)} in.`;
  return {
    primaryImports: uImp,
    primaryExports: uExp,
    tradeBlurb: blurb,
  };
}
