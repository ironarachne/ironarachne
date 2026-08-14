import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'shoosuva',
  pluralName: 'shoosuvas',
  adjective: 'shoosuva',
  breedType: 'shoosuva',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'fur',
      category: 'fur',
      options: ['black', 'brown', 'mottled grey', 'olive'],
      tags: ['fur'],
    },
    {
      name: 'skin',
      category: 'skin',
      options: ['black', 'grey', 'olive', 'red'],
      tags: ['skin'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['glowing amber', 'glowing orange', 'glowing red'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanFourStage(),

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'infernal bite',
      description: 'bite carries wasting venom',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'reckless charge',
      description: 'barrels forward without fear',
      category: 'attack',
      threatLevel: 2,
    },
    {
      name: 'darkvision',
      description: 'can see in darkness',
      category: 'senses',
      threatLevel: 1,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'shoosuva'],
};
