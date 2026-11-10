import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'horse',
  pluralName: 'horses',
  adjective: 'horse',
  breedType: 'horse',
  environments: ['forest', 'grassland', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'tan', 'dappled', 'pinto', 'white', 'grey'],
      tags: ['fur'],
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
    height: [145, 175],
    length: [210, 280],
    mass: [410, 590],
  }),
  tags: ['horse'],
};
