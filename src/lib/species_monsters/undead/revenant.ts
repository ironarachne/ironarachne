import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'revenant',
  pluralName: 'revenants',
  adjective: 'revenant',
  breedType: 'revenant',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'skin',
      category: 'skin',
      options: ['ashen', 'blue-grey', 'corpse pale', 'mottled', 'waxy'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['burning coals', 'ice blue', 'pinprick light', 'void black', 'white ring'],
      tags: ['eyes'],
    },
    {
      name: 'wounds',
      category: 'body',
      options: ['arrow holes', 'cleaved armor', 'hanging flesh', 'rope burns', 'sword scars'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'vengeful focus',
      description: 'cannot rest until its killer or oath-breaker is destroyed',
      category: 'trait',
      threatLevel: 2,
    },
    {
      name: 'regeneration',
      description: 'unless consecrated or burned, its flesh knits shut',
      category: 'trait',
      threatLevel: 3,
    },
    {
      name: 'fearsome grapple',
      description: 'cold hands lock like iron',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['revenant', 'undead'],
};
