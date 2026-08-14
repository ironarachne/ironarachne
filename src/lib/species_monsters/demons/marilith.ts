import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'marilith',
  pluralName: 'mariliths',
  adjective: 'marilith',
  breedType: 'marilith',
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
      name: 'six blades',
      description: 'wields a whirlwind of coordinated sword strikes',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'parry',
      description: 'deflects projectiles and turns blows aside',
      category: 'defense',
      threatLevel: 2,
    },
    {
      name: 'tactical mind',
      description: 'reads a battlefield like a grandmaster',
      category: 'trait',
      threatLevel: 2,
    },
  ],
  commonality: 1,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'marilith'],
};
