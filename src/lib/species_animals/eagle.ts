import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'eagle',
  pluralName: 'eagles',
  adjective: 'eagle',
  breedType: 'eagle',
  environments: ['desert', 'forest', 'grassland', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'brown', 'tan'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['brown', 'yellow', 'light', 'black'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanHatchlingAdultFromTwo(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['eagle'],
};
