import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'kingfisher',
  pluralName: 'kingfishers',
  adjective: 'kingfisher',
  breedType: 'kingfisher',
  environments: ['coastal', 'forest', 'swamp'],
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
      options: ['black', 'brown', 'grey', 'yellow'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanHatchlingAdultFromTwo(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['kingfisher'],
};
