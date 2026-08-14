import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

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
