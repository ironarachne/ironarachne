import type { Ability } from '$lib/abilities';
import type { CombatAction } from '$lib/rulesets/ironarachne';
import type { EquipmentGenerationConfig } from '$lib/equipment';
import type { CasterProfile } from '$lib/rulesets/ironarachne';
import type { MechanicsSet } from '$lib/rulesets';
import type { TaggedItem } from '$lib/tags';

export type Archetype = TaggedItem & {
  name: string;
  description: string;
  basePowerModifier: number;
  abilities: Ability[];
  /** Ruleset-qualified mechanics when the archetype is embedded in an actor snapshot. */
  mechanics?: MechanicsSet;
  /** Iron Arachne normalized actions used by the live character generator. */
  actions: CombatAction[];
  /** Iron Arachne normalized casting data used by the live character generator. */
  casterProfile?: CasterProfile;
  equipmentGenerationConfigs: EquipmentGenerationConfig[];
  addedTags?: string[];
  removedTags?: string[];
};
