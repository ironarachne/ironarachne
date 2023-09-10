import type Environment from "$lib/environment/environment.js";
import type * as MUN from "@ironarachne/made-up-names";

export default interface SettlementGeneratorConfig {
  environment: Environment;
  nameGenerator: MUN.Generator | null;
  size: string;
}
