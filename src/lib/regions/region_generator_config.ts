import type Culture from "$lib/culture/culture.js";
import type * as MUN from "@ironarachne/made-up-names";

export default interface RegionGeneratorConfig {
  nameGeneratorSet: MUN.GeneratorSet;
  dominantCulture: Culture | null;
  mapWidth: number;
  mapHeight: number;
  minRealms: number;
  maxRealms: number;
}
