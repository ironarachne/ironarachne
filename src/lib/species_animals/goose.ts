import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'goose',
  pluralName: 'geese',
  adjective: 'goose',
  breedType: 'goose',
  environments: ['coastal', 'forest', 'grassland', 'hill', 'urban'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'brown', 'grey', 'tan', 'white'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['black', 'brown', 'orange', 'pink'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanHatchlingAdultFromTwo(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 8,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['goose', 'waterfowl'],
};
