import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanHatchlingAdultFromFive(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['snake'],
};
