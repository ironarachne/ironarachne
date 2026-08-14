import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'amber ooze',
  pluralName: 'amber oozes',
  adjective: 'amber ooze',
  breedType: 'amber ooze',
  environments: ['forest', 'grassland', 'hill', 'swamp', 'underdark'],
  creatureTypes: ['ooze'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['dark amber', 'golden resin', 'honey thick', 'tawny', 'translucent gold'],
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
      name: 'adhesive grip',
      description: 'traps limbs and gear in tacky resin',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'sap lure',
      description: 'sweet scent draws insects and curious beasts',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['amber ooze', 'ooze'],
};
