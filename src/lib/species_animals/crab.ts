import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'crab',
  pluralName: 'crabs',
  adjective: 'crab',
  breedType: 'crab',
  environments: ['coastal', 'swamp', 'urban'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'carapace',
      category: 'shell',
      options: ['black', 'brown', 'dark', 'green', 'red'],
      tags: ['shell'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'brown'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 0,
  abilities: [],
  commonality: 10,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [0, 0],
    length: [5, 22],
    mass: [0.03, 1.2],
  }),
  tags: ['crab', 'crustacean'],
};
