import type { Character } from '$lib/characters';
import type { Creature } from '$lib/creatures';
import type { MobGroup } from '$lib/mobs';
import type { Mutator } from '$lib/mutator';
import type { Species } from '$lib/species';
import type { TagFilter, TaggedItem } from '$lib/tags';

export type Encounter = {
  name: string;
  description: string;
  difficulty: number; // 1-100 scale
  groups: MobGroup[];
};

export type EncounterGenerationConfig = {
  // TODO: add name generator config
  possibleTemplates: EncounterTemplate[];
  speciesOverride?: Species;
  forceUniformSpecies?: boolean;
};

export type EncounterTemplate = TaggedItem & {
  name: string;
  groupTemplates: EncounterGroupTemplate[];
};

export type EncounterGroupTemplate = {
  name: string;
  archetypeTagFilter: TagFilter;
  speciesTagFilter: TagFilter;
  hasUniformSpecies: boolean;
  characterMutators: Mutator<Character>[];
  creatureMutators: Mutator<Creature>[];
  speciesMutators: Mutator<Species>[];
  isSentient: boolean;
  minCount: number;
  maxCount: number;
};
