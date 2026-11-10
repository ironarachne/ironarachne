import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanHatchlingAdultFromTwo();
const genders = traditional();

export default <Species>{
  name: 'egret',
  pluralName: 'egrets',
  adjective: 'egret',
  breedType: 'egret',
  environments: ['coastal', 'grassland', 'swamp'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'brown', 'grey', 'tan', 'white'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['black', 'brown', 'grey', 'yellow'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 0,
  abilities: [],
  commonality: 6,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [0, 0],
    length: [78, 105],
    mass: [0.7, 1.5],
  }),
  tags: ['egret', 'heron'],
};
