import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'goliath',
  pluralName: 'goliaths',
  adjective: 'goliath',
  breedType: 'giant',
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
  creatureTypes: ['humanoid', 'giant'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'brown', 'dark', 'grey', 'salt and pepper', 'white'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['ash grey', 'blue-grey', 'brown-grey', 'granite', 'pale grey'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['blue', 'brown', 'grey', 'ice blue', 'steel'],
      tags: ['eyes'],
    },
    {
      name: 'sigils',
      category: 'body',
      options: ['cheek bands', 'forehead marks', 'hand tattoos', 'linear scars', 'unmarked'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(0.85),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'mountain endurance',
      description: 'endures cold and thin air that wind others',
      category: 'trait',
    },
  ],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.15, 1.1),
  tags: ['corruptible', 'giant', 'goliath', 'humanoid', 'martial', 'sentient'],
};
