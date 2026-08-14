import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'crimson ooze',
  pluralName: 'crimson oozes',
  adjective: 'crimson ooze',
  breedType: 'crimson ooze',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['blood red', 'brick red', 'dark crimson', 'rust red', 'wine dark'],
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
    {
      name: 'blood scent',
      description: 'hastens toward open wounds and fresh kills',
      category: 'misc',
      threatLevel: 2,
    },
    {
      name: 'exsanguinating touch',
      description: 'contact encourages bleeding and weakness',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 4,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['crimson ooze', 'ooze'],
};
