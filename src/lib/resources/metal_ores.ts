import type * as RNG from '@ironarachne/rng';
import { WordGenerator } from '@ironarachne/word-generator';
import type { Resource } from './resource_types';
import { METAL_ORES } from './metal_ore_data';

/**
 * Every metal ore. The returned array is shared and must not be mutated. See `METAL_ORES`.
 */
export function getAllMetalOres(): Resource[] {
  return METAL_ORES;
}

export function generateFictionalMetalOre(rng: RNG.RNG): Resource {
  const nameGenerator = new WordGenerator(rng);
  nameGenerator.patterns = [
    'pvnveIUM',
    'pvnIUM',
    'evnIUM',
    'evnvlIUM',
    'tvnvlIUM',
    'tvnIUM',
    'tvlIUM',
    'tvlvlIUM',
  ];
  const oreName = nameGenerator.generate();
  const oreType = rng.item(['ferrous', 'non-ferrous']);

  const ore = {
    name: oreName,
    description: `A ${oreType} metal ore with unique properties.`,
    major_type: 'metal',
    minor_type: oreType,
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of the metal to conduct electricity.',
        value: rng.float(0, 10),
      },
      {
        name: 'melting_point',
        description: 'The temperature at which the metal melts.',
        value: rng.int(1000, 3000),
      },
      {
        name: 'density',
        description: 'The mass per unit volume of the metal.',
        value: rng.int(5000, 15000),
      },
      {
        name: 'hardness',
        description: 'The hardness of the metal on the Mohs scale.',
        value: rng.float(1, 10),
      },
    ],
    commonality: rng.int(1, 10),
  };

  return ore;
}
