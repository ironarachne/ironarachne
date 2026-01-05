import type RoomRequirement from '../rooms/roomrequirement.js';
import type RoomTheme from '../rooms/themes/theme.js';
import type EncounterTemplate from '$lib/encounters/encounter_template.js';
import type Species from '$lib/species/species.js';

export type DungeonTheme = {
  name: string;
  mainEnvironment: string;
  nameGeneratorPatterns: string[];
  weakEncounterTemplates: EncounterTemplate[];
  strongEncounterTemplates: EncounterTemplate[];
  bossEncounterTemplates: EncounterTemplate[];
  sentientOptions: Species[];
  flooringOptions: string[];
  roomThemes: RoomTheme[];
  requiredRooms: RoomRequirement[];
};
