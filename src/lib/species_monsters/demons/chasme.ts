import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

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
  ageCategories,

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
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [90, 145],
    length: [170, 255],
    mass: [55, 135],
  }),
  tags: ['chasme', 'demon', 'fiend'],
};
