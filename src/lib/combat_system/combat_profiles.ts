import type { CombatProfile } from './types';

export function getDefaultCombatProfile(): CombatProfile {
  return {
    health: 1,
    defense: 1,
    power: 1,
    speed: 1,
    attack: 1,
    resilience: 1,
  };
}
