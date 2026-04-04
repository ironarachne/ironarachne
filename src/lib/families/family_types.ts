import type { Relationship } from '$lib/relationships';
import type Species from '$lib/species/species';
import type { NameGenerator } from '@ironarachne/made-up-names';
import type { Character } from '$lib/characters/character_types';

export type FamilyGenerationConfig = {
  speciesOptions: Species[];
  familyNameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
  generations: number;
  minMembersPerGeneration: number;
  maxMembersPerGeneration: number;
  dominantGender?: string;
  allowSameGenderMarriage?: boolean;
  sameGenderMarriageChance?: number; // 0-1
  allowMultipleMarriages?: boolean;
  allowAdoption?: boolean;
  adoptionChance?: number; // 0-1
  multipleMarriageChance?: number; // 0-1
  allowIllegitimateChildren?: boolean;
  allowCrossSpeciesMarriages?: boolean; // whether to allow marriages between unbreedable species
  crossSpeciesMarriageChance?: number; // 0-1
  illegitimateChildChance?: number; // 0-1
  infantMortalityChance?: number; // 0-1
  fertilityChance?: number; // 0-1
};

export type Family = {
  id: string;
  name: string;
  headId?: string;
  members: Character[];
  memberIds: string[];
  relationships: Relationship[];
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
};
