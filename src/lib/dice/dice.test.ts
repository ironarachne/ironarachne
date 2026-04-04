import { describe, it, expect } from 'vitest';
import * as Dice from './index';

describe('Dice', () => {
  it('should create a dice pool', () => {
    const pool = Dice.createDicePool();
    expect(pool.d4).toBe(0);
    expect(pool.d6).toBe(0);
    expect(pool.d8).toBe(0);
    expect(pool.d10).toBe(0);
    expect(pool.d12).toBe(0);
    expect(pool.d20).toBe(0);
    expect(pool.d100).toBe(0);
    expect(pool.modifier).toBe(0);
    expect(pool.modifierType).toBe('+');
  });

  it('should convert a string to a dice pool', () => {
    const pool = Dice.toDicePool('2d6+4');
    expect(pool.d6).toBe(2);
    expect(pool.modifier).toBe(4);
    expect(pool.modifierType).toBe('+');
  });

  it('should calculate the minimum result', () => {
    const pool = Dice.toDicePool('2d6+4');
    const min = Dice.getMinResult(pool);
    expect(min).toBe(6);
  });

  it('should calculate the maximum result', () => {
    const pool = Dice.toDicePool('2d6+4');
    const max = Dice.getMaxResult(pool);
    expect(max).toBe(16);
  });

  it('should calculate the average result', () => {
    const pool = Dice.toDicePool('2d6+4');
    const average = Dice.getAverageResult(pool);
    expect(average).toBe(11);
  });

  it('should describe a dice pool', () => {
    const pool = Dice.toDicePool('2d6+4');
    const description = Dice.describeDice(pool);
    expect(description).toBe('2d6+4');
  });

  it('should convert a range to a dice expression', () => {
    const pool = Dice.rangeToDiceExpression(10);
    expect(pool.d10).toBe(1);
  });

  it('should roll dice', () => {
    const result = Dice.roll('1d6');
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });

  it('should simplify a dice pool', () => {
    const pool = Dice.createDicePool();
    pool.d6 = 2;
    pool.d4 = 1;
    const simplified = Dice.simplify(pool);
    expect(simplified.d6).toBe(2);
    expect(simplified.d4).toBe(0);
  });

  it('should calculate power', () => {
    // 1d8 -> 8 (highest of 1..8)
    let pool = Dice.toDicePool('1d8');
    expect(Dice.getPower(pool)).toBe(8);

    // 2d6 -> 7 (most likely)
    pool = Dice.toDicePool('2d6');
    expect(Dice.getPower(pool)).toBe(7);

    // 3d6 -> 11 (highest of 10, 11)
    pool = Dice.toDicePool('3d6');
    expect(Dice.getPower(pool)).toBe(11);

    // 1d4 + 1d6 -> 7 (plateau 5,6,7)
    pool = Dice.toDicePool('1d4+1d6');
    expect(Dice.getPower(pool)).toBe(7);

    // 2d6 + 5 -> 12
    pool = Dice.toDicePool('2d6+5');
    expect(Dice.getPower(pool)).toBe(12);

    // 2d6 * 5 -> 35
    pool = Dice.toDicePool('2d6x5');
    expect(Dice.getPower(pool)).toBe(35);
  });

  it('should create dice pool from power', () => {
    // P=6, d6 -> 1d6
    let pool = Dice.getDicePoolFromPower(6, 6);
    expect(Dice.describeDice(pool)).toBe('1d6');

    // P=7, d6 -> 2d6
    pool = Dice.getDicePoolFromPower(7, 6);
    expect(Dice.describeDice(pool)).toBe('2d6');

    // P=8, d6 -> 2d6+1
    pool = Dice.getDicePoolFromPower(8, 6);
    expect(Dice.describeDice(pool)).toBe('2d6+1');

    // P=4, d4 -> 1d4
    pool = Dice.getDicePoolFromPower(4, 4);
    expect(Dice.describeDice(pool)).toBe('1d4');

    // P=11, d6 -> 3d6
    pool = Dice.getDicePoolFromPower(11, 6);
    expect(Dice.describeDice(pool)).toBe('3d6');

    // P=20, d6 -> 5d6+2 (18+2=20)
    pool = Dice.getDicePoolFromPower(20, 6);
    expect(Dice.describeDice(pool)).toBe('5d6+2');
  });
});
