import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['monstrosity', 'remorhaz'],
};
