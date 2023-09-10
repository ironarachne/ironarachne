import type * as MUN from "@ironarachne/made-up-names";
import type RealmType from "./realm_type.js";

export default interface RealmGeneratorConfig {
  nameGeneratorSet: MUN.GeneratorSet;
  realmTypes: RealmType[];
  mapTiles: number[][];
  mapWidth: number;
  mapHeight: number;
}
