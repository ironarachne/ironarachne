import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'air elemental',
  pluralName: 'air elementals',
  adjective: 'air elemental',
  breedType: 'air elemental',
  environments: ['arctic', 'coastal', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: ['cyclone column', 'dust devil', 'fog bank', 'gust front', 'shear wind'],
      tags: ['body'],
    },
    {
      name: 'spark',
      category: 'eyes',
      options: ['blue', 'grey', 'silver', 'static white', 'storm violet'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'flight',
      description: 'hover and dart without wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'whirlwind',
      description: 'can spin into a battering vortex',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'near invisibility',
      description: 'clear air makes it hard to spot until it strikes',
      category: 'misc',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'air elemental'],
};
