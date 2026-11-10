import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'roper',
  pluralName: 'ropers',
  adjective: 'roper',
  breedType: 'roper',
  environments: ['mountain', 'underdark'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hide',
      category: 'skin',
      options: ['grey', 'limestone', 'mossy', 'stalactite white', 'wet stone'],
      tags: ['skin'],
    },
    {
      name: 'maw',
      category: 'body',
      options: ['circular', 'ringed teeth', 'wide gullet'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'milky', 'pale green', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'false rock',
      description: 'holds still and passes for cave stone',
      category: 'misc',
      threatLevel: 2,
    },
    {
      name: 'grasping tendrils',
      description: 'sticky strands reel prey toward its maw',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'slowing saliva',
      description: 'digestive enzymes sap strength and speed',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [220, 350],
    length: [140, 250],
    mass: [700, 2200],
  }),
  tags: ['monstrosity', 'roper'],
};
