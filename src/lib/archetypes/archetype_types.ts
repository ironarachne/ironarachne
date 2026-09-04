import type { Ability } from '$lib/abilities';
import type { CombatAction } from '$lib/combat_system';
import type { EquipmentGenerationConfig } from '$lib/equipment';
import type { CasterProfile } from '$lib/magic';
import type { MechanicsSet } from '$lib/rulesets';
import type { TaggedItem } from '$lib/tags';

export type Archetype = TaggedItem & {
  name: string;
  description: string;
  basePowerModifier: number;
  abilities: Ability[];
  /** Ruleset-qualified mechanics. Optional until the payload migrations in #209 land. */
  mechanics?: MechanicsSet;
  /** @deprecated Compatibility field for Iron Arachne mechanics; see #210 and #213. */
  actions: CombatAction[];
  /** @deprecated Compatibility field for Iron Arachne mechanics; see #210 and #213. */
  casterProfile?: CasterProfile;
  equipmentGenerationConfigs: EquipmentGenerationConfig[];
  addedTags?: string[];
  removedTags?: string[];
};
