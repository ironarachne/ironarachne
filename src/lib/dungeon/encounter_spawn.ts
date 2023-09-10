import type EncounterGeneratorConfig from "../encounters/encounter_generator_config.js";
import type TreasureSpawn from "./treasurespawn.js";

export default interface EncounterSpawn {
  minRoom: number;
  maxRoom: number;
  encounterConfig: EncounterGeneratorConfig;
  treasureSpawns: TreasureSpawn[];
}
