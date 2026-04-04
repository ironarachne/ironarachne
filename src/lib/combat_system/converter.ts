import type { CombatProfile } from './types';
import { clamp, linearMap } from '$lib/math_translation';

const powerDiceMapping = [
  { threshold: 4, dice: '1d4' },
  { threshold: 6, dice: '1d6' },
  { threshold: 8, dice: '1d8' },
  { threshold: 10, dice: '1d10' },
  { threshold: 15, dice: '1d12' },
  { threshold: 20, dice: '2d6' },
  { threshold: 25, dice: '2d8' },
  { threshold: 30, dice: '2d10' },
  { threshold: 40, dice: '3d6' },
  { threshold: 50, dice: '3d8' },
  { threshold: 60, dice: '3d10' },
  { threshold: 80, dice: '4d6' },
  { threshold: 100, dice: '4d8' },
];

/**
 * Converts an abstract combat stat (0-100) to a D&D 5e Ability Score (3-24).
 */
export function convertToDnDAbilityScore(stat: number): number {
  return Math.round(linearMap(clamp(stat, 0, 100), 0, 100, 3, 24));
}

/**
 * Converts an abstract combat stat (0-100) to a D&D 5e Modifier (-5 to +10).
 */
export function convertToDnDModifier(stat: number): number {
  return Math.round(linearMap(clamp(stat, 0, 100), 0, 100, -5, 10));
}

/**
 * Converts abstract Defense (0-100) to D&D 5e Armor Class.
 */
export function convertToDnDArmorClass(defense: number): number {
  return Math.round(linearMap(clamp(defense, 0, 100), 0, 100, 10, 20));
}

/**
 * Converts abstract Power (0-100) to a dice expression (e.g. "2d6+1").
 * Prioritizes multiple dice for bell curves on higher values.
 */
export function convertPowerToDice(power: number): string {
  for (let i = powerDiceMapping.length - 1; i >= 0; i--) {
    if (power >= powerDiceMapping[i].threshold) {
      return powerDiceMapping[i].dice;
    }
  }

  return '1d4';
}

export function convertToDnD5e(profile: CombatProfile) {
  return {
    ac: convertToDnDArmorClass(profile.defense),
    toHit: convertToDnDModifier(profile.attack) + 2, // Assuming proficiency +2
    damageDice: convertPowerToDice(profile.power),
    hp: Math.max(1, Math.round(profile.health / 2)), // 50 health -> 25 HP?
    initiative: convertToDnDModifier(profile.speed),
  };
}
