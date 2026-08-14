import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

export default <Species>{
  name: 'vrock',
  pluralName: 'vrocks',
  adjective: 'vrock',
  breedType: 'vrock',
  environments: ['desert', 'forest', 'grassland', 'mountain', 'underdark', 'urban'],
  creatureTypes: ['fiend'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'feathers',
      category: 'feathers',
      options: ['black', 'blood-streaked', 'grey', 'mottled green', 'sooty'],
      tags: ['feathers'],
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
      options: ['glowing orange', 'glowing red', 'glowing yellow'],
      tags: ['eyes'],
    },
  ],
  ageCategories: AgeCategories.beastLifespanHatchlingAdultFromTwo(),

  baseThreatLevel: 3,
  abilities: [
    {
      name: 'flight',
      description: 'can fly on broad vulture wings',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'spore cloud',
      description: 'releases toxic spores that sicken nearby foes',
      category: 'attack',
      threatLevel: 3,
    },
    {
      name: 'screech',
      description: 'a shriek that staggers and deafens',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  commonality: 2,
  genders: traditional(),
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ['demon', 'fiend', 'vrock'],
};
