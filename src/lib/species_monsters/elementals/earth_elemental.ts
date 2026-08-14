import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'earth elemental',
  pluralName: 'earth elementals',
  adjective: 'earth elemental',
  breedType: 'earth elemental',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['elemental'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: ['boulder stack', 'clay golem', 'granite slab', 'loam giant', 'root-bound stone'],
      tags: ['body'],
    },
    {
      name: 'veins',
      category: 'eyes',
      options: ['amber', 'crystal gleam', 'glowing fissure', 'mica flash', 'molten seam'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'burrow',
      description: 'can merge with soil and stone to move unseen',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'thunderous slam',
      description: 'a blow that staggers and splinters stone',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'stone hide',
      description: 'blades chip; blunt force matters more',
      category: 'defense',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['elemental', 'earth elemental'],
};
