import type { SpeciesFilter } from '$lib/species/filter.js';
import type Archetype from '../archetypes/archetype.js';

export default interface EncounterGroupTemplate {
  name: string;
  threatLevel: number;
  isSentient: boolean;
  archetypes: Archetype[];
  filter: SpeciesFilter;
  minNumber: number;
  maxNumber: number;
}
