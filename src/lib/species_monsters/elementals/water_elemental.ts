import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'water elemental',
  pluralName: 'water elementals',
  adjective: 'water elemental',
  breedType: 'water elemental',
  environments: ['coastal', 'forest', 'grassland', 'hill', 'swamp'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: ['breaker wave', 'creek swirl', 'rain veil', 'standing pool', 'tidal surge'],
      tags: ['body'],
    },
    {
      name: 'depth',
      category: 'eyes',
      options: ['black', 'blue-green', 'deep blue', 'grey-green', 'sea glass'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'engulf',
      description: 'can surround a creature in crushing water',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'flow through cracks',
      description: 'can pour through gaps too small for solid bodies',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'freeze vulnerability',
      description: 'partial freezing can slow or shatter its form',
      category: 'weakness',
      threatLevel: 1,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'water elemental'],
};
