import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'nalfeshnee',
  pluralName: 'nalfeshnees',
  adjective: 'nalfeshnee',
  breedType: 'nalfeshnee',
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

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'aura of greed',
      description: 'fills foes with crippling avarice and doubt',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'flight',
      description: 'can fly on broad wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'spell: conjure obstacle',
      description: 'can manifest barbs, pits, or snares',
      category: 'spell',
      threatLevel: 2,
    },
  ],
  commonality: 1,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [440, 570],
    length: [0, 0],
    mass: [1700, 3300],
  }),
  tags: ['demon', 'fiend', 'nalfeshnee'],
};
