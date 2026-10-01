import type { Resource } from './resource_types';

/** Raw plant identities; suitability and the actual occurrence belong to ecology. */
export function getPlantProducts(plantName: string): Resource[] {
  const plants: Record<string, string> = { reeds: 'reed', papyrus: 'papyrus', flax: 'textile' };
  const type = plants[plantName];
  if (typeof type !== 'string') return [];
  return [
    {
      name: `${plantName} stems`,
      description: `Raw stems from represented ${plantName}; possible processing depends on the fiber type.`,
      major_type: 'plant-fiber',
      minor_type: type,
      is_refineable: true,
      properties: [],
      commonality: 3,
    },
  ];
}
