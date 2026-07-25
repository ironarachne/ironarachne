import type { Ability } from './ability_types';

export function getAbilityByName(name: string, abilities: Ability[]): Ability {
  const result = abilities.find((ability) => ability.name === name);

  if (result === undefined) {
    throw new Error(`Ability not found: ${name}`);
  }

  return result;
}
