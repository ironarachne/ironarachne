import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'gnome',
  pluralName: 'gnomes',
  adjective: 'gnomish',
  breedType: 'human',
  environments: ['arctic', 'coastal', 'desert', 'forest', 'grassland', 'hill', 'mountain', 'urban'],
  creatureTypes: ['humanoid', 'gnome'],
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
  ageCategories: AgeCategories.getHumanVariant(5),
  baseThreatLevel: 1,
  abilities: [],
  commonality: 20,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.4, 0.4),
  tags: ['corruptible', 'gnome', 'martial', 'magic', 'sentient', 'humanoid'],
};
