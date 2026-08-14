import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'changeling',
  pluralName: 'changelings',
  adjective: 'changeling',
  breedType: 'human',
  environments: [
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'urban',
    'underdark',
  ],
  creatureTypes: ['humanoid'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: ['ash', 'black', 'blonde', 'brown', 'pale', 'silver', 'white'],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['grey', 'ivory', 'pale', 'porcelain', 'soft pink', 'warm beige'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'blue', 'brown', 'grey', 'green', 'hazel', 'silver'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.0),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'change appearance',
      description: 'can alter face and voice within humanoid bounds',
      category: 'shapeshift',
    },
  ],
  commonality: 8,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(),
  tags: ['changeling', 'corruptible', 'humanoid', 'magic', 'martial', 'sentient'],
};
