import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'giant spider',
  pluralName: 'giant spiders',
  adjective: 'giant spider',
  breedType: 'giant spider',
  environments: ['coastal', 'forest', 'grassland', 'hill', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['beast'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['white', 'black', 'brown'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'dark', 'red', 'brown'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'venomous bite',
      description: 'can bite with venom',
      category: 'attack',
      threatLevel: 1,
    },
    {
      name: 'spin web',
      description: 'can spin webs',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['insect', 'giant spider', 'spider', 'arachnid'],
};
