import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'cow',
  pluralName: 'cows',
  adjective: 'cow',
  breedType: 'cow',
  environments: ['forest', 'grassland', 'mountain'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'tan', 'dappled', 'white and black', 'white', 'grey'],
      tags: ['fur'],
    },
    {
      name: 'horns',
      category: 'horns',
      options: ['long', 'short', 'curved'],
      tags: ['horns'],
    },
    {
      name: 'hair',
      category: 'hair',
      options: ['black', 'white', 'brown'],
      tags: ['hair'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'brown', 'dark', 'green', 'blue'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['cow'],
};
