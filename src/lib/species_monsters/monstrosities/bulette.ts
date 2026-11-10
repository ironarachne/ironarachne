import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'bulette',
  pluralName: 'bulettes',
  adjective: 'bulette',
  breedType: 'bulette',
  environments: ['grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'carapace',
      category: 'scales',
      options: ['blue-grey', 'brown', 'mottled tan', 'slate', 'yellow-brown'],
      tags: ['scales'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'dark red', 'pale yellow', 'red'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'burrowing leap',
      description: 'erupts from earth in a crushing arc',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'tremorsense',
      description: 'senses footsteps through soil and stone',
      category: 'senses',
      threatLevel: 2,
    },
  ],
  commonality: 4,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [155, 225],
    length: [345, 520],
    mass: [950, 2400],
  }),
  tags: ['bulette', 'monstrosity'],
};
