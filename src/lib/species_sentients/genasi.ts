import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'genasi',
  pluralName: 'genasi',
  adjective: 'genasi',
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
      name: 'elemental lineage',
      category: 'body',
      options: ['air', 'earth', 'fire', 'water'],
      tags: ['elemental'],
    },
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'blue', 'brown', 'copper', 'flame red', 'sea green', 'white'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: [
        'bronze',
        'clay',
        'deep blue',
        'emerald cast',
        'ochre',
        'pale',
        'sandstone',
        'sky blue',
      ],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'blue', 'gold', 'green', 'silver'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.1),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.0, 1.0),
  tags: ['corruptible', 'elemental', 'genasi', 'humanoid', 'magic', 'martial', 'sentient'],
};
