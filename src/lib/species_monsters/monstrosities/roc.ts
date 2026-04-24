import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'roc',
  pluralName: 'rocs',
  adjective: 'roc',
  breedType: 'roc',
  environments: ['coastal', 'desert', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['brown', 'golden', 'iron grey', 'ruddy', 'white'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['bone white', 'hooked', 'massive', 'yellow'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'gold', 'pale yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanHatchlingAdultFromTwo(),

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'flight',
      description: 'wings wide enough to darken a caravan',
      category: 'movement',
      threatLevel: 3,
    },
    {
      name: 'snatch',
      description: 'talons can lift horses or wagons',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'keen sight',
      description: 'spots movement from extreme altitude',
      category: 'senses',
      threatLevel: 2,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['monstrosity', 'roc'],
};
