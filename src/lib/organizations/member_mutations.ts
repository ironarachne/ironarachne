import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import * as Characters from '$lib/characters';
import { createTitleFromCore } from '$lib/characters/titles.js';
import * as AgeCategories from '$lib/age/age_categories.js';
import type { RNG } from '@ironarachne/rng';
import { maxByOrder } from '$lib/hierarchy/ordered_levels.js';
import { validateChildToParent, validateIdToOrder } from '$lib/hierarchy';
import type { ChildToParent, IdToOrder } from '$lib/hierarchy/hierarchy_types.js';
import type { RoleId, OrganizationHierarchy } from './organization_types.js';

export type MemberMutationContext = {
  rng: RNG;
  baseCharacter: Character;
  characterConfig: CharacterGenerationConfig;
  roleId: RoleId;
  organizationName: string;
};

export type MemberMutator = (ctx: MemberMutationContext) => Character;

type TitleCoreInput = Parameters<typeof createTitleFromCore>[0];

/**
 * Pushes a title from core fields onto the character (mutates `titles` array in place).
 */
export function withPushedTitle(character: Character, core: TitleCoreInput): Character {
  if (!character.titles) {
    character.titles = [];
  }
  character.titles.push(createTitleFromCore(core));
  return character;
}

/**
 * Sets age category and re-clamps `age` to that category (mutates in place).
 */
export function withAgeCategoryName(
  character: Character,
  categoryName: string,
  _ctx: { rng: RNG; characterConfig: CharacterGenerationConfig },
): Character {
  const cat = AgeCategories.getCategoryFromName(categoryName, character.species.ageCategories);
  character.ageCategory = cat;
  character.age = _ctx.rng.int(cat.minAge, cat.maxAge);
  return character;
}

/**
 * Replaces species; re-picks age category for the new species.
 */
export function withSpecies(character: Character, species: Character['species'], rng: RNG): Character {
  character.species = species;
  const newCat =
    species.ageCategories.find((c) => c.name === character.ageCategory.name) ??
    rng.item(species.ageCategories);
  character.ageCategory = newCat;
  character.age = rng.int(newCat.minAge, newCat.maxAge);
  character.abilities = [...species.abilities];
  character.creatureTypes = [...species.creatureTypes];
  return character;
}

export function buildLeaderBlurb(leader: Character): string {
  const leaderTitle = Characters.getHighestPrecedenceTitle(leader.titles || []);
  let leaderHonorific = '';
  if (leaderTitle) {
    leaderHonorific = Characters.getHonorific(leader.gender.name, leaderTitle, leader.gender.pronouns);
  }
  return `They are led by ${leaderHonorific} ${leader.firstName} ${leader.lastName}. ${leader.description}`
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @returns Leader description string for the organization narrative block.
 */
export function describeLeaderForOrganization(leader: Character, _organizationName: string): string {
  return buildLeaderBlurb(leader);
}

/**
 * Picks the leader role from hierarchy maps (highest order value).
 */
export function leaderRoleIdFromHierarchy(
  childToParent: ChildToParent<RoleId>,
  idToOrder: IdToOrder<RoleId>,
): RoleId | null {
  const ids = new Set<RoleId>([...childToParent.keys(), ...idToOrder.keys()]);
  return maxByOrder(idToOrder, [...ids]);
}

/**
 * Validates hierarchy invariants (throws if invalid).
 */
export function assertValidOrganizationHierarchy(
  h: OrganizationHierarchy,
): void {
  const cpErrors = validateChildToParent(h.childToParent);
  if (cpErrors.length > 0) {
    throw new Error(`Invalid childToParent: ${JSON.stringify(cpErrors)}`);
  }
  const orderErrors = validateIdToOrder(h.idToOrder, { requireUniqueOrder: true });
  if (orderErrors.length > 0) {
    throw new Error(`Invalid idToOrder: ${JSON.stringify(orderErrors)}`);
  }
}
