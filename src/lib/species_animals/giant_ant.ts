import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'giant ant',
  pluralName: 'giant ants',
  adjective: 'giant ant',
  breedType: 'giant ant',
  environments: ['forest', 'grassland', 'hill'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['red', 'black', 'brown'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['red', 'black', 'dark'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['insect', 'giant ant', 'ant', 'swarm'],
};
