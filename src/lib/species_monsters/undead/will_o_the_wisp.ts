import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: "will o' the wisp",
  pluralName: "will o' the wisps",
  adjective: "will o' the wisp",
  breedType: "will o' the wisp",
  environments: ['forest', 'swamp'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['glowing', 'bright', 'round', 'ethereal'],
      tags: ['body'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 }),

  baseThreatLevel: 1,
  abilities: [
    {
      name: 'illumination',
      description: 'glows with a bright light',
      category: 'misc',
      threatLevel: 1,
    },
    {
      name: 'minor invisibility',
      description: 'can become invisible unless attacking',
      category: 'invisibility',
      threatLevel: 2,
    },
  ],
  commonality: 5,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["will o' the wisp", 'undead'],
};
