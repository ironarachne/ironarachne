import type { Ability } from '$lib/abilities';
import type { CombatAction } from '$lib/combat_system';
import type { EquipmentGenerationConfig } from '$lib/equipment';
import type { CasterProfile } from '$lib/magic';
import type { TaggedItem } from '$lib/tags';

export type Archetype = TaggedItem & {
  name: string;
  description: string;
  basePowerModifier: number;
  abilities: Ability[];
  actions: CombatAction[];
  casterProfile?: CasterProfile;
  equipmentGenerationConfigs: EquipmentGenerationConfig[];
  addedTags?: string[];
  removedTags?: string[];
};
