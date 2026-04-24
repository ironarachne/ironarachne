import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'shifter',
  pluralName: 'shifters',
  adjective: 'shifter',
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
      options: ['black', 'blonde', 'brown', 'grey', 'red', 'russet', 'white patches'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['bronzed', 'light', 'pale', 'tan', 'weathered'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'brown', 'gold', 'green', 'yellow ring'],
      tags: ['eyes'],
    },
    {
      name: 'beast mark',
      category: 'body',
      options: ['bear', 'boar', 'elk', 'lizard', 'rat', 'tiger', 'wolf'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.0),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'shifting surge',
      description: 'can draw on a bestial burst of speed or might',
      category: 'trait',
    },
  ],
  commonality: 6,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(),
  tags: ['corruptible', 'humanoid', 'martial', 'sentient', 'shifter'],
};
