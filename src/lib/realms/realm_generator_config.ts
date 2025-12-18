import type { NameGeneratorSet } from "$lib/names/index.js";
import type RealmType from "./realm_type.js";
import type { RNG } from "@ironarachne/rng";

export default interface RealmGeneratorConfig {
  nameGeneratorSet: NameGeneratorSet;
  realmTypes: RealmType[];
  mapTiles: number[][];
  mapWidth: number;
  mapHeight: number;
  rng: RNG;
}
