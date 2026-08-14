import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'chasme',
  pluralName: 'chasmes',
  adjective: 'chasme',
  breedType: 'chasme',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'chitin',
      category: 'chitin',
      options: ['black', 'brown', 'mottled green', 'olive', 'red'],
      tags: ['chitin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['compound black', 'glowing green', 'glowing red'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'flight',
      description: 'can fly on buzzing wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'drone of sleep',
      description: 'can lull listeners toward magical slumber',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'wall crawl',
      description: 'can cling to ceilings and sheer stone',
      category: 'movement',
      threatLevel: 1,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['chasme', 'demon', 'fiend'],
};
