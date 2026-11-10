import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'babau',
  pluralName: 'babaus',
  adjective: 'babau',
  breedType: 'babau',
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

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'acidic blood',
      description: 'blood burns flesh it touches',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'darkvision',
      description: 'can see in magical darkness',
      category: 'senses',
      threatLevel: 2,
    },
    {
      name: 'resistance: cold iron',
      description: 'takes reduced damage from mundane cold iron',
      category: 'resistance',
      threatLevel: 1,
    },
  ],
  commonality: 2,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [175, 215],
    length: [0, 0],
    mass: [55, 95],
  }),
  tags: ['babau', 'demon', 'fiend'],
};
