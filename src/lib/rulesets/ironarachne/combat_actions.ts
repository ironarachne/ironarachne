import type { CombatAction } from './combat_types';

export function getDefaultCombatActions(): CombatAction[] {
  return [
    {
      name: 'basic attack',
      description: 'A simple melee attack.',
      type: 'attack',
      attackType: 'melee',
      damageType: 'bludgeoning',
      baseDamage: 1,
    },
  ];
}
