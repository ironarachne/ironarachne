import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'hell hound',
  pluralName: 'hell hounds',
  adjective: 'hell hound',
  breedType: 'hell hound',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'grey'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['brown', 'mottled brown', 'olive', 'black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing amber', 'glowing orange', 'glowing red'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'immunity: fire damage',
      description: 'is immune to fire damage',
      category: 'immunity',
      threatLevel: 1,
    },
    {
      name: 'breath weapon: fire',
      description: 'can breathe fire once an hour',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [80, 120],
    length: [150, 230],
    mass: [65, 150],
  }),
  tags: ['demon', 'fiend', 'hell hound'],
};
