import { generateSettlementArchitecture } from './settlement_architecture';
import { Environments } from '$lib/environment';
import * as Names from '$lib/names';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import * as Dice from '$lib/dice';
import * as Categories from './settlement_categories.js';
import { applySettlementEnrichment, buildSettlementWithFacets } from './enrich_settlement.js';
import { composeSettlementPortrait, settlementPortraitSubject } from './settlement_reading';
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
  // Keep the former checklist's five draws so portrait changes cannot reroll enrichment
  // or later regional identities. The caller supplies the seed for a dedicated prose stream.
  const portraitToken = config.rng.int(0, 2147483647);
  for (let draw = 0; draw < 4; draw++) config.rng.next();
  if (!config.deferDescription) {
    settlement.description = composeSettlementPortrait(
      settlementPortraitSubject(settlement),
      new RNG.RNG(JSON.stringify(['settlement-portrait-v1', portraitToken])),
    ).text;
  }
  if (config.enrichment) {
    settlement = applySettlementEnrichment(settlement, config.enrichment, config.rng);
  }
  return {
    ...settlement,
    architecture: generateSettlementArchitecture(settlement, config.architecture),
  };
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
