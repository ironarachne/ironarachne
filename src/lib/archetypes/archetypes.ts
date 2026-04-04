import type { Archetype } from './archetype_types';

export function getArchetypeByName(name: string, archetypes: Archetype[]): Archetype {
  const archetype = archetypes.find((archetype) => archetype.name === name);

  if (!archetype) {
    throw new Error(`Archetype with name "${name}" not found.`);
  }

  return archetype;
}
