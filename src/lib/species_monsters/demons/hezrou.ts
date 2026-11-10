import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'hezrou',
  pluralName: 'hezrous',
  adjective: 'hezrou',
  breedType: 'hezrou',
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

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'stench',
      description: 'aura of nausea weakens nearby creatures',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'swamp stride',
      description: 'moves unhindered through bog and mire',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'resistance: poison',
      description: 'is resistant to poison',
      category: 'resistance',
      threatLevel: 1,
    },
  ],
  commonality: 1,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [235, 315],
    length: [0, 0],
    mass: [340, 670],
  }),
  tags: ['demon', 'fiend', 'hezrou'],
};
