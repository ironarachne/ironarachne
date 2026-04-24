import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'giant dragonfly',
  pluralName: 'giant dragonflies',
  adjective: 'giant dragonfly',
  breedType: 'giant dragonfly',
  environments: ['forest', 'grassland', 'hill'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['yellow', 'black', 'brown'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'flight',
      description: 'can fly',
      category: 'movement',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['insect', 'giant dragonfly', 'dragonfly', 'flying', 'swarm'],
};
