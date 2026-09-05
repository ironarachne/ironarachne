import type { CombatAction, CombatProfile } from '$lib/rulesets/ironarachne';
import type { MechanicsSet } from '$lib/rulesets';
import type { TaggedItem } from '$lib/tags';

export type Mob = TaggedItem & {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  /** Ruleset-qualified mechanics for persisted and composed actors. */
  mechanics?: MechanicsSet;
  /** Iron Arachne normalized combat data used by the live encounter generator. */
  combatProfile: CombatProfile;
  /** Iron Arachne normalized actions used by the live encounter generator. */
  actions: CombatAction[];
};

export type MobGroup = TaggedItem & {
  name?: string;
  description?: string;
  mobs: Mob[];
};
