'use strict';

import EncounterTemplate from '../encounters/template';
import GenericNameGenerator from '../names/generators/generic';
import type Species from '../species/species';
import RoomRequirement from './rooms/roomrequirement';
import RoomTheme from './rooms/themes/theme';

export default class DungeonTheme {
  name: string;
  mainEnvironment: string;
  nameGenerator: GenericNameGenerator;
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
    nameGenerator: GenericNameGenerator,
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
