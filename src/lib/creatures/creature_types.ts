import type { Ability } from '$lib/abilities';
import type { AgeCategory } from '$lib/age';
import type { Item } from '$lib/equipment';
import type { Gender } from '$lib/gender';
import type { Mob } from '$lib/mobs';
import type { PhysicalTrait } from '$lib/physical_traits';
import type { Relationship } from '$lib/relationships';
import type { Species } from '$lib/species';
import type { TaggedItem } from '$lib/tags';

export type CreatureGenerationConfig = {
  speciesOptions: Species[];
  ageCategoryNames: string[];
  genderNames: string[];
};

export type Creature = Mob &
  TaggedItem & {
    name: string;
    description: string;
    shortDescription: string;
    species: Species;
    abilities: Ability[];
    behaviors: string[];
    physicalTraits: PhysicalTrait[];
    gender: Gender;
    height: number;
    weight: number;
    length: number;
    age: number;
    ageCategory: AgeCategory;
    carried: Item[];
    creatureTypes: string[];
    relationships: Relationship[];
  };
