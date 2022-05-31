'use strict';

import EncounterTemplate from '../encounters/template';
import RoomTheme from './roomtheme';

export default class DungeonTheme {
  name: string;
  weakEncounterTemplates: EncounterTemplate[];
  strongEncounterTemplates: EncounterTemplate[];
  bossEncounterTemplates: EncounterTemplate[];
  roomThemes: RoomTheme[];

  constructor(
    name: string,
    weak: EncounterTemplate[],
    strong: EncounterTemplate[],
    boss: EncounterTemplate[],
    roomThemes: RoomTheme[],
  ) {
    this.name = name;
    this.weakEncounterTemplates = weak;
    this.strongEncounterTemplates = strong;
    this.bossEncounterTemplates = boss;
    this.roomThemes = roomThemes;
  }
}
