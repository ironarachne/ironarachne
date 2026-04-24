import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import { traditional } from '$lib/gender/index.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'shadow',
  pluralName: 'shadows',
  adjective: 'shadow',
  breedType: 'shadow',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['black', 'wispy', 'ethereal', 'dark'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  abilities: [
    {
      name: 'amorphous',
      description: 'can squeeze through small spaces',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'immunity: necrotic magic',
      description: 'immune to necrotic magic',
      category: 'immunity',
      threatLevel: 1,
    },
    {
      name: 'immunity: poison',
      description: 'immune to poison',
      category: 'immunity',
      threatLevel: 1,
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
      threatLevel: 1,
    },
    {
      name: 'drain strength',
      description: 'drains strength on melee attacks',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  baseThreatLevel: 4,
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['shadow', 'undead'],
};
