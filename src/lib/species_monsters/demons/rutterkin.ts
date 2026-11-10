import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'rutterkin',
  pluralName: 'rutterkin',
  adjective: 'rutterkin',
  breedType: 'rutterkin',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'blue-black', 'mottled brown', 'olive', 'red', 'slick black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing amber', 'glowing green', 'glowing orange', 'glowing red', 'void black'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'herd master',
      description: 'bullies lesser fiends into obeying',
      category: 'trait',
      threatLevel: 1,
    },
    {
      name: 'goring horns',
      description: 'charges with barbed horns',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 4,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [140, 195],
    length: [0, 0],
    mass: [40, 95],
  }),
  tags: ['demon', 'fiend', 'rutterkin'],
};
