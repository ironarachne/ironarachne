import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'alligator',
  pluralName: 'alligators',
  adjective: 'alligator',
  breedType: 'alligator',
  environments: ['coastal', 'forest', 'grassland', 'swamp'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'scales',
      category: 'scales',
      options: ['black', 'brown', 'dark', 'green', 'olive', 'tan'],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 2,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['alligator', 'reptile'],
};
