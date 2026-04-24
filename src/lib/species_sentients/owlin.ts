import * as AgeCategories from '$lib/age/age_categories.js';
import { traditional } from '$lib/gender/index.js';
import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';

export default <Species>{
  name: 'owlin',
  pluralName: 'owlins',
  adjective: 'owlin',
  breedType: 'owlin',
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
      name: 'feathers',
      category: 'feathers',
      options: ['barred brown', 'black', 'grey', 'snow white', 'speckled', 'tawny'],
      tags: ['feathers'],
    },
    {
      name: 'wings',
      category: 'wings',
      options: ['broad', 'compact', 'rounded', 'silent', 'soft-edged'],
      tags: ['wings'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['amber', 'black', 'gold', 'orange', 'violet'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.getHumanVariant(1.0),
  baseThreatLevel: 1,
  abilities: [
    {
      name: 'flight',
      description: 'can fly for short bursts',
      category: 'movement',
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.getHumanVariant(0.85, 0.95),
  tags: ['flying', 'humanoid', 'magic', 'martial', 'owlin', 'sentient'],
};
