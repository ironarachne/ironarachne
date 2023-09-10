import all from "$lib/species/all.js";
import * as CommonSpecies from "$lib/species/common.js";
import type Species from "$lib/species/species.js";
import type EncounterTemplate from "./encounter_template.js";

export default class EncounterGeneratorConfig {
  isHostile: boolean;
  template: EncounterTemplate | null;
  environment: string;
  sentientOptions: Species[];
  creatureOptions: Species[];
  minThreatLevel: number;
  maxThreatLevel: number;

  constructor() {
    this.isHostile = true;
    this.environment = "forest";
    this.template = null;
    this.sentientOptions = CommonSpecies.sentient();
    this.creatureOptions = CommonSpecies.withoutTag("sentient", all);
    this.minThreatLevel = 1;
    this.maxThreatLevel = 4;
  }
}
