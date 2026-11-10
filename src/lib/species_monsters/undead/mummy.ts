import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'mummy',
  pluralName: 'mummies',
  adjective: 'mummy',
  breedType: 'mummy',
  environments: ['desert', 'forest', 'grassland', 'hill', 'mountain', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'wrappings',
      category: 'body',
      options: [
        'bone-white linen',
        'charred strips',
        'gold-threaded',
        'salt-stained',
        'tattered ochre',
      ],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['ember', 'empty sockets', 'faint gold', 'green flame', 'pinpoints of light'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'mummy rot',
      description: 'curse spreads from its touch or gaze',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'undead resilience',
      description: 'keeps moving until the body is ruined',
      category: 'trait',
      threatLevel: 2,
    },
    {
      name: 'desiccating aura',
      description: 'nearby air dries skin and cracks lips',
      category: 'misc',
      threatLevel: 1,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [145, 195],
    length: [0, 0],
    mass: [29, 68],
  }),
  tags: ['mummy', 'undead'],
};
