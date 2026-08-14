import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'fire elemental',
  pluralName: 'fire elementals',
  adjective: 'fire elemental',
  breedType: 'fire elemental',
  environments: ['desert', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: ['bonfire tall', 'coiled flame', 'ember core', 'sheet of flame', 'torch-sized'],
      tags: ['body'],
    },
    {
      name: 'core',
      category: 'eyes',
      options: ['blue-white', 'ember', 'red', 'white-hot', 'yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'immunity: fire',
      description: 'is immune to fire damage',
      category: 'immunity',
      threatLevel: 2,
    },
    {
      name: 'burning touch',
      description: 'contact ignites cloth, wood, and flesh',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'flame stride',
      description: 'can slip through narrow gaps as rolling fire',
      category: 'movement',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'fire elemental'],
};
