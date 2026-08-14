import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'owlbear',
  pluralName: 'owlbears',
  adjective: 'owlbear',
  breedType: 'owlbear',
  environments: ['forest', 'grassland', 'hill', 'mountain'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'beak',
      category: 'beak',
      options: ['hooked', 'crooked', 'large', 'sharp'],
      tags: ['beak'],
    },
    {
      name: 'feathers',
      category: 'feathers',
      options: ['white', 'grey', 'silver', 'brown'],
      tags: ['feathers'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['brown', 'blue', 'amber', 'grey'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 4,
  abilities: [],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  carcassBodyPlan: 'furred',
  tags: ['owlbear', 'monstrosity'],
};
