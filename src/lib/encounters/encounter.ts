import type MobGroup from "$lib/mobs/group.js";

export default interface Encounter {
  groups: MobGroup[];
  totalThreatLevel: number;
}
