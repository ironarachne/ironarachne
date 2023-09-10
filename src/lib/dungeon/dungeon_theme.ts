import type EncounterTemplate from "$lib/encounters/template.js";
import type Species from "$lib/species/species.js";
import type * as MUN from "@ironarachne/made-up-names";
import type RoomRequirement from "./rooms/roomrequirement.js";
import type RoomTheme from "./rooms/themes/theme.js";

export default class DungeonTheme {
  name: string;
  mainEnvironment: string;
  nameGenerator: MUN.GenericNameGenerator;
  weakEncounterTemplates: EncounterTemplate[];
  strongEncounterTemplates: EncounterTemplate[];
  bossEncounterTemplates: EncounterTemplate[];
  sentientOptions: Species[];
  flooringOptions: string[];
  roomThemes: RoomTheme[];
  requiredRooms: RoomRequirement[];

  constructor(
    name: string,
    mainEnvironment: string,
    nameGenerator: MUN.GenericNameGenerator,
    weak: EncounterTemplate[],
    strong: EncounterTemplate[],
    boss: EncounterTemplate[],
    sentientOptions: Species[],
    flooringOptions: string[],
    roomThemes: RoomTheme[],
    requiredRooms: RoomRequirement[],
  ) {
    this.name = name;
    this.mainEnvironment = mainEnvironment;
    this.nameGenerator = nameGenerator;
    this.weakEncounterTemplates = weak;
    this.strongEncounterTemplates = strong;
    this.bossEncounterTemplates = boss;
    this.sentientOptions = sentientOptions; // TODO: figure out if this is still in use
    this.flooringOptions = flooringOptions;
    this.roomThemes = roomThemes;
    this.requiredRooms = requiredRooms;
  }
}
