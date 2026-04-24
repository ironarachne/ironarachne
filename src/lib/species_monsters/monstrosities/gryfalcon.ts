import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'gryfalcon',
  pluralName: 'gryfalcons',
  adjective: 'gryfalcon',
  breedType: 'gryfalcon',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'wings',
      category: 'wings',
      options: ['striped', 'long', 'tapered'],
      tags: ['wings'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['short', 'narrow', 'sharp'],
      tags: ['beak'],
    },
    {
      name: 'feathers',
      category: 'feathers',
      options: ['white', 'grey', 'silver', 'brown'],
      tags: ['feathers'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'blue', 'amber', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
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
  tags: ['gryfalcon', 'monstrosity'],
};
