import type Mob from "./mob.js";

export default interface MobGroup {
  name: string;
  mobs: Mob[];
}
