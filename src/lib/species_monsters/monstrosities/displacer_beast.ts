import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'displacer beast',
  pluralName: 'displacer beasts',
  adjective: 'displacer beast',
  breedType: 'displacer beast',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'underdark'],
  creatureTypes: ['monstrosity'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['blue-black', 'charcoal', 'deep blue', 'midnight', 'steel blue'],
      tags: ['fur'],
    },
    {
      name: 'tentacles',
      category: 'body',
      options: ['knobbed', 'long', 'muscled', 'whip-thin'],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['emerald', 'glowing green', 'pale blue', 'violet'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'displacement',
      description: 'appears a few feet from its true position',
      category: 'defense',
      threatLevel: 3,
    },
    {
      name: 'lashing tentacles',
      description: 'paired tentacles strike from the shoulders',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 3,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [85, 130],
    length: [225, 340],
    mass: [160, 340],
  }),
  tags: ['displacer beast', 'monstrosity'],
};
