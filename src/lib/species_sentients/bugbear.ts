import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'bugbear',
  pluralName: 'bugbears',
  adjective: 'bugbear',
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
  creatureTypes: ['humanoid', 'goblinoid'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'brown', 'dark', 'red', 'russet'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: [
        'black',
        'dark green',
        'dark grey',
        'grey',
        'light green',
        'green',
        'grey',
        'olive',
      ],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'red', 'brown', 'dark', 'yellow', 'orange', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(0.8),
  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.1, 1.15),
  tags: ['corruptible', 'bugbear', 'greenskin', 'martial', 'sentient', 'humanoid'],
};
