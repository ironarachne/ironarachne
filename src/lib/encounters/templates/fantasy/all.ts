import type EncounterTemplate from "../../encounter_template.js";
import * as Bandits from "./bandits.js";
import * as Cult from "./cult.js";
import * as GenericDungeon from "./generic_dungeon.js";
import * as Magic from "./magic.js";
import * as Martial from "./martial.js";
import * as Undead from "./undead.js";
import * as Wilderness from "./wilderness.js";

export function all(includeUndead: boolean): EncounterTemplate[] {
  let result: EncounterTemplate[] = [];

  result = result.concat(Bandits.all());
  result = result.concat(Cult.all());
  result = result.concat(GenericDungeon.all());
  result = result.concat(Magic.all());
  result = result.concat(Martial.all());
  result = result.concat(Wilderness.all());

  if (includeUndead) {
    result = result.concat(Undead.all());
  }

  return result;
}
