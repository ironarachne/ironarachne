import type { Archetype } from "$lib/archetypes";
import type { Creature } from "$lib/creatures";
import type { Device } from "$lib/heraldry/device"
import type Species from "$lib/species/species";
import type { TaggedItem } from "$lib/tags/tag_types";
import type { NameGenerator } from "@ironarachne/made-up-names";

export type CharacterGenerationConfig = {
  allowedArchetypeTags?: string[];
  disallowedArchetypeTags?: string[];
  allowedPersonalityTraitTags?: string[];
  disallowedPersonalityTraitTags?: string[];
  species: Species;
  allowedGenderNames?: string[];
  maleFirstNameGenerator: NameGenerator;
  femaleFirstNameGenerator: NameGenerator;
  familyNameGenerator: NameGenerator;
  allowedAgeCategoryNames?: string[];
  disallowedAgeCategoryNames?: string[];
}

export type Character = Creature & {
  archetype?: Archetype;
  heraldry?: Device;
  personalityTraits: string[];
  firstName: string;
  lastName: string;
  titles?: Title[];
  familyId?: string;
}

export type Family = TaggedItem & {
  id: string;
  name: string;
  description: string;
  members: string[]; // array of Character IDs
  head?: number; // index of the family head in members array
}

export type PersonalityTrait = {
  adjective: string;
  conflictingTraits?: string[];
}

export type Relationship = {
  characterAId: string;
  characterBId: string;
  relationshipType: string; // e.g., "ally", "rival", "sibling"
  description?: string;
}

export type Title = TaggedItem & {
  femaleTitle: string; // e.g., "Duchess"
  maleTitle: string; // e.g., "Duke"
  femaleHonorific: string; // e.g., "Grace", will be prefixed with a pronoun
  maleHonorific: string; // e.g., "Grace", will be prefixed with a pronoun
  hasLands: boolean;
  isHereditary: boolean;
  isNoble: boolean;
  landName: string;
  precedence: number;
}
