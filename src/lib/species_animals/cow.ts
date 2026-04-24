import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'cow',
  pluralName: 'cows',
  adjective: 'cow',
  breedType: 'cow',
  environments: ['forest', 'grassland', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'tan', 'dappled', 'white and black', 'white', 'grey'],
      tags: ['fur'],
    },
    {
      name: 'horns',
      category: 'horns',
      options: ['long', 'short', 'curved'],
      tags: ['horns'],
    },
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'white', 'brown'],
      tags: ['hair'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green', 'blue'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['cow'],
};
