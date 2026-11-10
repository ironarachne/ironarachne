import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'remorhaz',
  pluralName: 'remorhazes',
  adjective: 'remorhaz',
  breedType: 'remorhaz',
  environments: ['arctic', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'segments',
      category: 'chitin',
      options: ['blue-white', 'ice blue', 'ivory', 'pale blue', 'snow white'],
      tags: ['chitin'],
    },
    {
      name: 'heat plates',
      category: 'body',
      options: ['cracked orange', 'glowing seams', 'molten red', 'smoking vents'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'ember', 'ice blue', 'white'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 4,
  abilities: [
    {
      name: 'heated body',
      description: 'contact with its back can melt steel and scorch flesh',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'burrow ice',
      description: 'tunnels through snow and permafrost',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'swallow whole',
      description: 'can gulp smaller prey into a furnace gullet',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 2,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [220, 390],
    length: [750, 1350],
    mass: [2500, 8200],
  }),
  tags: ['monstrosity', 'remorhaz'],
};
