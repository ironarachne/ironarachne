import { Environments } from '$lib/environment';
import * as Names from '$lib/names';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import * as Dice from '$lib/dice';
import * as Categories from './settlement_categories.js';
import { applySettlementEnrichment, buildSettlementWithFacets } from './enrich_settlement.js';
import { pickCategoryPlausibleLine, socialToneFromFacets } from './settlement_narrative.js';
import type { Settlement, SettlementGeneratorConfig } from './settlement_types.js';

export function generate(config: SettlementGeneratorConfig): Settlement {
  const rawName =
    config.nameGenerator !== null ? config.nameGenerator.generate(1)[0] : 'Settlement';
  /** Town name generators often return all-lowercase; normalize to title case for display. */
  const settlementName = Words.title((rawName || 'Settlement').trim());
  const settlementCategory = config.rng.item(Categories.bySizeClass(config.size));
  const preFacets = {
    name: settlementName,
    category: settlementCategory,
    environment: config.environment,
    description: '',
    population: Categories.randomPopulation(settlementCategory, config.rng),
    prosperity: Dice.roll('2d6', config.rng),
  };
  let settlement = buildSettlementWithFacets(preFacets);
  settlement = { ...settlement, description: randomDescription(settlement, config.rng) };
  if (config.enrichment) {
    settlement = applySettlementEnrichment(settlement, config.enrichment, config.rng);
  }
  return settlement;
}

export function getDefaultConfig(
  rng: RNG.RNG = new RNG.RNG(Date.now().toString()),
): SettlementGeneratorConfig {
  const environmentConfig = Environments.getDefaultConfig(rng);

  const environment = Environments.generate(environmentConfig);
  const genSet = Names.getFantasyNameGeneratorSet('tiefling', rng);
  return {
    environment,
    nameGenerator: genSet.town,
    size: 'any',
    rng,
  };
}

function randomDescription(settlement: Settlement, rng: RNG.RNG): string {
  let description = rng.item([
    '{name} is a {category} of {population} people.',
    'The {category} of {name} has {population} people.',
  ]);

  description = description.replace('{category}', settlement.category.name);
  description = description.replace(
    '{population}',
    new Intl.NumberFormat().format(settlement.population),
  );
  description = description.replace('{name}', settlement.name);
  description += ` ${pickCategoryPlausibleLine(settlement.category, settlement.lawAndOrder, rng)}`;
  description += ` ${randomProsperity(settlement.prosperity, rng)}`;
  description += ` ${socialToneFromFacets(settlement, rng)}`;
  description += ` ${rng.item(settlement.environment.biome.features)}`;

  return description;
}

function randomProsperity(prosperity: number, rng: RNG.RNG): string {
  const prefixes = [
    'The people here',
    'Most people here',
    'Folks here',
    'Most folks here',
    'People here',
  ];

  let suffixes: string[] = [];

  if (prosperity < 4) {
    suffixes = [
      'have little more than what they need to survive',
      'struggle to make ends meet',
      'struggle to have enough to survive',
    ];
  } else if (prosperity < 8) {
    suffixes = [
      'have enough to meet their needs',
      'have just enough to meet their needs',
      'seem to be doing well',
      'have their needs met',
    ];
  } else {
    suffixes = ['have more wealth than most', 'are prosperous', 'have more than they need'];
  }

  const options: string[] = [];

  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      options.push(`${prefixes[i]} ${suffixes[j]}.`);
    }
  }

  return rng.item(options);
}
