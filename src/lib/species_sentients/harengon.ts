import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'harengon',
  pluralName: 'harengons',
  adjective: 'harengon',
  breedType: 'human',
  environments: [
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'urban',
    'underdark',
  ],
  creatureTypes: ['humanoid'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'cream', 'dappled', 'grey', 'sandy', 'white'],
      tags: ['fur'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'brown', 'gold', 'red'],
      tags: ['eyes'],
    },
    {
      name: 'ears',
      category: 'body',
      options: ['drooping', 'long', 'lopped', 'upright'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.0),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'lucky footwork',
      description: 'uncanny hops and dodges when danger closes',
      category: 'movement',
    },
  ],
  commonality: 7,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.55, 0.65),
  tags: ['harengon', 'humanoid', 'martial', 'sentient'],
};
