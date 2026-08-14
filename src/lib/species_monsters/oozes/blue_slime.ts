import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'blue slime',
  pluralName: 'blue slimes',
  adjective: 'blue slime',
  breedType: 'blue slime',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['blue', 'azure', 'dark blue'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
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
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['blue slime', 'ooze'],
};
