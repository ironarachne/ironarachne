import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'specter',
  pluralName: 'specters',
  adjective: 'specter',
  breedType: 'specter',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'underdark', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: [
        'colourless mist',
        'faceless drift',
        'ragged outline',
        'sheet of gloom',
        'wispy column',
      ],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['faint gleam', 'pair of sparks', 'pale holes', 'violet pinpoints', 'void'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'incorporeal',
      description: 'weapons pass through unless blessed or magical',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'life drain',
      description: 'touch leeches warmth and vitality',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'sunlight banishment',
      description: 'full daylight disperses its form for a time',
      category: 'weakness',
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['specter', 'undead'],
};
