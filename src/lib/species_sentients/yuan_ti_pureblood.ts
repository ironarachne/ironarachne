import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'yuan-ti pureblood',
  pluralName: 'yuan-ti purebloods',
  adjective: 'yuan-ti',
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
      options: ['black', 'brown', 'dark', 'oily', 'silver streak', 'white'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['bronzed', 'pale', 'scale patches', 'serpent green', 'taupe', 'yellow undertone'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber slit', 'black', 'green slit', 'yellow slit'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.1),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'magic affinity',
      description: 'innate knack for serpent charms and curses',
      category: 'magic',
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(),
  tags: ['corruptible', 'humanoid', 'magic', 'martial', 'sentient', 'snakefolk', 'yuan-ti'],
};
