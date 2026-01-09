import type { CombatProfile } from './types';

/**
 * Converts an abstract combat stat (0-100) to a D&D 5e Ability Score (1-30).
 * 50 is considered average (10).
 */
export function convertToDnDAbilityScore(stat: number): number {
  // 0 -> 1
  // 50 -> 10
  // 100 -> 20 (Standard cap) or 30 (Monster cap)
  // Let's map 50 to 10, and every 5 points is +1 score.
  // (stat - 50) / 5 + 10
  // 50 -> 10
  // 75 -> 15
  // 100 -> 20
  // 25 -> 5
  // 0 -> 0 (clamp to 1)

  const score = Math.floor((stat - 50) / 5) + 10;
  return Math.max(1, Math.min(30, score));
}

/**
 * Converts an abstract combat stat (0-100) to a D&D 5e Modifier (-5 to +10).
 */
export function convertToDnDModifier(stat: number): number {
  const score = convertToDnDAbilityScore(stat);
  return Math.floor((score - 10) / 2);
}

/**
 * Converts abstract Defense (0-100) to D&D 5e Armor Class.
 * 50 -> 10 (Unarmored commoner)
 */
export function convertToDnDArmorClass(defense: number): number {
  const ac = 10 + defense;

  return Math.max(1, ac);
}

/**
 * Converts abstract Power (0-100) to a dice expression (e.g. "2d6+1").
 * Prioritizes multiple dice for bell curves on higher values.
 */
export function convertPowerToDice(power: number): string {
  // For very low values, stick to single die
  if (power <= 4) return '1d4';
  if (power <= 6) return '1d6';
  if (power <= 8) return '1d8';
  if (power <= 10) return '1d10';

  // For higher values, try to fit multiple dice
  const diceOptions = [
    { sides: 6, avg: 3.5 },
    { sides: 8, avg: 4.5 },
    { sides: 10, avg: 5.5 },
    { sides: 4, avg: 2.5 },
    { sides: 12, avg: 6.5 },
  ];

  let bestFit = {
    sides: 6,
    count: 1,
    modifier: 0,
    diff: Infinity,
  };

  for (const die of diceOptions) {
    const count = Math.max(1, Math.round(power / die.avg));

    // Penalize excessive dice counts to avoid things like 5d4
    if (count > 4) continue;

    const baseTotal = count * die.avg;
    const modifier = Math.round(power - baseTotal);
    const diff = Math.abs(modifier);

    // Prefer smaller diff. Tie-break with d6 preference (index 0)
    if (diff < bestFit.diff) {
      bestFit = { sides: die.sides, count, modifier, diff };
    }
  }

  const modStr =
    bestFit.modifier === 0
      ? ''
      : bestFit.modifier > 0
        ? `+${bestFit.modifier}`
        : `${bestFit.modifier}`;

  const result = `${bestFit.count}d${bestFit.sides}${modStr}`;

  return result;
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
