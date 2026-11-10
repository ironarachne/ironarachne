import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'glabrezu',
  pluralName: 'glabrezus',
  adjective: 'glabrezu',
  breedType: 'glabrezu',
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
      name: 'true seeing',
      description: 'sees through illusions and many magical disguises',
      category: 'senses',
      threatLevel: 3,
    },
    {
      name: 'temptation',
      description: 'offers visions of desire to unbalance foes',
      category: 'misc',
      threatLevel: 3,
    },
    {
      name: 'pincer arms',
      description: 'massive claws can crush armor and bone',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 1,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [380, 500],
    length: [0, 0],
    mass: [1300, 2800],
  }),
  tags: ['demon', 'fiend', 'glabrezu'],
};
