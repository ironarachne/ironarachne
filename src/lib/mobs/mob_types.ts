import type { CombatAction, CombatProfile } from '$lib/combat_system';
import type { TaggedItem } from '$lib/tags';

export type Mob = TaggedItem & {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  combatProfile: CombatProfile;
  actions: CombatAction[];
};

export type MobGroup = TaggedItem & {
  name?: string;
  description?: string;
  mobs: Mob[];
};
