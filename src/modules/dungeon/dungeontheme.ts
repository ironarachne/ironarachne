'use strict';

import EncounterTemplate from '../encounters/template';
import GenericNameGenerator from '../names/generators/generic';
import RoomTheme from './roomtheme';

export default class DungeonTheme {
  name: string;
  nameGenerator: GenericNameGenerator;
  weakEncounterTemplates: EncounterTemplate[];
  strongEncounterTemplates: EncounterTemplate[];
  bossEncounterTemplates: EncounterTemplate[];
  roomThemes: RoomTheme[];

  constructor(
    name: string,
    nameGenerator: GenericNameGenerator,
    weak: EncounterTemplate[],
    strong: EncounterTemplate[],
    boss: EncounterTemplate[],
    roomThemes: RoomTheme[],
  ) {
    this.name = name;
    this.nameGenerator = nameGenerator;
    this.weakEncounterTemplates = weak;
    this.strongEncounterTemplates = strong;
    this.bossEncounterTemplates = boss;
    this.roomThemes = roomThemes;
  }
}
