import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'phase spider',
  pluralName: 'phase spiders',
  adjective: 'phase spider',
  breedType: 'phase spider',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'carapace',
      category: 'chitin',
      options: ['blue', 'brown', 'grey', 'mottled purple', 'violet sheen'],
      tags: ['chitin'],
    },
    {
      name: 'markings',
      category: 'body',
      options: ['arcane lines', 'eye spots', 'pale bands', 'spiral whorls'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'glowing blue', 'glowing green', 'red'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'ethereal jaunt',
      description: 'can flicker out of phase to bypass barriers',
      category: 'movement',
      threatLevel: 3,
    },
    {
      name: 'venomous bite',
      description: 'bite delivers numbing venom',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'web sense',
      description: 'knows when prey touches its strands',
      category: 'senses',
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['monstrosity', 'phase spider'],
};
