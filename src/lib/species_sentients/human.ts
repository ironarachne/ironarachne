import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'human',
  pluralName: 'humans',
  adjective: 'human',
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
      name: 'hair',
      category: 'hair',
      options: ['black', 'blonde', 'brown', 'dark', 'light', 'red', 'russet'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'bronzed', 'ebony', 'light', 'pale', 'tan', 'white'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'brown', 'dark', 'green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.humanStandard(),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 200,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(),
  tags: ['corruptible', 'human', 'martial', 'magic', 'sentient', 'humanoid'],
};
