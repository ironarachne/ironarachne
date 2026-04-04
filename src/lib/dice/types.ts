/**
 * DicePool is an interface that represents a collection of dice.
 */
export interface DicePool {
  d4: number;
  d6: number;
  d8: number;
  d10: number;
  d12: number;
  d20: number;
  d100: number;
  modifier: number;
  modifierType: string;
}
