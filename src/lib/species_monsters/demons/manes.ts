import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'manes',
  pluralName: 'manes',
  adjective: 'manes',
  breedType: 'manes',
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

  baseThreatLevel: 0,
  abilities: [
    {
      name: 'pack frenzy',
      description: 'gains courage in numbers',
      category: 'trait',
      threatLevel: 1,
    },
    {
      name: 'claws',
      description: 'rending claws',
      category: 'attack',
      threatLevel: 1,
    },
  ],
  commonality: 6,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [70, 110],
    length: [0, 0],
    mass: [16, 38],
  }),
  tags: ['demon', 'fiend', 'manes'],
};
