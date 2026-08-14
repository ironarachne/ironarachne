import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'babau',
  pluralName: 'babaus',
  adjective: 'babau',
  breedType: 'babau',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
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
      name: 'acidic blood',
      description: 'blood burns flesh it touches',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'darkvision',
      description: 'can see in magical darkness',
      category: 'senses',
      threatLevel: 2,
    },
    {
      name: 'resistance: cold iron',
      description: 'takes reduced damage from mundane cold iron',
      category: 'resistance',
      threatLevel: 1,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['babau', 'demon', 'fiend'],
};
