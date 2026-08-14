import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'banshee',
  pluralName: 'banshees',
  adjective: 'banshee',
  breedType: 'banshee',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: [
        'flowing veil',
        'ragged gown',
        'shroud of mist',
        'tattered finery',
        'windswept hair',
      ],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black', 'blood red', 'hollow white', 'pale blue', 'silver'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'incorporeal',
      description: 'passes through solid matter except wards and magic',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'wail',
      description: 'a scream that buckles knees and stops hearts',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
      threatLevel: 1,
    },
  ],
  commonality: 3,
  genders: [
    {
      name: 'female',
      pronouns: {
        subjective: 'she',
        objective: 'her',
        possessive: 'her',
        reflexive: 'herself',
      },
    },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['banshee', 'undead'],
};
