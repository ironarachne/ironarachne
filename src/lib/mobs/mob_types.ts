import type { CombatAction, CombatProfile } from '$lib/combat_system';
import type { MechanicsSet } from '$lib/rulesets';
import type { TaggedItem } from '$lib/tags';

export type Mob = TaggedItem & {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  /** Ruleset-qualified mechanics. Optional until the payload migrations in #209 land. */
  mechanics?: MechanicsSet;
  /** @deprecated Compatibility field for Iron Arachne mechanics; see #210 and #213. */
  combatProfile: CombatProfile;
  /** @deprecated Compatibility field for Iron Arachne mechanics; see #210 and #213. */
  actions: CombatAction[];
};

export type MobGroup = TaggedItem & {
  name?: string;
  description?: string;
  mobs: Mob[];
};
