import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

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
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

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
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['mummy', 'undead'],
};
