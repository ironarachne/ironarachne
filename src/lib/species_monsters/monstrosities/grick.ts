import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'grick',
  pluralName: 'gricks',
  adjective: 'grick',
  breedType: 'grick',
  environments: ['forest', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'plates',
      category: 'scales',
      options: ['charcoal', 'grey', 'mottled brown', 'slate', 'stone'],
      tags: ['scales'],
    },
    {
      name: 'beak',
      category: 'beak',
      options: ['hooked', 'ivory', 'obsidian', 'serrated'],
      tags: ['beak'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'dark red', 'milky', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'stone camouflage',
      description: 'presses flat and resembles rubble or cave wall',
      category: 'misc',
      threatLevel: 2,
    },
    {
      name: 'constricting coils',
      description: 'wraps prey and grinds with armored segments',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['grick', 'monstrosity'],
};
