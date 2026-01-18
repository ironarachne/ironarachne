import type { Archetype } from "./archetype_types";

export function getArchetypeByName(name: string, archetypes: Archetype[]): Archetype {
  const archetype = archetypes.find(archetype => archetype.name === name);

  if (!archetype) {
    throw new Error(`Archetype with name "${name}" not found.`);
  }

  return archetype;
}

export function filterArchetypes(archetypes: Archetype[], allowedTags: string[], disallowedTags: string[]): Archetype[] {
  return archetypes.filter(archetype => {
    const hasAllowedTags = allowedTags.length === 0 || allowedTags.every(tag => archetype.tags.includes(tag));
    const hasDisallowedTags = disallowedTags.some(tag => archetype.tags.includes(tag));
    return hasAllowedTags && !hasDisallowedTags;
  });
}
