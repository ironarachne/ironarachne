import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanHatchlingAdultFromTwo();
const genders = traditional();

export default <Species>{
  name: 'eagle',
  pluralName: 'eagles',
  adjective: 'eagle',
  breedType: 'eagle',
  environments: ['desert', 'forest', 'grassland', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'brown', 'tan'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['brown', 'yellow', 'light', 'black'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green'],
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
    length: [70, 105],
    mass: [3, 7],
  }),
  tags: ['eagle'],
};
