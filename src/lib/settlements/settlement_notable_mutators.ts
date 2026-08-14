import type { Archetype } from '$lib/archetypes';
import { getAllFantasyArchetypes } from '$lib/archetypes';
import { describe, getTitle } from '$lib/characters';
import type { Character } from '$lib/characters';
import { withPushedTitle } from '$lib/organizations';
import type { RNG } from '@ironarachne/rng';
import type { SettlementNotableRoleDefinition } from './settlement_notable_roles.js';

const archetypeByName = (() => {
  const m = new Map<string, Archetype>();
  for (const a of getAllFantasyArchetypes()) {
    m.set(a.name, a);
  }
  return m;
})();

/**
 * Picks the first listed archetype name that exists in the fantasy list.
 */
export function resolveNotableArchetype(role: SettlementNotableRoleDefinition): Archetype {
  for (const name of role.archetypeNames) {
    const a = archetypeByName.get(name);
    if (a) {
      return a;
    }
  }
  const fallback = archetypeByName.get('fighter');
  if (fallback) {
    return fallback;
  }
  return getAllFantasyArchetypes()[0]!;
}

function copyCharacterShallow(c: Character): Character {
  return {
    ...c,
    titles: [...(c.titles ?? [])],
    tags: [...c.tags],
    personalityTraits: [...c.personalityTraits],
    physicalTraits: [...c.physicalTraits],
    abilities: [...c.abilities],
    creatureTypes: [...c.creatureTypes],
    behaviors: [...c.behaviors],
  };
}

/**
 * Fills the importance template: `{settlement}`, `{characterPossessive}`.
 */
export function buildNotableImportance(
  role: SettlementNotableRoleDefinition,
  settlementName: string,
  character: Character,
): string {
  const poss = character.gender.pronouns.possessive;
  return role.importanceTemplate
    .replaceAll('{settlement}', settlementName)
    .replaceAll('{characterPossessive}', poss);
}

/**
 * Pushes the civic title, sets archetype, merges tags, and refreshes the long description.
 */
export function applyNotableRoleToCharacter(
  base: Character,
  role: SettlementNotableRoleDefinition,
  archetype: Archetype,
  rng: RNG,
): Character {
  const c = copyCharacterShallow(base);
  withPushedTitle(c, role.title);
  c.archetype = archetype;
  const tagSet = new Set(c.tags);
  for (const t of archetype.tags) {
    tagSet.add(t);
  }
  for (const t of archetype.addedTags ?? []) {
    tagSet.add(t);
  }
  c.tags = [...tagSet];
  c.description = describe(c, rng);
  return c;
}

/**
 * Primary public title (gender-aware) for display after the role mutator.
 */
export function getNotableRoleTitleDisplay(character: Character): string {
  return getTitle(character) || '';
}

export function salientNotableDetail(character: Character): {
  salientPersonality: string[];
  salientPhysical: string[];
} {
  return {
    salientPersonality: character.personalityTraits.slice(0, 2),
    salientPhysical: character.physicalTraits.slice(0, 2).map((t) => t.description),
  };
}
