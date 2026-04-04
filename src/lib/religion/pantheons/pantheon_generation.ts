import type { Pantheon, PantheonGenerationConfig } from './pantheon_types';
import { generate as generateDeity } from '../deities/deity_generation';
import { generateRelationships } from '$lib/relationships/relationships';
import { RNG } from '@ironarachne/rng';
import { byName as speciesByName, sentient } from '$lib/species/common';

export function generate(seed: string, config: PantheonGenerationConfig): Pantheon {
  const rng = new RNG(seed);

  const numDeities = rng.int(config.minDeities, config.maxDeities);

  // Generate deities
  const deities = [];
  for (let i = 0; i < numDeities; i++) {
    // Build a DeityGenerationConfig for each deity
    const human = speciesByName('human', sentient());
    const species =
      config.speciesOptions && config.speciesOptions.length > 0
        ? rng.item(config.speciesOptions)
        : human;

    const deityConfig = {
      characterGenerationConfig: {
        species,
        maleFirstNameGenerator: config.maleNameGenerator,
        femaleFirstNameGenerator: config.femaleNameGenerator,
        familyNameGenerator: config.femaleNameGenerator,
        allowedAgeCategoryNames: ['adult', 'elderly'],
      },
      realmOptions: config.realms,
      domainOptions: config.domains,
      domainFilter: {
        name: null,
        hasHolyItems: null,
        hasHolySymbols: null,
        hasEnchantments: null,
        requiredTags: [],
        excludedTags: [],
      },
      minNumberOfDomains: 1,
      maxNumberOfDomains: 3,
      hasHolyItem: true,
      hasHolySymbol: true,
    };
    deities.push(generateDeity(seed + '-deity-' + i, deityConfig));
  }

  // Generate relationships between deities
  const relationships = generateRelationships(seed + '-relationships', deities, {
    tagFilter: { includeSomeTags: ['emotional', 'social'] },
  });

  for (const deity of deities) {
    deity.relationships = relationships.filter((r) => r.originatorId === deity.id);
  }

  // Pick a leader randomly
  const leader = deities.length > 0 ? rng.int(0, deities.length - 1) : -1;

  // Generate a name and description (placeholder logic)
  const name = `Pantheon of ${deities[leader]?.name || 'the Gods'}`;
  const description = `A pantheon of ${deities.length} deities.`;

  return {
    name,
    description,
    members: deities,
    relationships,
    leader,
  };
}
