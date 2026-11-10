import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage();
const genders = traditional();

export default <Species>{
  name: 'barlgura',
  pluralName: 'barlguras',
  adjective: 'barlgura',
  breedType: 'barlgura',
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
  ageCategories,

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'camouflage',
      description: 'can fade to near-invisibility in undergrowth',
      category: 'misc',
      threatLevel: 2,
    },
    {
      name: 'pounce',
      description: 'can leap tremendous distances onto prey',
      category: 'movement',
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
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [220, 300],
    length: [0, 0],
    mass: [250, 475],
  }),
  tags: ['barlgura', 'demon', 'fiend'],
};
