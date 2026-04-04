export type DamageType =
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'fire'
  | 'cold'
  | 'lightning'
  | 'acid'
  | 'poison'
  | 'psychic'
  | 'necrotic'
  | 'radiant'
  | 'force'
  | 'thunder'
  | 'sonic'
  | 'energy' // Generic sci-fi
  | 'plasma'
  | 'laser';

export type AttackType = 'melee' | 'ranged' | 'magic' | 'psionic';

export type DefenseType = 'armor' | 'dodge' | 'parry' | 'block' | 'shield' | 'magic_resistance';

export type Damage = {
  power: number;
  type: DamageType;
}

/**
 * Represents a generic combat profile for an entity or item.
 * Values are generally on a 1-100 scale where 50 is average for a competent human.
 */
export type CombatProfile = {
  attack: number; // Accuracy / Skill
  defense: number; // Evasion / Difficulty to hit
  power: number; // Raw damage potential
  resilience: number; // Damage reduction / Armor
  speed: number; // Initiative / Action speed
  health: number; // Hit points / Structural integrity
};

export type CombatAction = {
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'utility';
  attackType?: AttackType;
  damageType?: DamageType;
  baseDamage?: number;
  bonusDamage?: Damage[];
  range?: number; // in meters
};
