import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanHatchlingAdultFromTwo();
const genders = traditional();

export default <Species>{
  name: 'roc',
  pluralName: 'rocs',
  adjective: 'roc',
  breedType: 'roc',
  environments: ['coastal', 'desert', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['brown', 'golden', 'iron grey', 'ruddy', 'white'],
      tags: ['feathers'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['bone white', 'hooked', 'massive', 'yellow'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'gold', 'pale yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'flight',
      description: 'wings wide enough to darken a caravan',
      category: 'movement',
      threatLevel: 3,
    },
    {
      name: 'snatch',
      description: 'talons can lift horses or wagons',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'keen sight',
      description: 'spots movement from extreme altitude',
      category: 'senses',
      threatLevel: 2,
    },
  ],
  commonality: 2,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [400, 650],
    length: [850, 1350],
    mass: [1600, 4900],
  }),
  tags: ['monstrosity', 'roc'],
};
