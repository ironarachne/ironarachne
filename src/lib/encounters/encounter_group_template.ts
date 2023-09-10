import type Archetype from "../archetypes/archetype.js";
import type MobFilter from "../mobs/filter.js";

export default interface EncounterGroupTemplate {
  name: string;
  threatLevel: number;
  isSentient: boolean;
  archetypes: Archetype[];
  filter: MobFilter;
  minNumber: number;
  maxNumber: number;
}
