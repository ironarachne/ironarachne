import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'slithering tracker',
  pluralName: 'slithering trackers',
  adjective: 'slithering tracker',
  breedType: 'slithering tracker',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'underdark', 'urban'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['dark crimson', 'drying brown', 'rust streaked', 'wine stain', 'wine thick'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'amorphous',
      description: 'can squeeze through small spaces',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'climb walls and ceilings',
      description: 'can climb walls and ceilings',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'blood bond',
      description: 'can unerringly pursue a creature whose blood it has tasted',
      category: 'misc',
      threatLevel: 3,
    },
    {
      name: 'watery refuge',
      description: 'can thin out and hide in rain pools and gutters',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['ooze', 'slithering tracker'],
};
