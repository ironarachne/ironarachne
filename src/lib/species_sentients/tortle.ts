import { AgeCategories } from '$lib/age';
import { traditional } from '$lib/gender';
import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';

export default <Species>{
  name: 'tortle',
  pluralName: 'tortles',
  adjective: 'tortle',
  breedType: 'tortle',
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
      name: 'shell',
      category: 'shell',
      options: ['barnacle speckled', 'dark green', 'mossy', 'olive', 'smooth brown'],
      tags: ['shell'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['green', 'grey-green', 'leathery yellow', 'olive', 'yellow-green'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'brown', 'gold'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.2),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'natural armor',
      description: 'shell turns aside glancing blows',
      category: 'defense',
    },
    {
      name: 'hold breath',
      description: 'can stay submerged far longer than air-breathers',
      category: 'trait',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.95, 1.0),
  tags: ['humanoid', 'martial', 'sentient', 'tortle'],
};
