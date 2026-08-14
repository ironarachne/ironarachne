import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'balor',
  pluralName: 'balors',
  adjective: 'balor',
  breedType: 'balor',
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

  baseThreatLevel: 5,
  abilities: [
    {
      name: 'immunity: fire damage',
      description: 'is immune to fire damage',
      category: 'immunity',
      threatLevel: 2,
    },
    {
      name: 'flight',
      description: 'can fly on vast burning wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'whip of flame',
      description: 'wields a lash that ignites what it strikes',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'death burst',
      description: 'explodes in fire when slain',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 1,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['balor', 'demon', 'fiend'],
};
