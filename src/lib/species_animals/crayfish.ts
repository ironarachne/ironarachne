import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'crayfish',
  pluralName: 'crayfish',
  adjective: 'crayfish',
  breedType: 'crayfish',
  environments: ['forest', 'grassland', 'hill', 'swamp', 'underdark'],
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
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 0,
  abilities: [],
  commonality: 8,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['crayfish', 'crustacean'],
};
