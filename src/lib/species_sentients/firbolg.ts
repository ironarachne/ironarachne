import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'firbolg',
  pluralName: 'firbolgs',
  adjective: 'firbolg',
  breedType: 'giant',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['humanoid', 'giant'],
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
  baseThreatLevel: 2,
  abilities: [
    {
      name: 'minor invisibility',
      description: 'can turn invisible when not attacking',
      category: 'invisibility',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(1.9, 1.8),
  tags: ['firbolg', 'giant', 'human', 'martial', 'magic', 'sentient', 'humanoid'],
};
