import * as Sizes from '$lib/size/sizes.js';
import type Species from '$lib/species/species.js';
import * as AgeCategories from '$lib/age/age_categories.js';

export default <Species>{
  name: 'succubus',
  pluralName: 'succubi',
  adjective: 'succubus',
  breedType: 'succubus',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'hair',
      category: 'hair',
      options: [
        'black',
        'blonde',
        'blood red',
        'brown',
        'copper',
        'dark',
        'platinum',
        'red',
        'russet',
        'silver-white',
        'violet black',
        'white',
      ],
      tags: ['hair'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'blue-black', 'mottled brown', 'olive', 'red', 'slick black'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing amber', 'glowing green', 'glowing orange', 'glowing red', 'void black'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'charm',
      description: 'can beguile with a word or glance',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'shapeshift',
      description: 'can assume a pleasing humanoid guise',
      category: 'shapeshift',
      threatLevel: 2,
    },
    {
      name: 'telepathic whispers',
      description: 'speaks mind to mind across a room',
      category: 'misc',
      threatLevel: 2,
    },
  ],
  commonality: 2,
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
  tags: ['demon', 'fiend', 'succubus'],
};
