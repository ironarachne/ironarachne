import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['bulette', 'monstrosity'],
};
