import type EncounterGroupTemplate from "./encounter_group_template.js";

export default interface EncounterTemplate {
  name: string;
  threatLevel: number;
  groupTemplates: EncounterGroupTemplate[];
  tags: string[];
  commonality: number;
}
