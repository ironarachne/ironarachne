import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'cow',
  pluralName: 'cows',
  adjective: 'cow',
  breedType: 'cow',
  environments: ['forest', 'grassland', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'tan', 'dappled', 'white and black', 'white', 'grey'],
      tags: ['fur'],
    },
    {
      name: 'horns',
      category: 'horns',
      options: ['long', 'short', 'curved'],
      tags: ['horns'],
    },
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'white', 'brown'],
      tags: ['hair'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green', 'blue'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [115, 155],
    length: [210, 300],
    mass: [400, 850],
  }),
  tags: ['cow'],
};
