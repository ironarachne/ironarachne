import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanHatchlingAdultFromFive();
const genders = traditional();

export default <Species>{
  name: 'snake',
  pluralName: 'snakes',
  adjective: 'snake',
  breedType: 'snake',
  environments: ['desert', 'forest', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'scales',
      category: 'scales',
      options: [
        'black',
        'brown',
        'tan',
        'striped',
        'diamond-patterned',
        'green',
        'grey',
        'white',
        'pale',
        'yellow',
      ],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green', 'black', 'white'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [0, 0],
    length: [60, 200],
    mass: [0.15, 3.5],
  }),
  tags: ['snake'],
};
