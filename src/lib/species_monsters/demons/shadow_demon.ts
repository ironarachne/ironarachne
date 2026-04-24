import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'shadow demon',
  pluralName: 'shadow demons',
  adjective: 'shadow demon',
  breedType: 'shadow demon',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: ['smoke-wreathed', 'solid silhouette', 'tattered wings', 'wisp of void'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing green', 'glowing white', 'pinprick red', 'void black'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'incorporeal slip',
      description: 'can pass through narrow gaps and grasping hands',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'light burn',
      description: 'bright holy light sears its substance',
      category: 'weakness',
      threatLevel: 1,
    },
    {
      name: 'shadow merge',
      description: 'can vanish into natural darkness',
      category: 'invisibility',
      threatLevel: 2,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'shadow demon'],
};
