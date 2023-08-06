"use strict";

import Creature from "../creatures/creature.js";
import * as FantasyCreatures from "../creatures/fantasy/all.js";
import * as FantasySpecies from "../species/fantasy.js";
import type Species from "../species/species.js";
import EncounterTemplate from "./template.js";

export default class EncounterGeneratorConfig {
  isHostile: boolean;
  template: EncounterTemplate | null;
  environment: string;
  sentientOptions: Species[];
  creatureOptions: Creature[];
  minThreatLevel: number;
  maxThreatLevel: number;

  constructor() {
    this.isHostile = true;
    this.environment = "forest";
    this.template = null;
    this.sentientOptions = FantasySpecies.all();
    this.creatureOptions = FantasyCreatures.all();
    this.minThreatLevel = 1;
    this.maxThreatLevel = 4;
  }
}
