import type Ability from "$lib/abilities/ability";
import type AgeCategory from "$lib/age/age_category.js";
import type Item from "$lib/equipment/item.js";
import type Gender from "$lib/gender.js";
import type PhysicalTrait from "$lib/physical_traits/physical_trait.js";
import type Species from "$lib/species/species.js";
import type StatBlock from "$lib/statblock";

export default interface Creature {
  name: string;
  description: string;
  summary: string;
  statBlock: StatBlock | null;
  species: Species;
  abilities: Ability[];
  behaviors: string[];
  threatLevel: number;
  physicalTraits: PhysicalTrait[];
  gender: Gender;
  height: number;
  weight: number;
  length: number;
  age: number;
  ageCategory: AgeCategory;
  carried: Item[];
  tags: string[];
  creatureTypes: string[];
}
