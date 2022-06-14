'use strict';

import EncounterTemplate from '../encounters/template';
import GenericNameGenerator from '../names/generators/generic';
import RoomRequirement from './rooms/roomrequirement';
import RoomTheme from './rooms/themes/theme';

export default class DungeonTheme {
  name: string;
  nameGenerator: GenericNameGenerator;
  weakEncounterTemplates: EncounterTemplate[];
  strongEncounterTemplates: EncounterTemplate[];
  bossEncounterTemplates: EncounterTemplate[];
  roomThemes: RoomTheme[];
  requiredRooms: RoomRequirement[];

  constructor(
    name: string,
    nameGenerator: GenericNameGenerator,
    weak: EncounterTemplate[],
    strong: EncounterTemplate[],
    boss: EncounterTemplate[],
    roomThemes: RoomTheme[],
    requiredRooms: RoomRequirement[],
  ) {
    this.name = name;
    this.nameGenerator = nameGenerator;
    this.weakEncounterTemplates = weak;
    this.strongEncounterTemplates = strong;
    this.bossEncounterTemplates = boss;
    this.roomThemes = roomThemes;
    this.requiredRooms = requiredRooms;
  }
}
