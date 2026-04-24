import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'halfling',
  pluralName: 'halflings',
  adjective: 'halfling',
  breedType: 'human',
  environments: ['arctic', 'coastal', 'desert', 'forest', 'grassland', 'hill', 'mountain', 'urban'],
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
      options: ['bronzed', 'light', 'pale', 'tan', 'white'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'blue', 'brown', 'dark', 'green'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.5),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 20,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.5, 0.6),
  tags: ['halfling', 'sentient', 'humanoid'],
};
