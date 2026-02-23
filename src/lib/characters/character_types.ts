import type { Archetype } from "$lib/archetypes";
import type { Creature } from "$lib/creatures";
import type { Arms } from "$lib/heraldry/arms";
import type PhysicalTrait from "$lib/physical_traits/physical_trait";
import type Species from "$lib/species/species";
import type { TaggedItem } from "$lib/tags/tag_types";
import type { NameGenerator } from "@ironarachne/made-up-names";

export type CharacterGenerationConfig = {
  archetypeOptions?: Archetype[];
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
  physicalTraitOverrides?: PhysicalTrait[];
}

export type Character = Creature & {
  archetype?: Archetype;
  heraldry?: Arms;
  personalityTraits: string[];
  firstName: string;
  lastName: string;
  titles?: Title[];
  familyId?: string;
}

export type PersonalityTrait = {
  adjective: string;
  conflictingTraits?: string[];
}

export type Title = TaggedItem & {
  femaleTitle: string; // e.g., "Duchess"
  maleTitle: string; // e.g., "Duke"
  femaleHonorific: string; // e.g., "Grace", will be prefixed with a pronoun
  maleHonorific: string; // e.g., "Grace", will be prefixed with a pronoun
  hasLands: boolean;
  isHereditary: boolean;
  isNoble: boolean;
  isRoyal: boolean;
  landName: string;
  precedence: number;
}
