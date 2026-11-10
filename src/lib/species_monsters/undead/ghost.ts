import { Sizes } from '$lib/size';
import type { Species } from '$lib/species';
import { traditional } from '$lib/gender';
import { AgeCategories } from '$lib/age';

const ageCategories = AgeCategories.beastLifespanFourStage({ elderlyCommonality: 1 });
const genders = traditional();

export default <Species>{
  name: 'ghost',
  pluralName: 'ghosts',
  adjective: 'ghost',
  breedType: 'ghost',
  environments: ['coastal', 'forest', 'grassland', 'hill', 'mountain', 'swamp', 'urban'],
  creatureTypes: ['undead'],
  physicalTraitGeneratorConfigs: [
    {
      name: 'form',
      category: 'body',
      options: [
        'faint humanoid',
        'glassy silhouette',
        'pale afterimage',
        'translucent',
        'wavering',
      ],
      tags: ['body'],
    },
    {
      name: 'eyes',
      category: 'eyes',
      options: ['black pits', 'faint light', 'hollow', 'milky', 'pinprick glow'],
      tags: ['eyes'],
    },
  ],
  ageCategories,

  baseThreatLevel: 2,
  abilities: [
    {
      name: 'incorporeal',
      description: 'can move through walls and grasping hands',
      category: 'movement',
      threatLevel: 2,
    },
    {
      name: 'haunt',
      description: 'anchors to a place or object tied to its death',
      category: 'misc',
      threatLevel: 2,
    },
    {
      name: 'possession',
      description: 'can briefly ride a living host to speak or act',
      category: 'attack',
      threatLevel: 3,
    },
  ],
  commonality: 4,
  genders,
  sizeGeneratorConfigMatrix: Sizes.bodySizeMatrix(ageCategories, genders, {
    height: [140, 200],
    length: [0, 0],
    mass: [0, 0],
  }),
  tags: ['ghost', 'undead'],
};
