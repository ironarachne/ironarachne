import type Ability from "$lib/abilities/ability.js";
import type AgeCategory from "$lib/age/age_category.js";
import type Archetype from "$lib/archetypes/archetype.js";
import type Item from "$lib/equipment/item.js";
import type Gender from "$lib/gender/gender.js";
import type Arms from "../heraldry/arms.js";
import type PhysicalTrait from "../physical_traits/physical_trait.js";
import type Species from "../species/species.js";
import type StatBlock from "../statblock.js";
import type PersonalityTrait from "./personality/personality_trait.js";
import type Title from "./titles/title.js";

export default interface Character {
  titles: Title[];
  heraldry: Arms | null;
  archetype: Archetype;
  species: Species;
  description: string;
  summary: string;
  gender: Gender;
  age: number;
  ageCategory: AgeCategory;
  height: number;
  weight: number;
  traits: string[];
  personalityTraits: PersonalityTrait[];
  physicalTraits: PhysicalTrait[];
  name: string;
  firstName: string;
  lastName: string;
  status: string;
  statBlock: StatBlock | null;
  abilities: Ability[];
  carried: Item[];
  threatLevel: number;
  tags: string[];
}
