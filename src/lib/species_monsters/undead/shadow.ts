import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'shadow',
  pluralName: 'shadows',
  adjective: 'shadow',
  breedType: 'shadow',
  environments: ['forest', 'grassland', 'hill', 'mountain', 'swamp', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'body',
      category: 'body',
      options: ['black', 'wispy', 'ethereal', 'dark'],
      tags: ['body'],
    },
  ],
  ageCategories,

  abilities: [
    {
      name: 'amorphous',
      description: 'can squeeze through small spaces',
      category: 'movement',
      threatLevel: 1,
    },
    {
      name: 'immunity: necrotic magic',
      description: 'immune to necrotic magic',
      category: 'immunity',
      threatLevel: 1,
    },
    {
      name: 'immunity: poison',
      description: 'immune to poison',
      category: 'immunity',
      threatLevel: 1,
    },
    {
      name: 'darkvision',
      description: 'can see in the dark',
      category: 'senses',
      threatLevel: 1,
    },
    {
      name: 'drain strength',
      description: 'drains strength on melee attacks',
      category: 'attack',
      threatLevel: 2,
    },
  ],
  baseThreatLevel: 4,
  commonality: 5,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [130, 200],
    length: [0, 0],
    mass: [0, 0],
  }),
  tags: ['shadow', 'undead'],
};
